import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, of, Subscription } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { SERVER_TIMESTAMP } from '../helpers/server-timestamp';

@Injectable({
    providedIn: 'root'
})
export class PresenceService {

    onDisconectSubscription: Subscription;

    constructor(
        private auth: AngularFireAuth,
        private db: AngularFireDatabase,
    ) {
        // Global subscriptions...
        this.updateOnUser().subscribe();
        this.onDisconectSubscription = this.updateOnDisconnect().subscribe();
    }

    getPresence(uid: string): Observable<{ status: boolean, lastOnline: number }> {
        return this.db.object<{ status: boolean, lastOnline: number }>(`users/${uid}`).valueChanges();
    }

    get timestamp(): number {
        return SERVER_TIMESTAMP;
    }

    updateOnUser(): Observable<boolean> {
        const connection$ = this.db.object('.info/connected').valueChanges().pipe(
            map(connected => connected ? true : false)
        );

        return this.auth.authState.pipe(
            switchMap(user => user ? connection$ : of(false)),
            tap(status => this.setPresence(status))
        );
    }

    async setPresence(online: boolean): Promise<void> {
        const user = await this.auth.currentUser;
        if (user) {
            return this.db.object(`users/${user.uid}`).update({ active: online, lastOnline: this.timestamp });
        }
    }

    updateOnDisconnect(): Observable<any> {
        return this.auth.authState.pipe(
            tap(user => {
                if (user) {
                    this.db.object(`users/${user.uid}`).query.ref.onDisconnect()
                        .update({
                            active: false,
                            lastOnline: this.timestamp
                        });
                }
            })
        );
    }

    async signOut(): Promise<void> {
        await this.setPresence(false);
        await this.auth.signOut();
    }
}
