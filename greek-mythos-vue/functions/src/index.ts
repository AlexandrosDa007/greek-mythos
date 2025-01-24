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
// import { cleanUpGamesHandler } from './handlers/scheduled/clean-up-games';
import { logger, https, database } from 'firebase-functions/v2';
import { auth} from 'firebase-functions/v1';
import { CallableHandler } from './models/handlers';

global.console = logger as any;

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


const onCallWrapper = (callback: CallableHandler) => {
    return https.onCall({
        memory: '2GiB',
        timeoutSeconds: 30,
    }, callback);
}


export const rollDice = onCallWrapper(rollDiceHandler);

export const joinRoom = onCallWrapper(joinRoomHandler);

export const onStartGame = database.onValueCreated('rooms/{roomId}/start', startGameHandler);

// export const checkGameActivity = dbfs.https.onCall(checkGameActivityHandler);

export const checkForAfkPlayers = database.onValueWritten(`games/{gameId}/checkForAfk/timestamp`,checkForAfkPlayersHandler);

export const answerQuestion = database.onValueWritten(`games/{gameId}/question/question/answer`,answerQuestionHandler);

export const acceptOrDeclineFriend = database.onValueCreated(`pendingFriendInvite/{userUid}/{friendUid}/accept`, acceptFriendInviteHandler);

export const searchUser = onCallWrapper(searchUserHandler);

export const removeFriend = onCallWrapper(removeFriendHandler); 

export const deleteAccount = auth.user().onDelete(deleteUserHandler);

export const getReward = onCallWrapper(getRewardHandler);

export const cleanUpRoom = database.onValueDeleted(`rooms/{roomId}`,deleteRoomHandler);

// export const leaveGame = dbfs.https.onCall(leaveGameHandler);

// TODO: do pubsub
// export const cleanUpGames = functions.pubsub.schedule('*/30 * * * *').onRun(cleanUpGamesHandler);
