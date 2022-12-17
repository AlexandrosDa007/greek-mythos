import * as functions from 'firebase-functions';

export function asyncError(msg: string, details?: any) {
    console.log('Rejecting with an error: ' + msg);
    console.log('Error details:', details);
    return Promise.reject(new functions.https.HttpsError('failed-precondition', msg, details));
}
