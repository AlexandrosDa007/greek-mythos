import { cloneDeep } from "lodash";
import { Game, Players } from "../models/game";
import { objectKVs } from "./object-keys-values";

/**
 * Removes a player from a game without mutating the game
 * @param game The game to remove the player from
 * @param playerToRemoveUid The uid of the player to remove
 * @returns The new players object for the game
 */
export function removePlayerFromGame(game: Game, playerToRemoveUid: string): Players {
    const gameCopy = cloneDeep(game);
    const playersArray = objectKVs<Players>(gameCopy.players);
    playersArray.filter(player => player.key !== playerToRemoveUid).forEach(player => {
        if (player.value.turnIndex > game.players[playerToRemoveUid].turnIndex) {
            player.value.turnIndex--;
        }
    });
    const newPlayers: any = {};
    const newPlayersArray = playersArray.filter(player => player.key !== playerToRemoveUid);
    newPlayersArray.forEach(player => {
        newPlayers[player.key] = player.value;
    });
    return newPlayers;
}

/**
 * Gets this turn's player uid
 * @param game The game
 * @returns The uid of the player or null if (not found)
 */
export function getCurrentPlayerUid(game: Game): string | null {
    const players = objectKVs<Players>(game.players);
    const uid = players.find(player => player.value.turnIndex === game.turnIndex)?.key as string;
    return uid ?? null;
}