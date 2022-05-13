import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { ModalResourceCourseStudentComponent } from './modal-resource-course-student.component';

@Injectable({
  providedIn: 'root',
})
export class ModalResourceCourseStudentService {
  constructor(
    private _dialog: MatDialog,
    private _layoutService: LayoutService
  ) {}
  _dialogRef: any;

  openModalResourceCourseStudent(id_resource_course: string) {
    this._layoutService.setOpenModal(true);
    return (this._dialogRef = this._dialog.open(
      ModalResourceCourseStudentComponent,
      {
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
      }
    ));
  }

  closeModalResourceCourseStudent() {
    this._dialogRef.close();
  }
}
