import * as functions from 'firebase-functions';
import { rootRef } from '../constants/refs';
import { SERVER_TIMESTAMP } from '../constants/timestamp';
import { asyncError } from '../helpers/async-error';
import { objectKeys, objectKVs } from '../helpers/object-keys-values';
import { shuffle } from '../helpers/shuffle';
import { Game } from '../models/game';
export const startGameHandler = (async (change: functions.database.DataSnapshot, context: functions.EventContext) => {

    const uid = context.auth?.uid;
    const roomId: string = context.params.roomId;
    console.log(`Starting game for room => ${roomId}`);

    if (!uid) {
        return asyncError('No uid');
    }

    const room = (await rootRef.child(`rooms/${roomId}`).once('value')).val();

    // TODO: possible database ghosting
    if (room.actP < 2) {
        return asyncError('Not enough players for game to start');
    }

    if (objectKeys(room.players).some(playerKey => room.players[playerKey].ready !== true)) {
        console.error(`Someone was not ready!`);
        return asyncError('Cannot start game players are not ready');
    }

    const gameInvites = (await rootRef.child(`pendingGameInvites/${uid}`).once('value')).val();
    const friendsInvited = objectKeys(gameInvites);

    const updateStuff: any = {};
    friendsInvited.forEach(friend => {
        updateStuff[`gameInvites/${uid}/${friend}`] = null;
        updateStuff[`gameInvites/${friend}/${uid}`] = null;
        updateStuff[`pendingGameInvites/${uid}/${friend}`] = null;
        updateStuff[`pendingGameInvites/${friend}/${uid}`] = null;
    });

    await rootRef.update(updateStuff);

    const gameId = roomId.replace('room_', 'game_');

    const pl: any = {};

    const kvs = objectKVs(room.players);
    const shuffled: any[] = shuffle(kvs);
    shuffled.forEach((player, index) => {
        pl[player.key] = {
            uid: player.value.uid,
            displayName: player.value.displayName,
            hero: player.value.hero,
            position: 1,
            turnIndex: index,
            points: 0,
            helpUsed: {
                help_50: 0,
                skip: 0,
            },
            imageUrl: player.imageUrl ?? null,
        };
    });

    const game: Game = {
        id: gameId,
        createdAt: SERVER_TIMESTAMP,
        updatedAt: SERVER_TIMESTAMP,
        players: pl,
        isSmall: room.isSmall,
        turnIndex: 0,
        minPoints: room.minPoints ?? 200,
        maxHelps: room.maxHelps ?? {
            help_50: 3,
            skip: 2,
        },
    };


    await rootRef.child(`games/${gameId}`).set(game);

    const updateUsers: any = {};
    const userUids = objectKeys(game.players);

    userUids.forEach(user => {
        updateUsers[`${user}/inGame`] = {
            gameId,
            timestamp: SERVER_TIMESTAMP,
        };
    });

    await rootRef.child(`users`).update(updateUsers);

    await rootRef.child(`rooms/${roomId}`).update({ start: 'start' });

    console.log(`Starting game => ${gameId}`);

    return 'ok';

});
