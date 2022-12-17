import * as admin from 'firebase-admin';
import { https } from 'firebase-functions';
import { objectKeys } from '../helpers/object-keys-values';
import { Game } from '../models/game';

/**
 * @deprecated This is not used anymore...
 */
export const checkGameActivityHandler = (async (data: any, context: https.CallableContext) => {
    const gameId = data.gameId;
    console.log(gameId);

    const uid = context.auth?.uid;
    if (typeof gameId !== 'string' || !uid) {
        return 'error';
    }


    const gameRef = admin.database().ref(`games/${gameId}`);

    const game: Game = (await gameRef.once('value')).val();

    if (!game) {
        // game does not exist
        return 'error';
    }

    if (!game.players[uid]) {
        return 'error';
    }
    const now = Date.now();
    const updatedAt = game.updatedAt;

    const res = now - updatedAt; // in milli
    console.log('result is ', res);
    if (res > 300000) { // if game has been inactive for more than 300seconds
        // remove game
        console.log('removing game');
        await gameRef.remove();
        const playerUids = objectKeys(game.players);
        const updateUsers: any = {};


        // read users
        const users: any = {};
        for (const playerUid of playerUids) {
            users[playerUid] = (await admin.database().ref(`users/${playerUid}`).once('value')).val();
        }

        playerUids.forEach(playerUid => {
            updateUsers[`${playerUid}/gamesPlayed`] = users[playerUid].gamesPlayed ? users[playerUid].gamesPlayed + 1 : 1;
            updateUsers[`${playerUid}/inGame`] = null;
        });
        await admin.database().ref(`users`).update(updateUsers);

        return 'ok';
    }

    return 'ok';
});
