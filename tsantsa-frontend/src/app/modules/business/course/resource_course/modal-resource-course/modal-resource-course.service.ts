import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { ModalResourceCourseComponent } from './modal-resource-course.component';

@Injectable({
  providedIn: 'root',
})
export class ModalResourceCourseService {
  constructor(
    private _dialog: MatDialog,
    private _layoutService: LayoutService
  ) {}
  _dialogRef: any;

  openModalResourceCourse(id_resource_course: string) {
    this._layoutService.setOpenModal(true);
    return (this._dialogRef = this._dialog.open(ModalResourceCourseComponent, {
      minHeight: 'inherit',
      maxHeight: '90vh',
      height: 'auto',
      width: '35rem',
      maxWidth: '',
      panelClass: ['mat-dialog-cont'],
      disableClose: true,
      data: {
        id_resource_course,
      },
    }));
  }

  closeModalResourceCourse() {
    this._dialogRef.close();
  }
}
