import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { combineLatest } from 'rxjs';
import { Room } from 'src/app/models/room';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { FriendsService } from 'src/app/services/friends.service';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-friend-modal',
  templateUrl: './friend-modal.component.html',
  styleUrls: ['./friend-modal.component.scss']
})
export class FriendModalComponent implements OnInit {

  friends: User[];
  gameInvites: Record<string, {
    dn: string;
    roomId: string;
    roomName: string;
    accept: boolean;
  }> = {};

  constructor(
    private friendService: FriendsService,
    private gameService: GameService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: { room: Room }
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    const user = this.authService.appUser;
    combineLatest([this.friendService.getFriends(user.uid), this.gameService.pendingGameInvites()])
      .subscribe(([friends, invites]) => {
        this.gameInvites = invites ?? {};
        this.friends = friends.filter(friend => {
          if (!this.data.room.players[friend.uid]) {
            return friend;
          }
        });
      });
  }

  async sendInvite(friendUid: string): Promise<void> {
    if (this.data.room.actP === this.data.room.max) {
      console.error(`Maximum people reached`);
      return;
    }
    await this.friendService.sendGameInvite(friendUid, {
      uid: this.authService.appUser.uid,
      displayName: this.authService.appUser.displayName,
    }, this.data.room.roomId, this.data.room.name);
  }

}
