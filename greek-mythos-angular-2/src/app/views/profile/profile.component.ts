import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { User } from '@app/models/user';
import { AuthService } from '@app/services/auth.service';
import { ModalsService } from '@app/services/modals.service';
import { PresenceService } from '@app/services/presence.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

  user: User | null = null;
  imageFile: File | null = null;
  imageUrl?: string;

  destroy$ = new EventEmitter();

  constructor(
    private authService: AuthService,
    private presenceService: PresenceService,
    private modalService: ModalsService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.authService.getUserProfile(this.authService.appUser!.uid).pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
        if (this.user?.imageUrl) {
          this.imageUrl = this.user.imageUrl;
        } else {
          this.imageUrl = undefined;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.emit();
  }

  async processImage(imageInput: HTMLInputElement): Promise<void> {
    if (this.user!.inGame) {
      this.modalService.openErrorSnack(`Δεν μπορείς όταν είσαι σε παιχνίδι!`);
      return;
    }
  
    try {
      const image = (imageInput.files ?? [])[0] as File;
      if (!image) {
        console.error('User doesnt have an image');
        this.modalService.openErrorSnack(`Κάτι πήγε στραβά!`);
        return;
      }
      if (image.size > 5 * 1024 * 1024) {
        console.error('Image cannot be more than 4MB');
        this.modalService.openErrorSnack(`Η εικόνα δεν μπορεί να είναι μεγαλύτερη απο 5MB!`);
        return;
      }
      this.imageFile = image;
      try {
        await this.authService.uploadImage(this.imageFile);
        this.modalService.openSuccessSnack(`Η εικόνα μεταφορτώθηκε...`);
      } catch (error) {
        this.modalService.openErrorSnack(`Κάτι πήγε στραβά!`);
      }
    } catch (error) {
      console.error(error);
    }

  }

  async removeImage(): Promise<void> {
    console.log(`removing image`);
    if (this.user!.inGame) {
      this.modalService.openErrorSnack(`Δεν μπορείς όταν είσαι σε παιχνίδι!`);
      return;
    }
    try {
      await this.authService.deleteProfileImage(this.user);
      this.imageFile = null;
      this.modalService.openSuccessSnack(`Η εικόνα διαγράφτηκε...`);
    } catch (error) {
      console.log(error);

      this.modalService.openErrorSnack(`Κάτι πήγε στραβά!`);
    }
  }

  async updateProfile(): Promise<void> {
    if (this.user!.inGame) {
      this.modalService.openErrorSnack(`Δεν μπορείς όταν είσαι σε παιχνίδι!`);
      return;
    }
    try {
      await this.authService.updateProfile(this.user!.displayName);
      this.modalService.openSuccessSnack(`Η ενημέρωση πέτυχε!`);
    } catch (error) {
      this.modalService.openErrorSnack(`Κάτι πήγε στραβά!`);
    }

  }

  async deleteMyAccount(): Promise<void> {
    if (this.user!.inGame) {
      this.modalService.openErrorSnack(`Δεν μπορείς όταν είσαι σε παιχνίδι!`);
      return;
    }

    const result = await this.modalService.openDeleteAccount(this.user!.email);
    if (result) {
      try {
        await this.authService.signIn(result.email, result.password);
        const res = await this.authService.deleteAccount();
        if (res) {
          this.presenceService.onDisconectSubscription?.unsubscribe();
          await this.authService.auth.signOut();
          this.modalService.openSuccessSnack(`Ο λογαριασμός διαγράφηκε επιτυχώς`)
        }
      } catch (error) {
        console.error(error);
        this.modalService.openErrorSnack(`Κάτι πήγε στραβά`);
      }
    }
  }

  async changePassword(): Promise<void> {
    try {
      await this.authService.auth.sendPasswordResetEmail(this.user!.email);
      this.modalService.openSuccessSnack(`Στάλθηκε email αλλαγής κωδικού.`);
    } catch (error) {
      console.error(error);
      this.modalService.openErrorSnack('Κάτι πήγε στραβά!');
    }
  }
}
