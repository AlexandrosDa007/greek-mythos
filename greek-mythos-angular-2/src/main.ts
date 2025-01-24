import { bootstrapApplication, platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getStorage, provideStorage } from '@angular/fire/storage';

platformBrowser().bootstrapModule(AppModule, {
  // providers: [provideFirebaseApp(() => initializeApp({"projectId":"greek-mythos-32b7f","appId":"1:807484573290:web:7520a558b5d5be1b1b6c13","databaseURL":"https://greek-mythos-32b7f-default-rtdb.europe-west1.firebasedatabase.app","storageBucket":"greek-mythos-32b7f.firebasestorage.app","apiKey":"AIzaSyB-GZRo8Ux8xyqe8TFG00JbUpYmSRejCDg","authDomain":"greek-mythos-32b7f.firebaseapp.com","messagingSenderId":"807484573290"})), provideAuth(() => getAuth()), provideDatabase(() => getDatabase()), provideFunctions(() => getFunctions()), provideStorage(() => getStorage()) as any]
})
  .catch((err) => console.error(err));
