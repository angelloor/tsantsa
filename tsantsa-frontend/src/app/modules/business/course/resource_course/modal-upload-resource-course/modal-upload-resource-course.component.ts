import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { NotificationService } from 'app/shared/notification/notification.service';
import { Subject, takeUntil } from 'rxjs';
import { ResourceCourseService } from '../resource-course.service';
import { ModalUploadResourceCourseService } from './modal-upload-resource-course.service';

@Component({
  selector: 'app-modal-upload-resource-course',
  templateUrl: './modal-upload-resource-course.component.html',
})
export class ModalUploadResourceCourseComponent implements OnInit {
  id_course: string = '';

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private data!: AppInitialData;

  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _modalUploadResourceCourseService: ModalUploadResourceCourseService,
    private _store: Store<{ global: AppInitialData }>,
    private _resourceCourseService: ResourceCourseService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.id_course = this._data.id_course;
    /**
     * Subscribe to user changes of state
     */
    this._store.pipe(takeUntil(this._unsubscribeAll)).subscribe((state) => {
      this.data = state.global;
    });
  }
  /**
   * uploadFile
   * @param target
   */
  uploadFile(target: any): void {
    const id_user_ = this.data.user.id_user;
    const files: FileList = target.files;
    const file: File = files[0];

    const size: string = parseFloat(
      (file.size / 1024 / 1024).toFixed(2)
    ).toString();
    const name: string = this.getInfoFile(file.name).name;
    const type: string = this.getInfoFile(file.name).extension;

    this._resourceCourseService
      .createResourceCourse(id_user_, this.id_course, name, size, type, file)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: any) => {
          if (response) {
            this._notificationService.success('Archivo subido correctamente');

            this.closeModalUploadResourceCourse();
          } else {
            this._notificationService.error(
              'Ocurrió un error subiendo el archivo'
            );
          }
          /**
           * Mark for check
           */
          this._changeDetectorRef.markForCheck();
        },
        error: (error: { error: MessageAPI }) => {
          this._notificationService.error(
            !error.error
              ? '¡Error interno!, consulte al administrador.'
              : !error.error.descripcion
              ? '¡Error interno!, consulte al administrador.'
              : error.error.descripcion
          );
        },
      });
  }
  /**
   * getInfoFile
   * @param nameFile
   * @returns { name, extension }
   */
  getInfoFile(nameFile: string): { name: string; extension: string } {
    let position: number = 0;
    for (let index = 0; index < nameFile.length; index++) {
      const caracter: string = nameFile.substring(index, index + 1);
      if (caracter == '.') {
        position = index;
      }
    }
    return {
      name: nameFile.substring(0, position),
      extension: nameFile.substring(position, nameFile.length),
    };
  }
  /**
   * closeModalUploadResourceCourse
   */
  closeModalUploadResourceCourse(): void {
    this._modalUploadResourceCourseService.closeModalUploadResourceCourse();
  }
}
