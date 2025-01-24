import { rootRef } from '../constants/refs';
import { asyncError } from '../helpers/async-error';
import { CreatedHandler } from '../models/handlers';

export const acceptFriendInviteHandler: CreatedHandler<'pendingFriendInvite/{userUid}/{friendUid}/accept'> = (async (event) => {
    console.log('accepting or decling friend...');

    const userUid = event.params.userUid;
    const friendUid = event.params.friendUid;
    console.log(userUid);


    if (friendUid === userUid) {
        return asyncError(`Wrong user id`);
    }
    const accept = event.data.val();

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
