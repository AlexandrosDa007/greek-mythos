import { rootRef } from '../constants/refs';
import { objectKeys } from '../helpers/object-keys-values';
import { DeletedHandler } from '../models/handlers';

export const deleteRoomHandler: DeletedHandler<'rooms/{roomId}'> = async (event) => {
    const roomId = event.params.roomId;
    const players = event.data.child('players').val();
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

