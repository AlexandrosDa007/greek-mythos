import * as functions from 'firebase-functions';
import { rollDiceHandler } from './handlers/roll-dice-handler';
import { joinRoomHandler } from './handlers/join-room-handler';
import { startGameHandler } from './handlers/start-game-handler';
import { answerQuestionHandler } from './handlers/answer-question-handler';
import { acceptFriendInviteHandler } from './handlers/accept-friend-invite-handler';
import { searchUserHandler } from './handlers/search-user';
import { removeFriendHandler } from './handlers/remove-friend-handler';
import { deleteUserHandler } from './handlers/delete-user-handler';
import { getRewardHandler } from './handlers/get-reward-handler';
import { checkForAfkPlayersHandler } from './handlers/check-for-afk-players';
import { deleteRoomHandler } from './handlers/delete-room';
import { cleanUpGamesHandler } from './handlers/scheduled/clean-up-games';

global.console = functions.logger as any;

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


export const dbfs = functions.runWith({ memory: '2GB', timeoutSeconds: 30 });


export const rollDice = dbfs.https.onCall(rollDiceHandler);

export const joinRoom = dbfs.https.onCall(joinRoomHandler);

export const onStartGame = dbfs.database.ref(`rooms/{roomId}/start`).onCreate(startGameHandler);

// export const checkGameActivity = dbfs.https.onCall(checkGameActivityHandler);

export const checkForAfkPlayers = dbfs.database.ref(`games/{gameId}/checkForAfk/timestamp`).onWrite(checkForAfkPlayersHandler);

export const answerQuestion = dbfs.database.ref(`games/{gameId}/question/question/answer`).onWrite(answerQuestionHandler);

export const acceptOrDeclineFriend = dbfs.database.ref(`pendingFriendInvite/{userUid}/{friendUid}/accept`)
    .onCreate(acceptFriendInviteHandler);

export const searchUser = dbfs.https.onCall(searchUserHandler);

export const removeFriend = dbfs.https.onCall(removeFriendHandler);

export const deleteAccount = dbfs.auth.user().onDelete(deleteUserHandler);

export const getReward = dbfs.https.onCall(getRewardHandler);

export const cleanUpRoom = dbfs.database.ref(`rooms/{roomId}`).onDelete(deleteRoomHandler);

// export const leaveGame = dbfs.https.onCall(leaveGameHandler);

export const cleanUpGames = functions.pubsub.schedule('*/30 * * * *').onRun(cleanUpGamesHandler);
