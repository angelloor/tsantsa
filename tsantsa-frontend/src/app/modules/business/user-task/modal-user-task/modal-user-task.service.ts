import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { ModalUserTaskComponent } from './modal-user-task.component';

@Injectable({
  providedIn: 'root',
})
export class ModalUserTaskService {
  constructor(
    private _dialog: MatDialog,
    private _layoutService: LayoutService
  ) {}
  dialogRef: any;

  openModalUserTask(id_user_task: string) {
    this._layoutService.setOpenModal(true);

    return (this.dialogRef = this._dialog.open(ModalUserTaskComponent, {
      minHeight: 'inherit',
      maxHeight: '90vh',
      height: 'auto',
      width: '45rem',
      maxWidth: '',
      panelClass: ['mat-dialog-cont'],
      data: {
        id_user_task,
      },
      disableClose: true,
    }));
  }

  closeModalUserTask() {
    this.dialogRef.close();
  }
}
