import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss']
})
export class AlertModalComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public message: string,
    private matDialogRef: MatDialogRef<AlertModalComponent>,
  ) { }

  ngOnInit(): void {
  }

  closeModal(): void {
    this.matDialogRef.close();
  }
}
