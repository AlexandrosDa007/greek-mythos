import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { objectKeys, objectKVs } from 'src/app/helpers/object-keys-values';
import { Player } from 'src/app/models/board';
import { Room } from 'src/app/models/room';
import { AuthService } from 'src/app/services/auth.service';
import { GameService } from 'src/app/services/game.service';
import { ModalsService } from 'src/app/services/modals.service';
import { RoomService } from 'src/app/services/room.service';


@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  room: Room;
  user: any;
  isHost = false;
  canLeave = false;


  starting: boolean;

  constructor(
    private authService: AuthService,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private modalService: ModalsService,
  ) { }

  async ngOnDestroy(): Promise<void> {
    this.subscription.unsubscribe();
    console.log('destroy room component');

    if (this.isHost) {
      // destory room
      if (this.room && !this.room.start) {
        await this.roomService.destroyRoom(this.room);
      }
    } else {
      // leave room
      if (this.room && !this.room.start) {
        await this.roomService.leaveRoom(this.room);
      }
    }

  }

  async ngOnInit(): Promise<void> {


    this.subscription = this.route.paramMap.pipe(
      switchMap(params => {
        const roomId = params.get('roomId');
        return this.roomService.getRoom(roomId);
      })
    ).subscribe(async room => {
      const invites = await this.gameService.gameInvites().pipe(first()).toPromise();
      for (const invite of objectKVs(invites)) {
        if (invite.value.roomId === room.roomId) {
          await this.gameService.removeGameInvites(invite.key);
        }
      }
      this.room = room;

      console.log(room);
      if (room.start === 'start') {
        // start game...
        console.log('game starting...');
        this.gameService.isSmall = room.isSmall;
        this.router.navigate(['game', room.roomId.replace('room_', 'game_')]);
      }
      this.user = await this.authService.auth.currentUser;
      if (!room || !this.room.players[this.user.uid]) {
        console.log('You have been kicked?');
        this.router.navigate(['rooms']);
        return;
      }
      if (room.hostUid === this.user.uid) {
        this.isHost = true;
      }
      objectKeys(this.room.players).forEach(playerKey => {
        if (!this.room.players[playerKey].imageUrl) {
          this.room.players[playerKey].imageUrl = null;
        }
      });
    });

  }

  trackById(index, item) {
    return item.uid;
  }

  async kick(player: Player): Promise<void> {
    await this.roomService.kickPlayer(this.room, player);
  }

  async leaveGame(): Promise<void> {
    const res = await this.modalService.openLeaveRoomModal();
    if (res) {
      this.router.navigate(['rooms']);
    }
  }

  async ready(): Promise<void> {
    if (this.room.players[this.user.uid].ready) {
      return;
    }
    await this.roomService.getReady(this.room);
  }

  async startGame(): Promise<void> {
    if (objectKeys(this.room.players).length < 2) {
      console.error('Can\'t start game');
      this.modalService.openErrorSnack(`Δεν μπορείς να ξεκινήσεις το παιχνίδι με 1 άτομο`);
      return;
    }
    if (!this.checkForReady()) {
      console.error(`Can't start game`);
      this.modalService.openErrorSnack(`Δεν μπορείς να ξεκινήσεις αν δεν είναι όλοι έτοιμοι`);
      return;
    }
    try {
      await this.roomService.startGame(this.room);
    } catch (error) {
      console.error(error);
    }

  }

  invitePlayers(): void {
    if (this.room.actP === this.room.max) {
      this.modalService.openAlert(`Δεν μπορείς να προσκαλέσεις! Το δωμάτιο είναι γεμάτο.`);
      return;
    }
    this.modalService.openFriendModal(this.room);
  }

  checkForReady(): boolean {
    if (!objectKeys(this.room.players).every(playerKey => this.room.players[playerKey].ready === true)) {
      return false;
    }
    return true;
  }
}
