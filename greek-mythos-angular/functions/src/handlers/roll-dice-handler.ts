import { https } from 'firebase-functions';
import { rootRef } from '../constants/refs';
import { SERVER_TIMESTAMP } from '../constants/timestamp';
import { asyncError } from '../helpers/async-error';
import { getPositionAfterEnd } from '../helpers/get-position-after-end';
import { objectKeys, objectKVs } from '../helpers/object-keys-values';
import { EVENTS_MAP_BIG, EVENTS_MAP_SMALL, QUESTIONS_MAP_BIG, QUESTIONS_MAP_SMALL } from '../helpers/question-event-maps';
import { Game, GameEvent, GameQuestion, Question } from '../models/game';
const MersenneTwister = require('mersenne-twister');
const generator = new MersenneTwister();


export const rollDiceHandler = (async (data: any, context: https.CallableContext) => {
    // check if this is the users turn
    const uid = context.auth?.uid;
    if (!uid || uid !== data.uid) {
        return asyncError('No uid', { uid });
    }


    const gameId = data.game.id;
    const game: Game = (await rootRef.child(`games/${gameId}`).once('value')).val();

    if (!game || !game.players[uid]) {
        return asyncError('no game or player is not in the game', { uid });
    }

    if (game.gameEvent) {
        // something went wrong
        return asyncError('Game event is present', { game });
    }

    // TODO: send email?
    if (game.gameOver) {
        console.log('Game was over!! writing error');
        await rootRef.child(`gameErrors/${gameId}`).set({
            gameSnapshot: game,
            timestamp: SERVER_TIMESTAMP,
            calledBy: uid,
        });
        await rootRef.child(`games/${gameId}`).remove();
        return 'error';
    }

    const players = objectKVs(game.players);
    const updateStuff: any = {};


    // Remove question and asnwer if there was one on previous state
    if (game.question) {
        if (!['finishedM', 'finishedP', 'skipped', 'failedP', 'failedM'].includes(game.question.state)) {
            return asyncError('Wrong question state', { question: game.question });
        }
        updateStuff[`question`] = null;
    }

    let currentPlayerUid = '';
    players.forEach(player => {
        if (player.value.turnIndex === game.turnIndex) {
            currentPlayerUid = player.key as string;
            return;
        }
    });

    if (currentPlayerUid === '' || currentPlayerUid !== uid) {
        return asyncError('no current player found');
    }
    const oldPosition = game.players[currentPlayerUid].position;
    updateStuff[`players/${uid}/oldPosition`] = oldPosition;

    const getRandomNumber = (min: number, max: number) => {
        return min + Math.floor(generator.random() * max);
    }

    // current player must move
    // change turn
    const newTurnIndex = (game.turnIndex + 1) > players.length - 1 ? 0 : game.turnIndex + 1;
    // Generate random number 1 - 6
    const randomNumber = getRandomNumber(1, 6);
    let newPos = oldPosition + randomNumber;

    let gameOver = false;
    const lastPosition = game.isSmall ? 49 : 100;
    const hasEnoughtPoints = game.players[uid].points >= game.minPoints;

    if (newPos >= lastPosition) {
        newPos = lastPosition;
        if (hasEnoughtPoints) {
            updateStuff[`gameOver/${uid}`] = game.players[uid].displayName;
            // put stuff to players
            const playersUids = objectKeys(game.players);
            const users: any = {};
            for (const playerUid of playersUids) {
                users[playerUid] = (await rootRef.child(`users/${playerUid}`).once('value')).val();
            }
            const updateUsers: any = {};
            playersUids.forEach(userUid => {
                updateUsers[`${userUid}/gamesPlayed`] = users[userUid].gamesPlayed ? users[userUid].gamesPlayed + 1 : 1;
                updateUsers[`${userUid}/inGame`] = null;
            });
            // give the win
            updateUsers[`${uid}/gamesWon`] = users[uid].gamesWon ? users[uid].gamesWon + 1 : 1;
            await rootRef.child(`users`).update(updateUsers);
            gameOver = true;
        } else {
            // handle it
            const update = hasReachedEndWithoutPoints(game, uid, newTurnIndex);
            update[`diceResult`] = randomNumber;
            await rootRef.child(`games/${game.id}`).update(update);
            return randomNumber;
        }
    }

    updateStuff[`players/${currentPlayerUid}/position`] = newPos;


    updateStuff[`turnIndex`] = gameOver ? -1000 : newTurnIndex;

    // Get is Event or question
    const { isEvent, isQuestion } = isQuestionOrEvent(game.isSmall, newPos);
    // find random question.

    if (isQuestion && !gameOver) {
        const randomQ = getRandomNumber(0, 100);
        // TODO: save which questions have been used
        const question: Question = (await rootRef.child(`questions/question_${randomQ}`).once('value')).val();

        updateStuff[`question`] = { playerUid: uid, question, state: 'waitingAns' } as GameQuestion;
        updateStuff[`nextTurn`] = newTurnIndex; // just for server
        updateStuff[`turnIndex`] = game.turnIndex; // put old one
    } else if (isEvent && !gameOver) {
        const randomEv = getRandomNumber(1, 14);
        const randomEvent = (await rootRef.child(`gameEvents/gameEvent_${randomEv}`).once('value')).val();
        const points = game.players[uid].points;
        // make the player's points to not go below 0
        if (randomEvent?.points < 0) {
            const eventPoints = randomEvent.points;
            if (points < Math.abs(eventPoints)) {
                randomEvent.points = -points;
            }
        }
        updateStuff[`gameEvent`] = { ...randomEvent, playerUid: uid };
        updateStuff[`nextTurn`] = newTurnIndex; // just for server -- TODO: add this when answering game event
        updateStuff[`turnIndex`] = game.turnIndex; // put old one
    }

    updateStuff[`diceResult`] = randomNumber;
    updateStuff[`updatedAt`] = SERVER_TIMESTAMP;
    await rootRef.child(`games/${game.id}`).update(updateStuff);
    return randomNumber;
});

