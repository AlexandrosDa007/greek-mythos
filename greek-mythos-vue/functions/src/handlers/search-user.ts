import { objectKVs } from '../helpers/object-keys-values';
import { searchInString } from '../helpers/search-in-string';
import { asyncError } from '../helpers/async-error';
import { rootRef } from '../constants/refs';
import { CallableHandler } from '../models/handlers';


export const searchUserHandler: CallableHandler = (async (context) => {
    const uid = context.auth?.uid;

    if (!uid) {
        return asyncError('no uid provided');
    }
    const searchTerm = context.data.searchTerm;
    if (typeof searchTerm !== 'string') {
        return asyncError('no search term provided', { searchTerm });
    }

    if (searchTerm.length < 1 || searchTerm.length > 100) {
        return asyncError('Search term must be between 1 and 100 characters');
    }

    const users: any = (await rootRef.child(`users`).once('value')).val();

    const usersObj: any[] = objectKVs(users);

    const usersToReturn: any[] = [];
    usersObj.forEach(user => {
        const existsInName = searchInString(user.value.displayName, searchTerm);
        const existsInEmail = searchInString(user.value.email, searchTerm);
        if (user.value.uid !== uid && (existsInEmail || existsInName)) {
            const cleanUser = {
                uid: user.value.uid,
                imageUrl: user.value.imageUrl ?? null,
                displayName: user.value.displayName,
            };
            usersToReturn.push(cleanUser); // TODO: maybe privacy things
        }
    });

    return usersToReturn;
});
