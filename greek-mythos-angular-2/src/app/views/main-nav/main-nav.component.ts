import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { objectKeys } from '@app/helpers/object-keys-values';
import { getHoursMinutesSecondsFromMilli } from '@app/helpers/time-related';
import { AuthService } from '@app/services/auth.service';
import { FriendsService } from '@app/services/friends.service';
import { GameService } from '@app/services/game.service';
import { ModalsService } from '@app/services/modals.service';
import { RoomService } from '@app/services/room.service';
import { TimerService } from '@app/services/timer.service';

type InGame = { gameId: string; timestamp: number } | null;
type GameInvites = Record<string, { dn: string, roomId: string, roomName: string, accept: boolean }>;
type PendingFriendInvites = Record<string, { displayName: string, invite: boolean }>;

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit, OnDestroy {

  @Output() onLogout = new EventEmitter<any>();

  inGameWindow = false;

  gameInvites: GameInvites = {};
  gameInvitesLength = 0;
  showInvites = false;
  inGame: InGame = null;

  pendingFriendInvites: PendingFriendInvites = {};
  pendingFriendInvitesLength = 0;

  gameTimer: string | null = '';
  inGame$ = new BehaviorSubject<InGame>(null);

  destroy$ = new EventEmitter();

  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private roomService: RoomService,
    private friendsService: FriendsService,
    private timerService: TimerService,
    private modalService: ModalsService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.gameService.inGame$.pipe(takeUntil(this.destroy$))
      .subscribe(inGameWindow => this.inGameWindow = inGameWindow);
    combineLatest([
      this.authService.inGame(),
      this.gameService.gameInvites(),
      this.friendsService.getPendingInvites(this.authService.appUser!.uid),
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(([inGame, gameInvites, pendingFriendInvites]) => {
        this.gameInvites = gameInvites ?? {};
        this.gameInvitesLength = objectKeys(this.gameInvites).filter(key => this.gameInvites[key].accept === undefined).length;
        this.inGame = inGame;
        this.inGame$.next(this.inGame);
        this.pendingFriendInvites = pendingFriendInvites ?? {};
        this.pendingFriendInvitesLength = objectKeys(pendingFriendInvites).length;
      });

    this.inGame$.pipe(
      takeUntil(this.destroy$),
      switchMap(inGame => {
        if (!inGame) {
          return of(null);
        }
        return this.timerService.startTimerGameTimestamp(inGame.timestamp);
      }),
    ).subscribe(v => {
      if (!v) {
        this.gameTimer = null;
        return;
      }
      this.gameTimer = getHoursMinutesSecondsFromMilli(v);

    });
  }

  ngOnDestroy(): void {
    this.destroy$.emit();
  }

  logout(): void {
    this.onLogout.emit(true);
  }

  async joinGame(roomId: string, friendUid: string): Promise<void> {
    console.log(friendUid);

    await this.gameService.acceptGameInvite(friendUid, true);
    const res = await this.roomService.joinRoom(roomId);
    if (res === 'ok') {
      this.router.navigate(['room', roomId]);
    } else {
      console.error('No room for you');
    }
  }
  async declineInvite(friendUid: string): Promise<void> {
    console.log(friendUid);

    await this.gameService.acceptGameInvite(friendUid, false);
  }

  returnToGame(): void {
    if (!this.inGame) {
      return;
    }
    this.router.navigate([`game/${this.inGame.gameId}`]);
  }

  async acceptFriend(friendUid: string, displayName: string): Promise<void> {
    try {
      await this.friendsService.acceptFriend(this.authService.appUser!, friendUid);
      this.modalService.openSuccessSnack(`Έγινες φίλος με τον ${displayName}`);
    } catch (error) {
      console.error(error);
      this.modalService.openErrorSnack(`Κάτι πήγε στραβά`);
    }
  }

  async declineFriend(friendUid: string): Promise<void> {
    try {
      await this.friendsService.declineFriend(this.authService.appUser!, friendUid);
    } catch (error) {
      this.modalService.openErrorSnack(`Κάτι πήγε στραβά!`);
    }

  }
}
