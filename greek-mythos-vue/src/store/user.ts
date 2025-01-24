import { defineStore } from 'pinia';
import { signInWithEmailAndPassword, UserCredential, signOut, onAuthStateChanged, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ref, get, query, set } from 'firebase/database';
import { auth, db, SERVER_TIMESTAMP } from '@/firebase';
import { log, logError } from '@/utilities/log';
import router from '@/router';
import { AppUser } from '@/models/app-user';
import { NewUser } from '@/models/new-user';

const SEND_VERIFICATION_REFRESH_RATE_MS = 3000;

const getUserRef = (uid: string) => ref(db, `/users/${uid}`);;

type UserStoreState = {
    isUserLoggedIn: boolean;
    userRecord: UserCredential['user'] | null | undefined;
    userProfile: AppUser | null;
    canSendVerification: boolean;
}

export const useUserStore = defineStore('user', {
    state: () => ({
        isUserLoggedIn: false,
        userRecord: undefined,
        userProfile: null,
        canSendVerification: true,
    } as UserStoreState),
    actions: {
        async loginUser({ email, password }: { email: string, password: string }) {
            try {
                await signInWithEmailAndPassword(auth, email, password);
                await this.fetchUserProfile();
            } catch (error) {
                logError('User login error', error);
            }
        },
        async logoutUser() {
            try {
                await signOut(auth);
                this.isUserLoggedIn = false;
                this.userRecord = null;
            } catch (error) {
                logError('User loggout error', error);
            }
        },
        async registerUser({ email, pass, name }: NewUser) {
            try {
                const userRecord = await createUserWithEmailAndPassword(auth, email, pass);
                const user: AppUser = {
                    email,
                    createdAt: SERVER_TIMESTAMP,
                    lastOnline: SERVER_TIMESTAMP,
                    displayName: name,
                    uid: userRecord.user.uid,
                    active: true,
                };
                await sendEmailVerification(userRecord.user);
                await set(getUserRef(userRecord.user.uid), user);
                await this.fetchUserProfile();
            } catch (error) {
                logError('Error on registering user', error);
            }
        },
        async fetchUserProfile() {
            log('Fetching userprofile')
            const uid = this.userRecord?.uid
            if (!uid) {
                logError('fetchUserProfile was called without user', null);
                return;
            }
            const userRef = getUserRef(uid);
            try {
                const userProfile = (await get(query(userRef))).val() as AppUser | null;
                if (!userProfile) {
                    logError('No user profile', { uid });
                    return;
                }
                log('New user profile', userProfile)
                this.userProfile = userProfile;
            } catch (error) {
                logError('Error when getting user profile', error);
            }
        },
        initializeUserSubscription() {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                console.log('dear god2', user);
                if (user) {
                    const _isLoading = this.getIsLoading;
                    this.userRecord = user;
                    
                    await (_isLoading && this.fetchUserProfile());
                    this.isUserLoggedIn = true;
                    if (router.currentRoute.value.name === 'Login') {
                        router.push('/');
                    }
                } else {
                    this.userRecord = null;
                    this.isUserLoggedIn = false;
                    if (router.currentRoute.value.name !== 'Login') {
                        router.push('/login');
                    }
                }
                console.log({
                    ur: this.userRecord,
                    profile: this.userProfile,
                    isLoggedIn: this.isUserLoggedIn,
                    userRecord: this.userRecord,
                    user
                })
            });
            return unsubscribe;
        },
        async sendVerification() {
            if (!this.userRecord) return;
            this.canSendVerification = false;
            setTimeout(() => this.canSendVerification = true, SEND_VERIFICATION_REFRESH_RATE_MS);
            await sendEmailVerification(this.userRecord);
        },
        async checkForVerification() {
            const idTokenResult = await this.userRecord?.getIdTokenResult(true);
            log('token result ', idTokenResult);
            this.userRecord?.reload();
        }
    },
    getters: {
        getUserEmail: (state) => {
            return state.userRecord?.displayName || '';
        },
        getIsLoading: (state) => {
            return state.userRecord === undefined;
        },
        getIsUserVerified: (state) => {
            return state.userRecord?.emailVerified === true;
        }
    }
});
