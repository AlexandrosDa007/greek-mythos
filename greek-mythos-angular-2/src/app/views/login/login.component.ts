import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { ModalsService } from '@app/services/modals.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  errorMessage = '';
  newUser = {
    email: '',
    password: '',
    passwordConfirm: '',
    displayName: '',
    image: null
  };
  showRegister = false;
  imageUrl = '';
  email = '';
  password = '';
  hide = true;
  hideRegister = true;
  hideConfirmRegister = true;

  showReset = false;

  resetPasswordEmail = '';

  constructor(
    private authService: AuthService,
    private modalService: ModalsService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // this.login();
  }

  async login(): Promise<void> {
    try {
      await this.authService.signIn(this.email, this.password);
      this.router.navigate(['home']);
    } catch (error) {
      this.modalService.openErrorSnack(`Λάθος στοιχεία!`);
    }
  }

  async register(): Promise<void> {
    try {
      await this.authService.register(this.newUser);
    } catch (error) {
      console.error(error);
      this.modalService.openErrorSnack(`Λάθος στοιχεία!`);
    }
  }

  async resetPassword(): Promise<void> {
    try {
      await this.authService.auth.sendPasswordResetEmail(this.resetPasswordEmail);
      this.modalService.openSuccessSnack(`Στάλθηκε στο ${this.resetPasswordEmail}`)
    } catch (error) {
      console.error(error);
      this.modalService.openErrorSnack(`Κάτι πήγε στραβά!`);
    }
  }

}
