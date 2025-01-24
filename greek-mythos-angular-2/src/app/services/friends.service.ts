import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { objectKeys } from '../helpers/object-keys-values';
import { User } from '../models/user';
import { AuthService } from './auth.service';
import { ModalsService } from './modals.service';

@Injectable({
    providedIn: 'root'
})
export class FriendsService {

    constructor(
        private db: AngularFireDatabase,
        private afFunctions: AngularFireFunctions,
        private snackBar: MatSnackBar,
    ) { }

    getFriends(userUid: string): Observable<User[]> {
        return this.db.object<Record<string, true>>(`userFriends/${userUid}`).valueChanges().pipe(
            switchMap(friendUids => {
                if (!friendUids) {
                    return of([]);
                }
                const friendKeys = objectKeys(friendUids);
                const friends$: Observable<User | null>[] = [];
                for (const fUid of friendKeys) {
                    friends$.push(this.getUserFriend(fUid));
                }

                return combineLatest(friends$);
            }),
            map(friends => friends.filter(friend => !!friend) as User[]),
        );
    }

    getPendingInvites(userUid: string): Observable<{ [friendUid: string]: { displayName: string, invite: true } } | null> {
        return this.db.object<{ [friendUid: string]: { displayName: string, invite: true } }>(`pendingFriendInvite/${userUid}`).valueChanges();
    }

    getUserFriend(friendUid: string): Observable<User | null> {
        return this.db.object<User>(`users/${friendUid}`).valueChanges();
    }

    async searchForUser(searchTerm: string): Promise<any> {
        const callable = this.afFunctions.httpsCallable('searchUser');
        const res = await callable({ searchTerm }).pipe(first()).toPromise();

        if (res === 'error') {
            return res;
        }
        if (res === 'none found') {
            return 'none found'
        }
        return res;
    }

    async addFriend(me: User, friendUid: string): Promise<void> {
        await this.db.object(`pendingFriendInvite/${friendUid}/${me.uid}`).set({ displayName: me.displayName, invite: true });
    }

    async acceptFriend(me: User, friendUid: string): Promise<void> {
        try {
            await this.db.object(`pendingFriendInvite/${me.uid}/${friendUid}/accept`).set(true);
        } catch (error) {
            console.error('Could not add friend', error);
            this.snackBar.open('Δεν προστέθηκε ο φίλος!', '', {
                duration: 2000,
                panelClass: 'error-snack',
            });
        }
    }

    async declineFriend(me: User, friendUid: string): Promise<void> {
        try {
            await this.db.object(`pendingFriendInvite/${me.uid}/${friendUid}`).update({ accept: false });
        } catch (error) {
            console.error('Could not decline friend', error);
            this.snackBar.open('Κάτι πήγε στραβά', '', {
                duration: 2000,
                panelClass: 'error-snack',
            });
        }
    }

    async removeFriend(friendUid: string): Promise<void> {
        const callable = this.afFunctions.httpsCallable('removeFriend');
        const res = await callable({ friend: friendUid }).pipe(first()).toPromise();
        if (res !== 'ok') {
            console.error('Something happened');
            throw new Error(`Κάτι πήγε στραβά!`);
        }

        console.log('Removed friend successfully');
    }

    async sendGameInvite(friendUid: string, me: {displayName: string, uid: string}, roomId: string, roomName: string): Promise<void> {
        const invite = {
            dn: me.displayName,
            roomId,
            roomName
        };
        try {
            await this.db.object(`gameInvites/${friendUid}/${me.uid}`).set(invite);
            await this.db.object(`pendingGameInvites/${me.uid}/${friendUid}`).set(invite);
            this.snackBar.open('Στάλθηκε η πρόσκληση.', '', {
                duration: 2000,
                panelClass: 'success-snack',
            });
        } catch (error) {
            this.snackBar.open('Κάτι πήγε στραβά', '', {
                duration: 2000,
                panelClass: 'error-snack',
            });
        }
    }
}
