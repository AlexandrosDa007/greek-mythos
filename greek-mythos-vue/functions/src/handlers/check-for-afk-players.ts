import { rootRef } from '../constants/refs';
import { SERVER_TIMESTAMP } from '../constants/timestamp';
import { asyncError } from '../helpers/async-error';
import { objectKeys, objectKVs } from '../helpers/object-keys-values';
import { removePlayerFromGame } from '../helpers/remove-player-from-game';
import { Game } from '../models/game';
import { WrittenHandler } from '../models/handlers';

export const AFK_TIMER = 90; // after 90 seconds you are inactive

 
export const checkForAfkPlayersHandler: WrittenHandler<'games/{gameId}/checkForAfk/timestamp'> = (async (event) => {
    const gameId = event.params.gameId;

    if (typeof gameId !== 'string') {
        return asyncError('Wrong data provided!');
    }

    const gameRef = rootRef.child(`games/${gameId}`);

    const game: Game = (await gameRef.once('value')).val();

    if (!game) {
        return asyncError('There is no game');
    }

    
    const now = Date.now();
    const updatedAt = game.updatedAt;

    const timePassedSinceLastUpdate = Math.ceil((now - updatedAt) / 1000); // in seconds
    console.log(`Time passed since last update => ${timePassedSinceLastUpdate}`);


    // check for afk
    const players = objectKVs(game.players);
    const playerWithTurn = players.find(player => player.value.turnIndex === game.turnIndex)?.value;
    if (!playerWithTurn) {
        return asyncError('No player with turh found');
    }

    const updateGame: any = {};

    if (timePassedSinceLastUpdate >= AFK_TIMER) {
        // assuming player with turn is offline
        // remove player from the game

        const newPlayers = removePlayerFromGame(game, playerWithTurn.uid);
        updateGame[`updatedAt`] = SERVER_TIMESTAMP;

        if (objectKeys(newPlayers).length === 1) {
            updateGame[`gameOver`] = true; // fake game over
            await rootRef.child(`users/${objectKeys(newPlayers)[0]}/inGame`).remove();
        }

        updateGame[`players`] = newPlayers;

        await rootRef.child(`games/${gameId}`).update(updateGame);
        const user = (await rootRef.child(`users/${playerWithTurn.uid}`).once('value')).val();
        await rootRef.child(`users/${playerWithTurn.uid}`).update({
            inGame: null,
            gamesPlayed: user.gamesPlayed ? user.gamesPlayed + 1 : 1,
        });
        return 'ok';
    }

    return 'error';
});
