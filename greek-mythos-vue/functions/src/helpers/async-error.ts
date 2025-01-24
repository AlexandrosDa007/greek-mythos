import {https} from 'firebase-functions/v2';

export function asyncError(msg: string, details?: any) {
    console.log('Rejecting with an error: ' + msg);
    console.log('Error details:', details);
    return Promise.reject(new https.HttpsError('failed-precondition', msg, details));
}
