import * as functions from 'firebase-functions';
import { rootRef } from '../../constants/refs';

export const cleanUpGamesHandler = async (context: functions.EventContext) => {
    const now = Date.now();
    const rootUpdate: any = {};
    // ROOMS

    const rooms = await rootRef.child('rooms').orderByChild('start').equalTo('start').once('value');
    rooms.forEach(room => {
        rootUpdate[`rooms/${room.key}`] = null;
    });


    // GAMES

    const fiveMinutesBefore = now - (5 * 60 * 1000);
    const games = await rootRef.child(`games`).orderByChild('updatedAt').startAt(0).endAt(fiveMinutesBefore).once('value');

    if (rooms.numChildren() === 0 && games.numChildren() === 0) {
        console.log('No rooms or games to remove.. skipping...');
        return;
    }


    console.log(`${games.numChildren()} found!`);

    const usersToLose: string[] = [];
    games.forEach(game => {
        const wasGameFinished = game.child('gameOver').exists();
        rootUpdate[`games/${game.key}`] = null;
        if (!wasGameFinished) {
            const players = game.child('players');
            players.forEach(player => {
                rootUpdate[`users/${player.key}/inGame`] = null;
                usersToLose.push(player.key as string);
            });
        }
    });

    for (const uid of usersToLose) {
        const userGamesPlayed = (await rootRef.child(`users/${uid}/gamesPlayed`).get()).val() || 0;
        rootUpdate[`users/${uid}/gamesPlayed`] = userGamesPlayed + 1;
    }

    await rootRef.update(rootUpdate);
    console.log(`Clean up games took ${Date.now() - now}`);
};

