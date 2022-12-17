import { cloneDeep } from "lodash";
import { Players } from "../models/board";
import { Game } from "../models/game";
import { objectKVs } from "./object-keys-values";

/**
 * Find the removed players names
 * @param oldGame The previous game
 * @param newGame The new game
 * @returns The players names that were removed from the new game
 */
export function getRemovedPlayersNames(oldGame: Game, newGame: Game) {
    const differentPlayers = objectKVs(oldGame.players).filter(oldPlayer => !newGame.players[oldPlayer.key]);

    return differentPlayers.map(player => player.value.displayName);
}