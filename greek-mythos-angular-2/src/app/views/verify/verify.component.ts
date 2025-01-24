import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '@app/services/auth.service';
import { ModalsService } from '@app/services/modals.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit, OnDestroy {

  currentUser: any;

  numberOfTries = 0;

  interval: any;

  destroy$ = new EventEmitter();

  constructor(
    private authService: AuthService,
    private modalsService: ModalsService,
    private router: Router,
  ) { }

  async ngOnInit(): Promise<void> {
    this.authService.auth.authState.pipe(takeUntil(this.destroy$))
      .subscribe(user => {

        this.currentUser = user;
        if (this.currentUser?.emailVerified) {
          this.router.navigate(['home']);
        }
      });
    this.interval = setInterval(async () => {
      if (this.currentUser && this.currentUser.emailVerified === false) {
        await this.currentUser.getIdTokenResult(true);
        this.currentUser.reload();
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    this.destroy$.emit();
    clearInterval(this.interval);
  }

  async sendVerification(): Promise<void> {
    try {
      await this.currentUser.sendEmailVerification();
      this.modalsService.openSuccessSnack('Το email επιβεβαίωσης στάλθηκε');
    } catch (error) {
      console.error(error);
      this.numberOfTries++;
      let errorMessage = 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.';
      if (this.numberOfTries > 3) {
        errorMessage = 'Κάτι πήγε στραβά. Δοκιμάστε ξανά. (Επικοινωνήστε με τον διαχειριστή)'
      }
      this.modalsService.openErrorSnack(errorMessage);
    }
  }


  async logout(): Promise<void> {
    await this.authService.auth.signOut();
  }

}
