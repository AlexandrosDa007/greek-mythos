import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { first, } from 'rxjs/operators';
import { SERVER_TIMESTAMP } from '../helpers/server-timestamp';
import { User } from '../models/user';
import { ReAuthenticateComponent } from '../views/modals/re-authenticate/re-authenticate.component';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    appUser: User;
    constructor(
        public auth: AngularFireAuth,
        private db: AngularFireDatabase,
        private storage: StorageService,
        private matDialog: MatDialog,
        private snackBar: MatSnackBar,
    ) { }

    getUserProfileOnce(userUid: string): Promise<User> {
        return this.db.object<any>(`users/${userUid}`).valueChanges().pipe(first()).toPromise();
    }

    getUserProfile(userUid: string): Observable<User> {
        return this.db.object<User>(`users/${userUid}`).valueChanges();
    }

    async signIn(email: string, password: string): Promise<void> {
        try {
            await this.auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            throw new Error(error);
        }
    }

    async register(newUser: { email: string, password: string, displayName: string, image: File, passwordConfirm: string }): Promise<void> {
        try {
            const userCred = await this.auth.createUserWithEmailAndPassword(newUser.email, newUser.password);
            // try to make user??
            const user: User = {
                uid: userCred.user.uid,
                displayName: newUser.displayName,
                email: newUser.email,
                createdAt: SERVER_TIMESTAMP,
                lastOnline: SERVER_TIMESTAMP,
                active: true,
            };
            // TODO: check if user was indeed written
            await userCred.user.sendEmailVerification();
            await this.db.object(`users/${userCred.user.uid}`).set(user);
            this.appUser = await this.getUserProfileOnce(userCred.user.uid);
        } catch (error) {
            console.error('Error when registering', error);
            this.snackBar.open('Δεν συμπληρώθηκαν όλα τα στοιχεία σωστά!', '', {
                duration: 2000,
                panelClass: 'error-snack'
            });
        }
    }

    async updateProfile(displayName: string): Promise<void> {
        await this.db.object(`users/${this.appUser.uid}`).update({ displayName });
    }

    async uploadImage(imageFile: File | null): Promise<void> {
        // if (this.appUser.imageUrl) {
        //     // remove old one
        //     await this.storage.deleteImage(this.appUser.imageUrl);
        // }
        try {
            const imageUrl = await this.storage.uploadImage(imageFile, this.appUser.uid);
            await this.db.object(`users/${this.appUser.uid}`).update({ imageUrl });
        } catch (error) {
            console.error(`Something went wrong when uploading image! aborting...`, error);
        }
    }

    async deleteProfileImage(user: any): Promise<void> {
        const imageDeleted = await this.storage.deleteImage(user.imageUrl);
        if (!imageDeleted) {
            console.error(`Error on removing image`);
            return;
        }
        try {
            await this.db.object(`users/${this.appUser.uid}/imageUrl`).remove();
        } catch (error) {
            console.error(error);

        }
    }

    async deleteAccount(): Promise<boolean> {
        const currentUser = await this.auth.currentUser;
        try {
            if (this.appUser.inGame) {
                this.snackBar.open(`Δεν μπορείς να διαγράψεις τον λογαριασμό σου αν είσαι σε παιχνίδι!`, '', {
                    duration: 2000,
                    panelClass: 'error-snack'
                });
                return false;
            }
            await currentUser.delete();
            return true;
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                // promnt user to sign in
                const res = await this.matDialog.open(ReAuthenticateComponent, {
                    width: '800px',
                    height: '600px',
                }).afterClosed().toPromise();

                if (res) {

                    try {
                        await this.signIn(res.email, res.password);
                        await currentUser.delete();
                        return false;
                    } catch (error) {
                        console.error(`Something went terribly wrong`, error);
                        this.snackBar.open(`Κάτι πήγε στραβά!`, '', {
                            duration: 2000,
                            panelClass: 'error-snack'
                        });
                        return false;
                    }
                } else {
                    console.warn('Wrong credentials or closed modal');
                    return false;
                }
            } else {
                console.error(`Something went wrong`, error);
                this.snackBar.open(`Κάτι πήγε στραβά!`, '', {
                    duration: 2000,
                    panelClass: 'error-snack'
                });
                return false;
            }

        }
        return false;
        // const callable = this.functions.httpsCallable('deleteUser');
        // try {
        //     const res = await callable({}).pipe(first()).toPromise();
        //     return res;
        // } catch (error) {
        //     console.error('error when deleting account', error);
        //     return 'error';
        // }
    }

    inGame(): Observable<{ gameId: string; timestamp: number }> {
        return this.db.object<{ gameId: string; timestamp: number }>(`users/${this.appUser.uid}/inGame`).valueChanges();
    }
}
