import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { ModalViewSchemaComponent } from './modal-view-schema.component';

@Injectable({
  providedIn: 'root',
})
export class ModalViewSchemaService {
  constructor(
    private _dialog: MatDialog,
    private _layoutService: LayoutService
  ) {}

  openModalViewSchema(schema: any) {
    this._layoutService.setOpenModal(true);
    return this._dialog.open(ModalViewSchemaComponent, {
      minHeight: 'inherit',
      maxHeight: '90vh',
      height: 'auto',
      width: '32rem',
      maxWidth: '',
      panelClass: ['mat-dialog-cont'],
      data: {
        schema,
      },
      disableClose: true,
    });
  }

  closeModalViewSchema() {
    this._dialog.closeAll();
  }
}
