import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, first, map } from 'rxjs/operators';
import { allHeroes } from '../helpers/random-heroes';
import { SERVER_TIMESTAMP } from '../helpers/server-timestamp';
import { Player, Players } from '../models/board';
import { Game, GameEvent, QuestionReward } from '../models/game';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  isSmall = false;
  inGame$ = new BehaviorSubject(false);
  constructor(
    private authService: AuthService,
    private db: AngularFireDatabase,
    private afireFunctions: AngularFireFunctions
  ) {

  }

  getPlayers(): Observable<Players | null> {
    return this.db.object<Players>('game/players').valueChanges().pipe(map(pl => {
      console.log(pl);
      return pl;
    }));
  }

  getGame(gameId: string): Observable<Game | null> {
    return this.db.object<Game>(`games/${gameId}`).valueChanges().pipe(catchError(err => {
      console.error(err);
      return of({ id: 'no_game' } as Game);
    }));
  }

  async registerLastOnline(gameId: string): Promise<void> {
    return await this.db.object(`games/${gameId}/players/${this.authService.appUser?.uid}/lastOnline`).set(SERVER_TIMESTAMP);
  }

  async rollDice(uid: string, game: Game): Promise<number | null> {
    const callable = this.afireFunctions.httpsCallable('rollDice');
    try {
      const res = await callable({ uid, game }).toPromise();
      if (typeof res === 'string') {
        console.error('Error on functions');
        return null;
      }
      return res;
    } catch (error) {
      console.error('Error when calling function', error);
    }
    return null;
  }
  /**@deprecated */
  async cleanUpGame(gameId: string): Promise<string> {
    const callable = this.afireFunctions.httpsCallable('checkGameActivity');
    try {
      const res = await callable({ gameId }).toPromise();
      if (res === 'ok') {
        return res;
      }
    } catch (error) {
      console.error(`Error when calling function Check game activity`, error);
    }
    return 'error';
  }

  async checkForAfkPlayers(gameId: string): Promise<void> {

    await this.db.object(`games/${gameId}/checkForAfk`).set({
      whoChecked: this.authService.appUser?.uid,
      timestamp: SERVER_TIMESTAMP,
    });

  }

  async answerGameEvent(gameId: string, gameEvent: GameEvent, previousPosition: number, previousPoints: number, nextTurn: number): Promise<void> {
    // const promises = [];
    const updateStuff: any = {};
    try {
      if (Number.isInteger(gameEvent.points)) {
        // remove points
        updateStuff[`players/${this.authService.appUser?.uid}/points`] = previousPoints + gameEvent.points!;
      } else {
        // move player
        updateStuff[`players/${this.authService.appUser?.uid}/position`] = previousPosition + gameEvent.step!;
        // promises.push(this.db.object(`games/${gameId}/players/${this.authService.appUser.uid}/position`).set(previousPosition + gameEvent.step));
      }
      updateStuff[`turnIndex`] = nextTurn;
      updateStuff[`nextTurn`] = null;
      updateStuff[`gameEvent`] = null;
      updateStuff[`diceResult`] = null;
      console.log(updateStuff);

      await this.db.object(`games/${gameId}`).update(updateStuff);
      // promises.push(this.db.object(`games/${gameId}/gameEvent`).remove());
      // await Promise.all(promises);
    } catch (error) {
      console.error('Error when finishing game event');
    }
  }

  gameInvites(): Observable<Record<string, { dn: string, roomId: string, roomName: string, accept: boolean }> | null> {
    return this.db.object<Record<string, { dn: string, roomId: string, roomName: string, accept: boolean }>>(`gameInvites/${this.authService.appUser?.uid}`)
      .valueChanges();
  }

  pendingGameInvites(): Observable<Record<string, { dn: string, roomId: string, roomName: string, accept: boolean }> | null> {
    return this.db.object<Record<string, { dn: string, roomId: string, roomName: string, accept: boolean }>>(`pendingGameInvites/${this.authService.appUser?.uid}`)
      .valueChanges();
  }

  async removeGameInvites(friendUid: string): Promise<void> {
    const updateStuff: any = {};
    updateStuff[`gameInvites/${this.authService.appUser?.uid}/${friendUid}`] = null;
    updateStuff[`gameInvites/${friendUid}/${this.authService.appUser?.uid}`] = null;
    updateStuff[`pendingGameInvites/${this.authService.appUser?.uid}/${friendUid}`] = null;
    updateStuff[`pendingGameInvites/${friendUid}/${this.authService.appUser?.uid}`] = null;
    await this.db.object(`/`).update(updateStuff);
  }

  async acceptGameInvite(friendUid: string, accept: boolean): Promise<void> {
    await this.db.object(`gameInvites/${this.authService.appUser?.uid}/${friendUid}`).update({ accept });
    await this.db.object(`pendingGameInvites/${friendUid}/${this.authService.appUser?.uid}`).update({ accept });
  }

  async getHelp(helpString: string, gameId: string): Promise<void> {
    await this.db.object(`games/${gameId}/question/question/answer`).set(helpString);
  }

  async getReward(gameId: string, reward: QuestionReward): Promise<string> {
    const data = {
      gameId,
      reward,
    };
    const callable = this.afireFunctions.httpsCallable('getReward');
    const res = await callable(data).toPromise();
    return res;
  }

}
