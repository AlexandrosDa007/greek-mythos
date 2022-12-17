import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ModalsService } from 'src/app/services/modals.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  errorMessage: string;
  newUser = {
    email: '',
    password: '',
    passwordConfirm: '',
    displayName: '',
    image: null
  };
  showRegister = false;
  imageUrl: string;
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

  async processImage(imageInput) {
    console.log(imageInput);

    this.newUser.image = imageInput.files[0] as File;
    if (!this.newUser.image) {
      this.imageUrl = null;
      console.error('User doesnt have an image');
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(this.newUser.image);


    reader.onload = (ev) => {
      this.imageUrl = ev.target.result as string;
    };
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
