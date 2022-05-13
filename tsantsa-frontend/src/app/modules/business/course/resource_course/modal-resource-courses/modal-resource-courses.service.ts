import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { ModalResourceCoursesComponent } from './modal-resource-courses.component';

@Injectable({
  providedIn: 'root',
})
export class ModalResourceCoursesService {
  constructor(
    private _dialog: MatDialog,
    private _layoutService: LayoutService
  ) {}
  _dialogRef: any;

  openModalResourceCourses(id_course: string) {
    this._layoutService.setOpenModal(true);
    return (this._dialogRef = this._dialog.open(ModalResourceCoursesComponent, {
      minHeight: 'inherit',
      maxHeight: '90vh',
      height: 'auto',
      width: '50rem',
      maxWidth: '',
      panelClass: ['mat-dialog-cont'],
      disableClose: true,
      data: {
        id_course,
      },
    }));
  }

  closeModalResourceCourses() {
    this._dialogRef.close();
  }
}
