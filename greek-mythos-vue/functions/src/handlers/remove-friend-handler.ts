import { asyncError } from '../helpers/async-error';
import { rootRef } from '../constants/refs';
import { CallableHandler } from '../models/handlers';

export const removeFriendHandler: CallableHandler = (async (context) => {

    const uid = context.auth?.uid;
    const friendUid = context.data.friend;

    if (!uid || !friendUid) {
        return asyncError('no uid or friend Uid', { uid, friendUid });
    }

    const updateStuff: any = {};
    updateStuff[`${uid}/${friendUid}`] = null;
    updateStuff[`${friendUid}/${uid}`] = null;
    await rootRef.child(`userFriends`).update(updateStuff);

    return 'ok';

});
