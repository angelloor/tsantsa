import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { ModalResourceComponent } from './modal-resource.component';

@Injectable({
  providedIn: 'root',
})
export class ModalResourceService {
  constructor(
    private _dialog: MatDialog,
    private _layoutService: LayoutService
  ) {}
  dialogRef: any;

  openModalResource(id_resource: string) {
    this._layoutService.setOpenModal(true);

    return (this.dialogRef = this._dialog.open(ModalResourceComponent, {
      minHeight: 'inherit',
      maxHeight: '90vh',
      height: 'auto',
      width: '32rem',
      maxWidth: '',
      panelClass: ['mat-dialog-cont'],
      data: {
        id_resource,
      },
      disableClose: true,
    }));
  }

  closeModalResource() {
    this.dialogRef.close();
  }
}
