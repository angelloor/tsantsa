import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { ModalAssistancesComponent } from './modal-assistances.component';

@Injectable({
  providedIn: 'root',
})
export class ModalAssistancesService {
  constructor(
    private _dialog: MatDialog,
    private _layoutService: LayoutService
  ) {}
  dialogRef: any;

  openModalAssistances(id_course: string) {
    this._layoutService.setOpenModal(true);

    return (this.dialogRef = this._dialog.open(ModalAssistancesComponent, {
      minHeight: 'inherit',
      maxHeight: 'inherit',
      height: 'auto',
      width: '32rem',
      maxWidth: '',
      panelClass: ['mat-dialog-cont'],
      data: {
        id_course,
      },
      disableClose: true,
    }));
  }

  closeModalAssistances() {
    this.dialogRef.close();
  }
}
