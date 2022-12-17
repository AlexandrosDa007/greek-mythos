import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { FriendsService } from 'src/app/services/friends.service';
import { ModalsService } from 'src/app/services/modals.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit, OnDestroy {


  columns = ['img', 'name', 'status', 'games', 'action'];

  friendSubscription: Subscription;
  friends: User[];

  searchTerm: string;
  resultUsers: User[];

  friendsMap: Record<string, true> = {};
  user: any;

  friendInvites: Record<string, { displayName: string, invite: true }>;

  constructor(
    private authService: AuthService,
    private friendService: FriendsService,
    private modalService: ModalsService,
  ) { }


  ngOnDestroy(): void {
    this.friendSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.friendSubscription = this.authService.auth.authState.pipe(
      switchMap(user => {
        this.user = user;
        if (!user) {
          return combineLatest([of([]), of({})]);
        }

        return combineLatest([this.friendService.getFriends(user.uid), this.friendService.getPendingInvites(user.uid)]);
      })
    ).subscribe(([friends, invites]) => {
      this.friendsMap = {};
      this.friendInvites = invites;
      this.friends = friends;
      this.friends.forEach(friend => this.friendsMap[friend.uid] = true);

    });

  }

  async searchPlayer(): Promise<void> {
    this.resultUsers = null;
    if (this.validateSearchTerm()) {

      const res = await this.friendService.searchForUser(this.searchTerm);
      // this.searchTerm = '';
      if (typeof res !== 'string') {
        this.resultUsers = res;
        return;
      }
      if (res === 'error') {
        console.error('Error occured');
        this.modalService.openErrorSnack(`Πρόβλημα στην αναζήτηση!`);
        return;
      }
      if (res === 'none found') {
        console.log('Δεν βρέθηκαν παίκτες');
        return;
      }

    } else {
      this.modalService.openErrorSnack(`Κάτι πήγε στραβά!`);
    }
  }

  async addFriend(uid: string): Promise<void> {

    try {
      await this.friendService.addFriend(this.authService.appUser, uid);
      this.modalService.openSuccessSnack(`Στάλθηκε η πρόσκληση`);
    } catch (error) {
      this.modalService.openErrorSnack(`Κάτι πήγε στραβά!`);
    }
  }


  async removeFriend(friendUid: string): Promise<void> {
    try {
      await this.friendService.removeFriend(friendUid);
      this.modalService.openSuccessSnack(`Η διαγραφή πέτυχε`);
    } catch (error) {
      console.error(error);
      this.modalService.openErrorSnack(`Κάτι πήγε στραβά`);
    }
  }

  validateSearchTerm(): boolean {
    if (!this.searchTerm || this.searchTerm.length < 1 || this.searchTerm.length > 80 || this.searchTerm === '') {
      this.searchTerm = '';
      return false;
    }
    return true;
  }

  trackById(friend) {
    return friend.uid;
  }
}
