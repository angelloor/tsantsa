import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { ModalUploadResourceCourseComponent } from './modal-upload-resource-course.component';

@Injectable({
  providedIn: 'root',
})
export class ModalUploadResourceCourseService {
  constructor(
    private _dialog: MatDialog,
    private _layoutService: LayoutService
  ) {}
  _dialogRef: any;

  openModalUploadResourceCourse(id_course: string) {
    this._layoutService.setOpenModal(true);
    return (this._dialogRef = this._dialog.open(
      ModalUploadResourceCourseComponent,
      {
        minHeight: 'inherit',
        maxHeight: '90vh',
        height: 'auto',
        width: '20rem',
        maxWidth: '',
        panelClass: ['mat-dialog-cont'],
        disableClose: true,
        data: {
          id_course,
        },
      }
    ));
  }

  closeModalUploadResourceCourse() {
    this._dialogRef.close();
  }
}
