import { Players } from '../models/game';
import { QUESTIONS_MAP_BIG, QUESTIONS_MAP_SMALL } from './question-event-maps';

/**
 * Calculates the new position of a player if he reached the end without
 * enough points
 * @param game The game object
 * @param uid The uid of the player that reached the end
 * @returns The new position that the player must go
 */
export function getPositionAfterEnd(game: { isSmall: boolean, minPoints: number, players: Players }, uid: string): number {
    const questionMap = game.isSmall ? QUESTIONS_MAP_SMALL : QUESTIONS_MAP_BIG;
    const minPoints = game.minPoints;
    const playerPoints = game.players[uid].points;
    if (playerPoints >= minPoints) {
        console.warn(`Warning: player points are more than game min points...returing default`);
        return game.isSmall ? 25 : 50;
    }

    const questionPointsMO = 20; // TODO: maybe find a better way to provide this

    const numberOfQuestions = Math.ceil((minPoints - playerPoints) / questionPointsMO);

    const newPosition = questionMap.slice().reverse()[numberOfQuestions];

    if (!newPosition) {
        console.warn('something went wrong i think not catastrophic...questionMap is not good...returning default');
    }

    const finalPosition = newPosition ? (newPosition - 6) : (game.isSmall ? 25 : 50);
    return finalPosition > 0 ? finalPosition : 1;

}
