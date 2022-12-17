import * as functions from 'firebase-functions';
import { rootRef } from '../constants/refs';
import { objectKeys } from '../helpers/object-keys-values';

export const deleteRoomHandler = async (snapshot: functions.database.DataSnapshot, context: functions.EventContext) => {
    const roomId = context.params.roomId;
    const players = snapshot.child('players').val();
    const playerUids = objectKeys(players);


    const rootUpdate: any = {};


    for (const playerUid of playerUids) {
        const gameInvites = (await rootRef.child(`pendingGameInvites/${playerUid}`).once('value')).val();

        objectKeys(gameInvites).forEach(uid => {
            if (gameInvites[uid].roomId === roomId) {
                rootUpdate[`gameInvites/${uid}/${playerUid}`] = null;
                rootUpdate[`pendingGameInvites/${playerUid}/${uid}`] = null;
            }
        });
    }


    await rootRef.update(rootUpdate);
};

