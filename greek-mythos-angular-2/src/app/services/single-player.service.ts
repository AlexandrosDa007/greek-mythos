import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { first, map, switchMap } from 'rxjs/operators';
import { objectKVs } from '../helpers/object-keys-values';
import { getCustomEvent } from '../helpers/reached-end';
import { Player, Players } from '../models/board';
import { Game, GameEvent } from '../models/game';
import { AudioService } from './audio.service';
import { AuthService } from './auth.service';
import { QuestionService } from './question.service';

@Injectable({
    providedIn: 'root'
})
export class SinglePlayerService {
    moveInterval = 500;
    constructor(
        private authService: AuthService,
        private questionService: QuestionService,
        private db: AngularFireDatabase,
        private audioService: AudioService,
    ) { }

    getSinglePlayerPlayers(): Players {
        const user = this.authService.appUser;
        if (!user) {
            throw new Error('No user');
        }
        const players: Players = {
            [user.uid]: {
                displayName: this.authService.appUser!.displayName,
                helpUsed: { help_50: 0, skip: 0 },
                ready: true,
                uid: user.uid,
                position: 1,
                hero: { name: 'achilles', icon: 'achillesHead.png' },
                turnIndex: 0,
                points: 0,
                oldPosition: 1,
            },
            ['bot']: {
                displayName: 'Υπολογιστής',
                helpUsed: { help_50: 0, skip: 0 },
                ready: true,
                uid: user.uid,
                position: 1,
                hero: { name: 'hercules', icon: 'herculesHead.png' },
                turnIndex: 1,
                points: 0,
                oldPosition: 1,
            }
        }
        return players;
    }

    async handleRoll(game: Game, newRoll: number, mode: 'question' | 'event' | 'move' | 'gameOver', uid: string): Promise<void> {
        // wait a bit
        // remove previous question and event

        game.question = undefined;
        game.gameEvent = undefined;



        for (let i = 0; i < newRoll; i++) {
            await new Promise(res => setTimeout(res, this.moveInterval));
            game.players[uid].position!++;
            this.audioService.playMoveSound();
            if (game.players[uid].position === (game.isSmall ? 49 : 100)) {
                break;
            }
        }

        switch (mode) {
            case 'question': {
                game.question = await this.questionService.getRandomQuestion(uid);
                break;
            }
            case 'event': {
                game.gameEvent = await this.getGameEvent(uid);
                break;
            }
            case 'move': {
                break;
            }
            case 'gameOver': {
                // finish or check for points
                const hasEnoughPoints = game.players[uid].points! >= game.minPoints;
                if (hasEnoughPoints) {
                    // game over
                    game.gameOver = { [uid]: game.players[uid].displayName };
                } else {
                    game.gameEvent = getCustomEvent(game, uid);
                }
                break;
            }
        }
    }

    /**
     * Retrieves a random game event from the db for the
     * player uid that was provided
     * @param playerUid The player's uid
     * @returns A game event with the player uid
     */
    getGameEvent(playerUid: string): Promise<GameEvent> {
        const r = Math.floor(Math.random() * 14) + 1;
        const id = `gameEvent_${r}`;
        return this.db.object<any>(`gameEvents/${id}`).valueChanges().pipe(
            map(gameEvent => {
                return {
                    ...gameEvent,
                    playerUid
                }
            }),
            first()
        ).toPromise();
    }

    // async moveSlow(game: Game): Promise<void> {
    //     for (const player of objectKVs(game.players)) {

    //         const oldPosition = player.value.position;
    //         const newPosition = game.players[player.key].position;

    //         if (oldPosition !== newPosition) {
    //             // const result = ((newPosition - oldPosition) > 0) ? (newPosition - oldPosition) : (oldPosition - newPosition);
    //             const result = newPosition - oldPosition;
    //             this.canRoll = false;
    //             // Started moving
    //             if (result > 0) {
    //                 for (let i = 0; i < result; i++) {
    //                     this.board.game.players[player.key].position++;
    //                     this.audioService.playMoveSound();
    //                     await new Promise(res => setTimeout(res, this.moveInterval));
    //                 }
    //             } else {
    //                 const positiveResult = result * -1;
    //                 for (let i = 0; i < positiveResult; i++) {
    //                     this.board.game.players[player.key].position--;
    //                     this.audioService.playMoveSound();
    //                     await new Promise(res => setTimeout(res, this.moveInterval));
    //                 }
    //             }

    //             // Finished moving
    //             this.canRoll = true;
    //         }

    //     }
    // }

    async waitFor(timeInMs: number): Promise<void> {
        await new Promise(res => setTimeout(res, timeInMs));
    }
}
