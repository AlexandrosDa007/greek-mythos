import { initializeApp } from 'firebase/app';
import { getDatabase, query, ref , connectDatabaseEmulator, set, get} from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator} from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';
const firebaseConfig = {
    apiKey: "AIzaSyB-GZRo8Ux8xyqe8TFG00JbUpYmSRejCDg",
    authDomain: "greek-mythos-32b7f.firebaseapp.com",
    databaseURL: "https://greek-mythos-32b7f-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "greek-mythos-32b7f",
    storageBucket: "greek-mythos-32b7f.firebasestorage.app",
    messagingSenderId: "807484573290",
    appId: "1:807484573290:web:7520a558b5d5be1b1b6c13"
}

export const firebaseApp = initializeApp(firebaseConfig);
export const SERVER_TIMESTAMP: number = { '.sv': 'timestamp' } as unknown as number;
export const auth = getAuth(firebaseApp);
connectAuthEmulator(auth, 'http://localhost:9099');
export const db = getDatabase(firebaseApp);
connectDatabaseEmulator(db, 'localhost', 9000);
export const functions = getFunctions(firebaseApp);
connectFunctionsEmulator(functions, 'localhost', 5001);
export const testFn = httpsCallable(functions, 'testFn');


export const GAME_REF = (gameId: string) => ref(db, `games/${gameId}`);
export const ANSWER_REF = (gameId: string) => ref(db, `games/${gameId}/question/question/answer`);
export const QUESTION_REF = (questionId: string) => ref(db, `questions/${questionId}`);
export const QUESTION_ANSWER_REF = (questionId: string) => ref(db, `questionAnswers/${questionId}`);
export const GAME_EVENTS_REF = (gameEventId: string) => ref(db, `gameEvents/${gameEventId}`);
export const SET_DATA = set;
export const GET_DATA = get;