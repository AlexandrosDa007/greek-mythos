import * as admin from 'firebase-admin';
admin.initializeApp();

export const rootRef = admin.database().ref();

export const bucketRef = admin.storage().bucket();