import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GameGuard } from './guards/game.guard';
import { NotVerifiedGuard } from './guards/not-verified.guard';
import { RoomGuard } from './guards/room.guard';
import { VerifyGuard } from './guards/verify.guard';
import { FriendsComponent } from './views/friends/friends.component';
import { GameComponent } from './views/game/game.component';
import { HomeComponent } from './views/home/home.component';
import { LoginComponent } from './views/login/login.component';
import { ProfileComponent } from './views/profile/profile.component';
import { RoomComponent } from './views/room/room.component';
import { RoomsComponent } from './views/rooms/rooms.component';
import { SinglePlayerComponent } from './views/single-player/single-player.component';
import { VerifyComponent } from './views/verify/verify.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'game/:gameId', component: GameComponent, canActivate: [AuthGuard, VerifyGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard, VerifyGuard] },
  { path: 'single-player', component: SinglePlayerComponent, canActivate: [AuthGuard, VerifyGuard] },
  { path: 'rooms', component: RoomsComponent, canActivate: [AuthGuard, VerifyGuard] },
  { path: 'room/:roomId', component: RoomComponent, canActivate: [AuthGuard, VerifyGuard] },
  { path: 'verifyEmail', component: VerifyComponent, canActivate: [AuthGuard, NotVerifiedGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard, VerifyGuard] },
  { path: 'friends', component: FriendsComponent, canActivate: [AuthGuard, VerifyGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
