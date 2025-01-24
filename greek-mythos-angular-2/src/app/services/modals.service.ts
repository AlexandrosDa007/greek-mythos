import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { Room } from '../models/room';
import { AlertModalComponent } from '../views/modals/alert-modal/alert-modal.component';
import { ConfirmModalComponent } from '../views/modals/confirm-modal/confirm-modal.component';
import { DeleteAccountComponent } from '../views/modals/delete-account/delete-account.component';
import { FriendModalComponent } from '../views/modals/friend-modal/friend-modal.component';
import { ReAuthenticateComponent } from '../views/modals/re-authenticate/re-authenticate.component';

@Injectable({
    providedIn: 'root'
})
export class ModalsService {

    constructor(
        private matDialog: MatDialog,
        private _snackBar: MatSnackBar,
    ) { }

    async openDeleteAccount(email: string): Promise<{ email: string, password: string } | null> {
        return await this.matDialog.open(DeleteAccountComponent, {
            width: '400px',
            height: '400px',
            data: email,
        }).afterClosed().toPromise();
    }

    async openReAuthenticate(): Promise<{ email: string, password: string } | null> {
        return await this.matDialog.open(ReAuthenticateComponent, {
            width: '800px',
            height: '600px',
        }).afterClosed().toPromise();
    }

    async openLeaveRoomModal(): Promise<boolean> {
        return await this.matDialog.open(ConfirmModalComponent, {
            width: '400px',
            height: '400px',
        }).afterClosed().toPromise();
    }

    async openAlert(message: string): Promise<void> {
        await this.matDialog.open(AlertModalComponent, {
            width: '400px',
            height: '400px',
            data: message
        }).afterClosed().toPromise();
    }

    async openFriendModal(room: Room): Promise<void> {
        await this.matDialog.open(FriendModalComponent, {
            width: '400px',
            height: '600px',
            data: { room }
        }).afterClosed().toPromise();
    }

    openErrorSnack(error: string): void {
        this._snackBar.open(error, '', {
            panelClass: 'error-snack',
            duration: 2000
        });
    }

    openSuccessSnack(message: string): void {
        this._snackBar.open(message, '', {
            panelClass: 'success-snack',
            duration: 2000
        });
    }

    openJoinRoomSnack(): MatSnackBarRef<TextOnlySnackBar> {
        return this._snackBar.open(`Σύνδεση...`, '', {
            panelClass: 'info-snack',
        });
    }

    openYellowSnack(message: string): void {
        this._snackBar.open(message, '', {
            duration: 2000,
            panelClass: 'info-snack',
        });
    }
}
