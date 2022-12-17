import { https } from 'firebase-functions';
import { Game, QuestionReward } from '../models/game';
import { SERVER_TIMESTAMP } from '../constants/timestamp';
import { objectKeys } from '../helpers/object-keys-values';
import { hasReachedEndWithoutPoints } from './roll-dice-handler';
import { asyncError } from '../helpers/async-error';
import { rootRef } from '../constants/refs';


const diffToMove = {
    'easy': 1,
    'medium': 2,
    'hard': 3,
};

export const getRewardHandler = (async (data: any, context: https.CallableContext) => {
    const uid = context.auth?.uid;
    const gameId = data.gameId;
    const reward = data.reward as QuestionReward;

    if (!uid || !gameId || !reward) {
        return asyncError('No correct data provided!', { uid, gameId, reward });
    }
    if (reward !== 'move' && reward !== 'points' && reward !== 'go_back' && reward !== 'remove_points') {
        return asyncError('No correct reward provided', { reward });
    }
    const game: Game = (await rootRef.child(`games/${gameId}`).once('value')).val();
    if (!game || !game.question || game.question.playerUid !== uid) {
        return asyncError('No correct game', { game });
    }
    const questionState = game.question.state;
    if (questionState !== 'answered' && questionState !== 'failed') {
        return asyncError('No correct question state', { questionState });
    }

    const oldPoints = game.players[uid].points;
    const oldPosition = game.players[uid].oldPosition;
    const playerPosition = game.players[uid].position;
    const questionPoints = game.question.question.qPoints;
    if (reward === 'remove_points' && (oldPoints - questionPoints) < 0) {
        // something went wrong maybe hack
        return asyncError('Not enough points', { questionPoints });
    }
    if (!oldPosition) {
        console.error(`This should not happen!`);
        return asyncError('No old position provide');
    }
    if (!game.question?.question.diff) {
        return asyncError('No question diff');
    }
    const MOVE_STEP = diffToMove[game.question?.question.diff || 'easy'];
    console.log('Move step', MOVE_STEP);

    let updateGame: any = {};
    updateGame[`turnIndex`] = game.nextTurn;
    updateGame[`nextTurn`] = null;
    if (reward === 'move' || reward === 'go_back') {
        // Go MOVE_STEP front or return to position from when you rolled dice
        const newPos = reward === 'move' ? (playerPosition + MOVE_STEP) : oldPosition;
        // check if reached end
        const reachEndUpdate = await reachedEnd(uid, newPos, game);
        updateGame = { ...updateGame, ...reachEndUpdate };
        updateGame[`question/state`] = reward === 'move' ? 'finishedM' : 'failedM';
    } else if (reward === 'points' || reward === 'remove_points') {
        const newPoints = reward === 'points' ? (oldPoints + questionPoints) : (oldPoints - questionPoints);
        if (newPoints < 0) { return asyncError('IMPORTANT: negative points', newPoints); } // for some reason.
        updateGame[`question/state`] = reward === 'points' ? 'finishedP' : 'failedP';
        updateGame[`players/${uid}/points`] = newPoints;
    }

    updateGame[`updatedAt`] = SERVER_TIMESTAMP;
    console.log('updateGame', updateGame);
    await rootRef.child(`games/${gameId}`).update(updateGame);
    return 'ok';
});


export async function reachedEnd(uid: string, position: number, game: Game): Promise<any> {
    const lastPosition = game.isSmall ? 49 : 100;
    const hasEnoughtPoints = game.players[uid].points >= game.minPoints;
    let newPos = position;
    const updateStuff: any = {};
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
        } else {
            // game nextTurn is not undefined if there is a question!
            if (game.nextTurn === undefined || game.nextTurn === null) {
                console.error(`This should not happen! game nextTurn is empty??`);
                return {};
            }
            return hasReachedEndWithoutPoints(game, uid, game.nextTurn);
            // await admin.database().ref(`games/${game.id}`).update(update);
        }
    }
    updateStuff[`players/${uid}/position`] = newPos;
    return updateStuff;
}
