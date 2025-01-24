import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { objectKVs } from '../helpers/object-keys-values';
import { createPushIdWithPrefix } from '../helpers/push-id';
import { getRandomHeroArray } from '../helpers/random-heroes';
import { Player } from '../models/board';
import { Room } from '../models/room';
import { User } from '../models/user';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(
    private db: AngularFireDatabase,
    private afireFunctions: AngularFireFunctions,
    private authService: AuthService,
  ) { }

  async createRoom(incompleteRoom: Room): Promise<Room | null> {
    const pushId = this.db.createPushId();
    const newPushId = createPushIdWithPrefix('room_', pushId);
    // incompleteRoom.start = false;
    incompleteRoom.roomId = newPushId;
    const room = incompleteRoom;
    room.roomId = newPushId;
    try {
      console.log(incompleteRoom);

      await this.db.object(`rooms/${newPushId}`).set(incompleteRoom);
      return room;
    } catch (error) {
      console.error(`error when creating room`, error);
      return null;
    }
  }

  async joinRoom(roomId: string): Promise<string> {
    const data = {
      uid: this.authService.appUser?.uid,
      displayName: this.authService.appUser?.displayName
    };
    const callable = this.afireFunctions.httpsCallable('joinRoom');
    const res = await callable({ userProfile: data, roomId }).toPromise();
    return res;
  }

  async getReady(room: Room): Promise<void> {
    try {
      const uid = (await this.authService.auth.currentUser)?.uid;
      await this.db.object(`rooms/${room.roomId}/players/${uid}/ready`).set(true);
    } catch (error) {
      console.error('error when ready', error);
    }
  }

  async kickPlayer(room: Room, player: Player): Promise<void> {
    try {
      const newData: any = {};
      newData[`actP`] = room.actP - 1;
      newData[`players/${player.uid}`] = null;
      await this.db.object(`rooms/${room.roomId}`).update(newData);
    } catch (error) {
      console.error('error when kicking out player', error);
    }
  }

  async destroyRoom(room: Room): Promise<void> {
    try {
      await this.db.object(`rooms/${room.roomId}`).remove();
      //TODO: also remove friend invites with a function
    } catch (error) {
      console.error('error when destroying room', error);
    }
  }

  async leaveRoom(room: Room): Promise<void> {
    // NOTE: potential problem -- this must be done in function
    try {
      const uid = (await this.authService.auth.currentUser)?.uid;
      const newData: any = {};
      newData[`actP`] = room.actP - 1;
      newData[`players/${uid}`] = null;
      await this.db.object(`rooms/${room.roomId}`).update(newData);
    } catch (error) {
      console.error('error when leaving room', error);
    }
  }

  async startGame(room: Room): Promise<void> {
    const hh = getRandomHeroArray();
    try {
      // put stuff on room
      const data: any = {};
      objectKVs(room.players).forEach((player, index) => {
        data[`players/${player.key}/hero/name`] = hh[index].name;
      });

      data[`start`] = 'starting';
      await this.db.object(`rooms/${room.roomId}`).update(data);
    } catch (error) {
      console.error('Error when starting game');
    }
  }

  getRooms(): Observable<Room[]> {
    return this.db.list<Room>(`rooms`, ref => ref.orderByChild('start').equalTo(null)).valueChanges();
  }

  getRoom(roomId: string): Observable<Room | null> {
    return this.db.object<Room>(`rooms/${roomId}`).valueChanges();
  }
}
