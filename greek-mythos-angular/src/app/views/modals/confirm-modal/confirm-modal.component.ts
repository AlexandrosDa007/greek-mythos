import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';



@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit {

  constructor(
    private matDialogRef: MatDialogRef<ConfirmModalComponent>
  ) { }

  ngOnInit(): void {
  }

  close(res: boolean): void {
    this.matDialogRef.close(res);
  }

}
