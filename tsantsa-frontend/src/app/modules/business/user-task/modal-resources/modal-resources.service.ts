import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { ModalResourcesComponent } from './modal-resources.component';

@Injectable({
  providedIn: 'root',
})
export class ModalResourcesService {
  constructor(
    private _dialog: MatDialog,
    private _layoutService: LayoutService
  ) {}
  dialogRef: any;

  openModalResources(id_task: string) {
    this._layoutService.setOpenModal(true);

    return (this.dialogRef = this._dialog.open(ModalResourcesComponent, {
      minHeight: 'inherit',
      maxHeight: 'inherit',
      height: 'auto',
      width: '32rem',
      maxWidth: '',
      panelClass: ['mat-dialog-cont'],
      data: {
        id_task,
      },
      disableClose: true,
    }));
  }

  closeModalResources() {
    this.dialogRef.close();
  }
}
