import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { Newsletter } from 'app/modules/core/newsletter/newsletter.types';
import { ModalViewNewsletterComponent } from './modal-view-newsletter.component';

@Injectable({
  providedIn: 'root',
})
export class ModalViewNewsletterService {
  constructor(
    private _dialog: MatDialog,
    private _layoutService: LayoutService
  ) {}
  _dialogRef: any;

  openModalViewNewsletter(newsletter: Newsletter) {
    this._layoutService.setOpenModal(true);
    return (this._dialogRef = this._dialog.open(ModalViewNewsletterComponent, {
      minHeight: 'inherit',
      maxHeight: '90vh',
      height: 'auto',
      width: '30rem',
      maxWidth: '',
      panelClass: ['mat-dialog-cont'],
      disableClose: true,
      data: {
        newsletter,
      },
    }));
  }

  closeModalViewNewsletter() {
    this._dialogRef.close();
  }
}