export function hasReachedEndWithoutPoints(game: Game, uid: string, nextTurnIndex: number): any {
    const updateStuff: any = {};
    const customEvent: GameEvent = { ...CUSTOM_EVENT };
    const newPlayerPosition = getPositionAfterEnd(game, uid);
    customEvent.playerUid = uid;
    customEvent.step = game.isSmall ? (newPlayerPosition - 49) : (newPlayerPosition - 100);
    customEvent.text = `Ο χρήστης ${game.players[uid].displayName} έφτασε στο τέλος αλλά δεν μάζεψε αρκετούς πόντους,
    οπότε γυρίζει πίσω για να προσπαθήσει ξανά!`;
    updateStuff[`turnIndex`] = game.turnIndex;
    updateStuff[`nextTurn`] = nextTurnIndex;
    updateStuff[`gameEvent`] = { ...customEvent, playerUid: uid };
    updateStuff[`updatedAt`] = SERVER_TIMESTAMP;
    updateStuff[`players/${uid}/position`] = game.isSmall ? 49 : 100;
    return updateStuff;
}

export const CUSTOM_EVENT: GameEvent = {
    id: 'gameEvent_CUSTOM',
    isGood: false,
    playerUid: '',
    text: '',
};


export const isQuestionOrEvent = (isSmall: boolean, position: number) => {
    let isEvent = false;
    let isQuestion = false;
    if (isSmall) {
        QUESTIONS_MAP_SMALL.forEach(q => {
            if (position === q) {
                isQuestion = true;
                return;
            }
        });

        EVENTS_MAP_SMALL.forEach(e => {
            if (position === e) {
                isEvent = true;
                return;
            }
        });
    } else {
        QUESTIONS_MAP_BIG.forEach(q => {
            if (position === q) {
                isQuestion = true;
                return;
            }
        });
        EVENTS_MAP_BIG.forEach(e => {
            if (position === e) {
                isEvent = true;
                return;
            }
        });
    }

    return { isEvent, isQuestion };
};
