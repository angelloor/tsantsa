import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { ModalUserTasksByCourseComponent } from './modal-user-tasks-by-course.component';

@Injectable({
  providedIn: 'root',
})
export class ModalUserTasksByCourseService {
  constructor(
    private _dialog: MatDialog,
    private _layoutService: LayoutService
  ) {}
  dialogRef: any;

  openModalUserTasksByCourse(id_course: string) {
    this._layoutService.setOpenModal(true);

    return (this.dialogRef = this._dialog.open(
      ModalUserTasksByCourseComponent,
      {
        minHeight: 'inherit',
        maxHeight: '90vh',
        height: 'auto',
        width: '50rem',
        maxWidth: '',
        panelClass: ['mat-dialog-cont'],
        data: {
          id_course,
        },
        disableClose: true,
      }
    ));
  }

  closeModalUserTasksByCourse() {
    this.dialogRef.close();
  }
}
