import { https } from 'firebase-functions';
import { Game, GameEvent, GameQuestion, Player } from '../models/game';
import { getCurrentPlayerUid, removePlayerFromGame } from '../helpers/remove-player-from-game';
import { asyncError } from '../helpers/async-error';
import { rootRef } from '../constants/refs';
import { SERVER_TIMESTAMP } from '../constants/timestamp';

export const leaveGameHandler = (async (data: any, context: https.CallableContext) => {
    const uid = context.auth?.uid;
    const gameId = data?.gameId;

    if (!uid || !gameId) {
        return asyncError('no uid or gameId', { uid, gameId });
    }

    const game: Game = (await rootRef.child(`games/${gameId}`).once('value')).val();

    if (!game.players[uid]) {
        return asyncError('IMPORTANT user is not part of this game', { uid, game });
    }

    await rootRef.child(`games/${gameId}`)
        .transaction(
            (oldData) => {
                if (!oldData) { return oldData; }
                const player = oldData.players[uid] as Player;
                const turnIndex = oldData.turnIndex as number;
                const gameEvent = oldData.gameEvent as GameEvent;
                const question = oldData.question as GameQuestion;
                if (!player) { return oldData; }

                const isMyTurn = turnIndex === player.turnIndex;
                const isMyGameEvent = gameEvent?.playerUid === uid;
                const isMyQuestion = question?.playerUid === uid;

                if (isMyTurn) {
                    // change turn
                    oldData.turnIndex++;
                    if (oldData.turnIndex > oldData.players.length - 1) {
                        oldData.turnIndex = 0;
                    }
                    const currentPlayerUid = getCurrentPlayerUid(oldData);
                    if (!currentPlayerUid) { return; }

                    const newPlayers = removePlayerFromGame(oldData, uid);
                    const newTurnIndex = newPlayers[currentPlayerUid].turnIndex;
                    oldData.turnIndex = newTurnIndex;
                    oldData.players = newPlayers;
                    oldData.updatedAt = SERVER_TIMESTAMP;
                    if (isMyGameEvent || isMyQuestion) {
                        // There is a gameEvent or questiona and its mine
                        oldData.gameEvent = null;
                        oldData.question = null;
                    }
                    return oldData;
                } else {
                    if (isMyGameEvent || isMyQuestion) {
                        // There is a gameEvent or questiona and its mine
                        oldData.gameEvent = null;
                        oldData.question = null;
                        oldData.updatedAt = SERVER_TIMESTAMP;
                    }
                    return oldData;
                }
            },
            (error, committed, snapshot) => {
                if (error) {
                    console.error('Error on leaving game', error);
                }
                if (committed) {
                    console.log(`User ${game.players[uid].displayName} left the game!`);
                } else {
                    console.log(`User ${game.players[uid].displayName} already left the game!`);
                }
            });

    return 'ok';

});



