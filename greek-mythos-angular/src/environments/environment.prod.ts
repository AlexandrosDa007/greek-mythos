// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "AIzaSyDA2GUtPGxCws3oXf-TfVtWzQgnigL6GWk",
    authDomain: "greek-mythos.firebaseapp.com",
    databaseURL: "https://greek-mythos.firebaseio.com",
    projectId: "greek-mythos",
    storageBucket: "greek-mythos.appspot.com",
  }
};

/**The positions of the board that represent questions (small mode) */
export const QUESTIONS_MAP_SMALL = [2, 5, 9, 13, 17, 22, 27, 31, 35, 40, 42, 48];

/**The positions of the board that represent events (small mode) */
export const EVENTS_MAP_SMALL = [7, 20, 29, 38, 43];

/**The positions of the board that represent questions (big mode) */
export const QUESTIONS_MAP_BIG = [3, 7, 10, 12, 16, 18, 21, 27, 30, 34, 36, 40, 43, 48, 50, 53, 60, 63, 67, 71, 77, 80, 84, 89, 92, 95, 99];

/**The positions of the board that represent events (big mode) */
export const EVENTS_MAP_BIG = [9, 20, 31, 45, , 65, 75, 87, 90];

/**
 * How much the helps cost (points)
 */
export const HELPS = {
  skip: 5,
  help_50: 10
};

/**
 * Heroes descriptions
 */
export const TEXTS = {
  descriptions: {
    'achilles': `Ο Αχιλλέας, γιος του Πηλέα και εγγονός του Αιακού 
    (Αχιλλεύς Πηλείδης ή Αχιλλεύς Αιακίδης) 
    ήταν ο μεγαλύτερος και ο γενναιότερος ήρωας της Ιλιάδας του Ομήρου.`,
    'perseus': 'Ο Περσέας ήταν ήρωας της Αρχαιότητας, γιος του Δία και της Δανάης. Παππούς του ήταν ο Ακρίσιος, βασιλιάς του Άργους.',
    'hippo': 'Η Ιππολύτη ήταν βασίλισσα των Αμαζόνων και κόρη του θεού Άρη. Ταυτίζεται με την Αμαζόνα Αντιόπη, ακόμα και με τη Μελανίππη, ενώ υπάρχουν πολλές παραλλαγές των μύθων της.',
    'hercules': 'Ο Ηρακλής ήταν αρχαίος μυθικός ήρωας, θεωρούμενος ως ο μέγιστος των Ελλήνων ηρώων. Γεννήθηκε στη Θήβα και ήταν γιος του Δία και της Αλκμήνης.'
  }
}

