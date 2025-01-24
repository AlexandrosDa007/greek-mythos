import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.scss']
})
export class DeleteAccountComponent implements OnInit {


  password = '';

  canDelete = 5;

  hide = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public email: string,
    private matDialogRef: MatDialogRef<DeleteAccountComponent>,
  ) { }

  ngOnInit(): void {
    timer(0, 1000).pipe(takeWhile(v => v < 6)).subscribe(v => {
      this.canDelete = (5 - v);
    })
  }

  deleteAccount(): void {
    this.matDialogRef.close({email: this.email, password: this.password});
  }

  cancel(): void {
    this.matDialogRef.close();
  }

}
