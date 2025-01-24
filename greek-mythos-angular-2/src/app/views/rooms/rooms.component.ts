import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Room } from '@app/models/room';
import { User } from '@app/models/user';
import { AuthService } from '@app/services/auth.service';
import { GameService } from '@app/services/game.service';
import { ModalsService } from '@app/services/modals.service';
import { RoomService } from '@app/services/room.service';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {

  user: any;
  userProfile: User | null = null;

  rooms: Room[] = [];
  showRooms: boolean = true;
  newRoom: Room = {
    actP: 1,
    diff: 'easy',
    max: 2,
    players: {},
    hostUid: '',
    hostName: '',
    minPoints: 150,
    roomId: '',
    isSmall: false,
    maxHelps: {
      help_50: 3,
      skip: 2
    },
    name: ''
  };
  errorMessage = '';
  joining = false;
  inGame = false;

  constructor(
    private authService: AuthService,
    private roomService: RoomService,
    private gameService: GameService,
    private modalsService: ModalsService,
    private router: Router,
  ) { }

  async ngOnInit(): Promise<void> {
    this.gameService.inGame$.subscribe(inGame => this.inGame = inGame);
    this.roomService.getRooms().subscribe(rooms => {
      // for(let i = 0;i< 10;i++) {
      //   this.rooms.push(...rooms);
      // }
      this.rooms = rooms;
    });
    this.user = this.authService.appUser;
    this.userProfile = await this.authService.getUserProfileOnce(this.user.uid);
    this.newRoom = {
      actP: 1,
      diff: 'easy',
      max: 2,
      players: {},
      hostUid: this.user.uid,
      hostName: this.userProfile.displayName,
      minPoints: 150,
      roomId: '',
      isSmall: false,
      maxHelps: {
        help_50: 3,
        skip: 2
      },
      name: ''
    };
    this.newRoom.players[this.user.uid] = {
      uid: this.user.uid,
      position: 1,
      displayName: this.userProfile.displayName,
      ready: true,
      helpUsed: {
        help_50: 0,
        skip: 0,
      }
    };
  }

  async createRoom(): Promise<void> {
    if (this.inGame) {
      this.modalsService.openErrorSnack(`Βρίσκεσαι ήδη σε παιχνίδι`);
      return;
    }
    // validate room before sending
    const res = await this.roomService.createRoom(this.newRoom);
    if (res) {
      // room was created move to room view
      this.router.navigate(['room', res.roomId]);
    } else {
      this.modalsService.openErrorSnack(`Δεν έχεις συμπληρώσει όλα τα στοιχεία`);
    }
  }

  async joinRoom(roomToJoin: Room): Promise<void> {
    if (this.inGame) {
      this.modalsService.openErrorSnack(`Βρίσκεσαι ήδη σε παιχνίδι`);
      return;
    }

    if (!this.authService.appUser) {
      return;
    }
    
    if (roomToJoin.players[this.authService.appUser.uid]) {
      // re join room
      this.router.navigate(['room', roomToJoin.roomId]);
      return;
    }
    try {
      this.joining = true;
      const snack = this.modalsService.openJoinRoomSnack();
      const res = await this.roomService.joinRoom(roomToJoin.roomId);
      this.joining = false;
      snack.dismiss();
      if (res === 'ok') {
        this.router.navigate(['room', roomToJoin.roomId]);
      } else if (res === 'error') {
        this.modalsService.openErrorSnack(`Κάτι πήγε στραβά!`);
      } else {
        this.modalsService.openErrorSnack(`Δεν υπάρχει χώρος στο δωμάτιο!`);
      }
    } catch (error) {
      console.error(error);
      this.modalsService.openErrorSnack(`Κάτι πήγε στραβά!`);
    }
    this.joining = false;
  }

  trackById(index: number, item: Room) {
    return item.roomId;
  }

}
