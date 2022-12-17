import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameService } from './services/game.service';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { LoginComponent } from './views/login/login.component';
import { GameComponent } from './views/game/game.component';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { FormsModule } from '@angular/forms';
import { MainNavComponent } from './views/main-nav/main-nav.component';
import { HomeComponent } from './views/home/home.component';
import { RoomsComponent } from './views/rooms/rooms.component';
import { RoomComponent } from './views/room/room.component';
import { FriendsComponent } from './views/friends/friends.component';
import { ProfileComponent } from './views/profile/profile.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { FriendModalComponent } from './views/modals/friend-modal/friend-modal.component';
import { MatRadioModule } from '@angular/material/radio';
import { DiceComponent } from './views/dice/dice.component';
import { ConfirmModalComponent } from './views/modals/confirm-modal/confirm-modal.component';
import { MatButtonModule } from '@angular/material/button';
import { MaterialModule } from './shared/material.module';
import { AlertModalComponent } from './views/modals/alert-modal/alert-modal.component';
import { QuestionModalComponent } from './views/question-modal/question-modal.component';
import { SinglePlayerComponent } from './views/single-player/single-player.component';
import { PlayersHudComponent } from './views/players-hud/players-hud.component';
import { VerifyComponent } from './views/verify/verify.component';
import { ReAuthenticateComponent } from './views/modals/re-authenticate/re-authenticate.component';
import { DeleteAccountComponent } from './views/modals/delete-account/delete-account.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    GameComponent,
    MainNavComponent,
    HomeComponent,
    RoomsComponent,
    RoomComponent,
    FriendsComponent,
    ProfileComponent,
    FriendModalComponent,
    DiceComponent,
    ConfirmModalComponent,
    AlertModalComponent,
    QuestionModalComponent,
    SinglePlayerComponent,
    PlayersHudComponent,
    VerifyComponent,
    ReAuthenticateComponent,
    DeleteAccountComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireFunctionsModule,
    AngularFireStorageModule,
    MatRadioModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    BrowserAnimationsModule,
    MaterialModule,
  ],
  providers: [GameService],
  bootstrap: [AppComponent]
})
export class AppModule { 
  
}
