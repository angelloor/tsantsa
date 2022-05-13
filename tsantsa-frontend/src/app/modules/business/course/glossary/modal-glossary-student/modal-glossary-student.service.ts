import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { ModalGlossaryStudentComponent } from './modal-glossary-student.component';

@Injectable({
  providedIn: 'root',
})
export class ModalGlossaryStudentService {
  constructor(
    private _dialog: MatDialog,
    private _layoutService: LayoutService
  ) {}
  _dialogRef: any;

  openModalGlossaryStudent(id_glosary: string) {
    this._layoutService.setOpenModal(true);
    return (this._dialogRef = this._dialog.open(ModalGlossaryStudentComponent, {
      minHeight: 'inherit',
      maxHeight: '90vh',
      height: 'auto',
      width: '30rem',
      maxWidth: '',
      panelClass: ['mat-dialog-cont'],
      disableClose: true,
      data: {
        id_glosary,
      },
    }));
  }

  closeModalGlossaryStudent() {
    this._dialogRef.close();
  }
}
