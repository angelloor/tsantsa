import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { ModalUserTasksComponent } from './modal-user-tasks.component';

@Injectable({
  providedIn: 'root',
})
export class ModalUserTasksService {
  constructor(
    private _dialog: MatDialog,
    private _layoutService: LayoutService
  ) {}
  dialogRef: any;

  openModalUserTasks(id_task: string) {
    this._layoutService.setOpenModal(true);

    return (this.dialogRef = this._dialog.open(ModalUserTasksComponent, {
      minHeight: 'inherit',
      maxHeight: '90vh',
      height: 'auto',
      width: '50rem',
      maxWidth: '',
      panelClass: ['mat-dialog-cont'],
      data: {
        id_task,
      },
      disableClose: true,
    }));
  }

  closeModalUserTasks() {
    this.dialogRef.close();
  }
}
