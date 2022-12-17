import { https } from 'firebase-functions';
import { asyncError } from '../helpers/async-error';
import { rootRef } from '../constants/refs';

export const removeFriendHandler = (async (data: any, context: https.CallableContext) => {

    const uid = context.auth?.uid;
    const friendUid = data.friend;

    if (!uid || !friendUid) {
        return asyncError('no uid or friend Uid', { uid, friendUid });
    }

    const updateStuff: any = {};
    updateStuff[`${uid}/${friendUid}`] = null;
    updateStuff[`${friendUid}/${uid}`] = null;
    await rootRef.child(`userFriends`).update(updateStuff);

    return 'ok';

});
