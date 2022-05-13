import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ModalTypeValidationComponent } from './modal-type-validation.component';

@Injectable({
  providedIn: 'root',
})
export class ModalTypeValidationService {
  _openMatDrawer: boolean = false;
  private openMatDrawer: BehaviorSubject<boolean> = new BehaviorSubject(
    this._openMatDrawer
  );

  get openMatDrawer$(): Observable<boolean> {
    return this.openMatDrawer.asObservable();
  }

  constructor(
    private _dialog: MatDialog,
    private _layoutService: LayoutService
  ) {}

  openModalTypeValidation() {
    this._layoutService.setOpenModal(true);
    return this._dialog.open(ModalTypeValidationComponent, {
      minHeight: 'inherit',
      maxHeight: '90vh',
      height: 'auto',
      width: '32rem',
      maxWidth: '',
      panelClass: ['mat-dialog-cont'],
    });
  }

  closeModalTypeValidation() {
    this._dialog.closeAll();
  }

  setOpenMatDrawer(status: boolean): void {
    this.openMatDrawer.next(status);
  }
}
