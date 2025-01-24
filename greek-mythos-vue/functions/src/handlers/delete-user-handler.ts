import { asyncError } from '../helpers/async-error';
import { bucketRef, rootRef } from '../constants/refs';

export const deleteUserHandler = (async (user: any, context: any) => {
    const uid = user.uid;
    console.log(`Trying to delete user ${uid}`);

    const isUserInGame = (await rootRef.child(`users/${uid}/inGame`).get()).exists();

    if (isUserInGame) {
        return asyncError('Cannot delete user, he is in game', { uid });
    }

    const userFriendsRef = await rootRef.child(`userFriends/${uid}`).once('value');

    const updateStuff: any = {};
    userFriendsRef.forEach(friend => {
        updateStuff[`userFriends/${friend.key}/${uid}`] = null;
    });

    updateStuff[`userFriends/${uid}`] = null;


    // Remove user profile
    try {

        await rootRef.child(`users/${uid}`).remove();
        console.log('Removed user profile');

    } catch (error) {
        console.error(`Error removing user ${uid}` + error);
        return asyncError('Error when removing user profile');
    }
    try {

        const profileImageRefJpg = bucketRef.file(`users/${uid}/profile.jpg`);
        const profileImageRefPng = bucketRef.file(`users/${uid}/profile.png`);
        const userHasProfileImageJpg = await profileImageRefJpg.exists();
        const userHasProfileImagePng = await profileImageRefPng.exists();
        console.log(userHasProfileImageJpg);
        console.log(userHasProfileImagePng);
        if (userHasProfileImageJpg[0]) {
            await profileImageRefJpg.delete();
            console.log(`User's profile Image jpg was deleted!`);
        }
        else if (userHasProfileImagePng[0]) {
            await profileImageRefPng.delete();
            console.log(`User's profile Image png was deleted!`);
        }

    } catch (error) {
        console.error(`Error deleting profileImage  ` + error);
        return asyncError('Error when removing user image');
    }
    await rootRef.update(updateStuff);
    console.log(`User ${uid} was successfully removed`);

    return 'ok';
});
