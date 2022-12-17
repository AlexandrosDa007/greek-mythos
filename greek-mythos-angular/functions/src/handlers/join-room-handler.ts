import { https } from 'firebase-functions';
import { rootRef } from '../constants/refs';
import { asyncError } from '../helpers/async-error';


export const joinRoomHandler = (async (data: any, context: https.CallableContext) => {
    console.log('Join room', data);

    const uid = context.auth?.uid;

    if (!uid) {
        return asyncError('No uid');
    }
    const userProfile = (await rootRef.child(`users/${uid}`).once('value')).val();
    if (userProfile.uid !== uid) {
        return asyncError('No user profile!', { uid });
    }

    // TODO: check if already in room

    if (userProfile.inGame) {
        return asyncError('Player is in game', { uid });
    }

    const roomId = data.roomId;
    let result = '';
    await rootRef.child(`rooms/${roomId}`).transaction((oldData) => {
        if (oldData === null) { return oldData; }
        if (oldData.actP < oldData.max) {
            const newData = { ...oldData };
            newData.players[userProfile.uid] = {
                uid: userProfile.uid,
                displayName: userProfile.displayName,
                position: 1,
                imageUrl: userProfile.imageUrl ?? null,
            };
            newData.actP++;
            return newData;
        }

    }, (error, committed, snapshot) => {
        if (error) {
            console.log('error occurred');
            result = 'error';

        } else if (!committed) {
            console.log('no room...');
            result = 'no room';

        } else {
            console.log('join success');
            result = 'ok';

        }
    });

    return result;
});
