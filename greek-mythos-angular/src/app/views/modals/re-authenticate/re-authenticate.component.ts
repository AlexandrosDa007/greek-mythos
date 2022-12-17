import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
/**
 * @deprecated Use DeleteAccountModalComponent
 */
@Component({
  selector: 'app-re-authenticate',
  templateUrl: './re-authenticate.component.html',
  styleUrls: ['./re-authenticate.component.scss']
})
export class ReAuthenticateComponent implements OnInit {

  email = '';
  password = '';

  hide = true;

  constructor(
    private matDialogRef: MatDialogRef<ReAuthenticateComponent>,
  ) { }

  ngOnInit(): void {
  }

  async deleteAccount(): Promise<void> {
    this.matDialogRef.close({ email: this.email, password: this.password });
  }

  close(): void {
    this.matDialogRef.close();
  }

}
