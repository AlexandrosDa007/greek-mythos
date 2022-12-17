import { initializeApp } from 'firebase/app';
import { getDatabase, query, ref } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
const firebaseConfig = {
    apiKey: "AIzaSyDA2GUtPGxCws3oXf-TfVtWzQgnigL6GWk",
    authDomain: "greek-mythos.firebaseapp.com",
    databaseURL: "https://greek-mythos.firebaseio.com",
    projectId: "greek-mythos",
    storageBucket: "greek-mythos.appspot.com",
}

export const firebaseApp = initializeApp(firebaseConfig);
export const SERVER_TIMESTAMP: number = { '.sv': 'timestamp' } as unknown as number;

export const auth = getAuth(firebaseApp);
export const db = getDatabase(firebaseApp);