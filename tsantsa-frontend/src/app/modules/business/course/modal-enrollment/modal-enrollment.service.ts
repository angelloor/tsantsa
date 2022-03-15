import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalEnrollmentComponent } from './modal-enrollment.component';

@Injectable({
  providedIn: 'root',
})
export class ModalEnrollmentService {
  constructor(private _dialog: MatDialog) {}

  openModalEnrollment(id_course: string) {
    return this._dialog.open(ModalEnrollmentComponent, {
      minHeight: 'inherit',
      maxHeight: '90vh',
      height: 'auto',
      width: '40rem',
      maxWidth: '',
      panelClass: ['mat-dialog-cont'],
      data: {
        id_course,
      },
    });
  }

  closeModalEnrollment() {
    this._dialog.closeAll();
  }
}
