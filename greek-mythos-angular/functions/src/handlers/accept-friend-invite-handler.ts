import { database, EventContext } from 'firebase-functions';
import { rootRef } from '../constants/refs';
import { asyncError } from '../helpers/async-error';

export const acceptFriendInviteHandler = (async (snapshot: database.DataSnapshot, context: EventContext) => {
    console.log('accepting or decling friend...');

    const uid = context.auth?.uid;
    const userUid = context.params.userUid;
    const friendUid = context.params.friendUid;
    console.log(uid);
    console.log(userUid);


    if (!uid || uid !== userUid) {
        return asyncError(`Wrong user ${uid}`);
    }
    const accept = snapshot.val();

    const updateStuff: any = {};

    if (accept === true) {
        updateStuff[`${userUid}/${friendUid}`] = true;
        updateStuff[`${friendUid}/${userUid}`] = true;
    }

    await Promise.all([
        rootRef.child(`pendingFriendInvite/${userUid}/${friendUid}`).set(null),
        rootRef.child(`userFriends`).update(updateStuff),
    ]);

    return 'ok';
});
