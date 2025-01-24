import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { User } from './models/user';
import { PresenceService } from './services/presence.service';
import { ModalsService } from './services/modals.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  user: any;
  authSateSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private presenceService: PresenceService,
    private router: Router,
    private modalsService: ModalsService,
  ) {
    // create new settings if its the first time
    const music = localStorage.getItem('music');
    const effects = localStorage.getItem('effects');
    const musicMute = localStorage.getItem('musicMute');
    const effectsMute = localStorage.getItem('effectsMute');
    if (!music) {
      localStorage.setItem('music', '0.5');
    }
    if (!effects) {
      localStorage.setItem('effects', '0.5');
    }
    if (!musicMute) {
      localStorage.setItem('musicMute', JSON.stringify(false));
    }
    if (!effectsMute) {
      localStorage.setItem('effectsMute', JSON.stringify(false));
    }

  }



  ngOnDestroy(): void {
    this.authSateSubscription?.unsubscribe();
  }


  async ngOnInit(): Promise<void> {
    this.authSateSubscription = this.authService.auth.authState
      .subscribe(async user => {
        if (user) {
          this.authService.appUser = await this.authService.getUserProfileOnce(user.uid);
          if (user.emailVerified === false) {
            this.router.navigate(['verifyEmail']);
          }
        }
        this.user = user;
      });
  }

  async logout(): Promise<void> {
    try {
      await this.presenceService.signOut();
    } catch (error) {
      console.error(error);
      this.modalsService.openErrorSnack(`Κάτι πήγε στραβά!`);
    }
  }
}
