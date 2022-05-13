import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import {
  ActionAngelConfirmation,
  AngelConfirmationService,
} from '@angel/services/confirmation';
import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { user } from 'app/modules/core/user/user.data';
import { UserService } from 'app/modules/core/user/user.service';
import { User } from 'app/modules/core/user/user.types';
import { NotificationService } from 'app/shared/notification/notification.service';
import { saveAs } from 'file-saver';
import { Subject, takeUntil } from 'rxjs';
import { course } from '../../course.data';
import { CourseService } from '../../course.service';
import { Course } from '../../course.types';
import { ResourceCourseService } from '../resource-course.service';
import {
  ResourceCourse,
  TYPE_RESOURCE_COURSE_ENUM,
  _typeResourceCourse,
} from '../resource-course.types';
import { ModalResourceCourseService } from './modal-resource-course.service';

@Component({
  selector: 'app-modal-resource-course',
  templateUrl: './modal-resource-course.component.html',
  animations: angelAnimations,
})
export class ModalResourceCourseComponent implements OnInit {
  id_resource_course: string = '';

  typeResourceCourse: TYPE_RESOURCE_COURSE_ENUM[] = _typeResourceCourse;

  categoriesCourse: Course[] = [];
  selectedCourse: Course = course;

  categoriesUser: User[] = [];
  selectedUser: User = user;

  nameEntity: string = 'Recursos de la asignatura';
  private data!: AppInitialData;

  userId: string = '';
  /**
   * Alert
   */
  alert: { type: AngelAlertType; message: string } = {
    type: 'error',
    message: '',
  };
  showAlert: boolean = false;
  /**
   * Alert
   */
  resourceCourse!: ResourceCourse;
  resourceCourseForm!: FormGroup;
  private resourceCourses!: ResourceCourse[];

  private _tagsPanelOverlayRef!: OverlayRef;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  /**
   * isOpenModal
   */
  isOpenModal: boolean = false;
  /**
   * isOpenModal
   */
  /**
   * Constructor
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _store: Store<{ global: AppInitialData }>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _resourceCourseService: ResourceCourseService,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _courseService: CourseService,
    private _userService: UserService,
    private _modalResourceCourseService: ModalResourceCourseService
  ) {}

  /** ----------------------------------------------------------------------------------------------------- */
  /** @ Lifecycle hooks
	  /** ----------------------------------------------------------------------------------------------------- */

  /**
   * On init
   */
  ngOnInit(): void {
    this.id_resource_course = this._data.id_resource_course;
    /**
     * isOpenModal
     */
    this._layoutService.isOpenModal$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_isOpenModal: boolean) => {
        this.isOpenModal = _isOpenModal;
      });
    /**
     * isOpenModal
     */
    /**
     * Subscribe to user changes of state
     */
    this._store.pipe(takeUntil(this._unsubscribeAll)).subscribe((state) => {
      this.data = state.global;
    });
    /**
     * Create the resourceCourse form
     */
    this.resourceCourseForm = this._formBuilder.group({
      removablefileInitial: [''],
      id_resource_course: [''],
      id_course: [''],
      id_user: [''],
      file_name: ['', [Validators.required, Validators.maxLength(250)]],
      length_mb: ['', [Validators.required, Validators.maxLength(10)]],
      extension: ['', [Validators.required, Validators.maxLength(10)]],
      server_path: ['', [Validators.required, Validators.maxLength(250)]],
      upload_date: ['', [Validators.required]],
    });
    /**
     * Get the resourceCourses
     */
    this._resourceCourseService
      .readResourceCourseByIdLocal(this.id_resource_course)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe();
    /**
     * Get the resourceCourses
     */
    this._resourceCourseService.resourceCourses$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resourceCourses: ResourceCourse[]) => {
        this.resourceCourses = resourceCourses;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the resourceCourse
     */
    this._resourceCourseService.resourceCourse$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resourceCourse: ResourceCourse) => {
        /**
         * Get the resourceCourse
         */
        this.resourceCourse = resourceCourse;

        // Course
        this._courseService
          .readAllCourse()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((courses: Course[]) => {
            this.categoriesCourse = courses;

            this.selectedCourse = this.categoriesCourse.find(
              (item) =>
                item.id_course ==
                this.resourceCourse.course.id_course.toString()
            )!;
          });

        // User
        this._userService
          .readAllUser()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((users: User[]) => {
            this.categoriesUser = users;

            this.selectedUser = this.categoriesUser.find(
              (item) =>
                item.id_user == this.resourceCourse.user.id_user.toString()
            )!;
          });

        /**
         * Patch values to the form
         */
        this.patchForm();
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
  }
  /**
   * Pacth the form with the information of the database
   */
  patchForm(): void {
    this.resourceCourseForm.patchValue(this.resourceCourse);
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    /**
     * Unsubscribe from all subscriptions
     */
    this._unsubscribeAll.next(0);
    this._unsubscribeAll.complete();
    /**
     * Dispose the overlays if they are still on the DOM
     */
    if (this._tagsPanelOverlayRef) {
      this._tagsPanelOverlayRef.dispose();
    }
  }

  /** ----------------------------------------------------------------------------------------------------- */
  /** @ Public methods
	  /** ----------------------------------------------------------------------------------------------------- */
  /**
   * Update the resourceCourse
   */
  updateResourceCourse(): void {
    /**
     * Get the resourceCourse
     */
    const id_user_ = this.data.user.id_user;
    let resourceCourse = this.resourceCourseForm.getRawValue();
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    resourceCourse = {
      ...resourceCourse,
      id_user_: parseInt(id_user_),
      id_resource_course: parseInt(resourceCourse.id_resource_course),
      course: {
        id_course: parseInt(resourceCourse.id_course),
      },
      user: {
        id_user: parseInt(resourceCourse.id_user),
      },
    };
    /**
     * Update
     */
    this._resourceCourseService
      .updateResourceCourse(resourceCourse)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_resourceCourse: ResourceCourse) => {
          if (_resourceCourse) {
            this._notificationService.success(
              'Recursos de la asignatura actualizada correctamente'
            );
          } else {
            this._notificationService.error(
              '¡Error interno!, consulte al administrador.'
            );
          }
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
   * Delete the resourceCourse
   */
  deleteResourceCourse(): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar recursos de la asignatura',
        message:
          '¿Estás seguro de que deseas eliminar esta recursos de la asignatura? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the current resourceCourse's id
           */
          const id_user_ = this.data.user.id_user;
          const id_resource_course = this.resourceCourse.id_resource_course;
          /**
           * Delete the resourceCourse
           */
          this._resourceCourseService
            .deleteResourceCourse(id_user_, id_resource_course)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the resourceCourse wasn't deleted_newsletter...
                   */
                  this._notificationService.success(
                    'Recursos de la asignatura eliminada correctamente'
                  );

                  this.closeModalResourceCourse();
                } else {
                  this._notificationService.error(
                    '¡Error interno!, consulte al administrador.'
                  );
                }
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
          /**
           * Mark for check
           */
          this._changeDetectorRef.markForCheck();
        }
        this._layoutService.setOpenModal(false);
      });
  }
  /**
   * downloadFile
   */
  downloadFile(server_path: string) {
    this._resourceCourseService
      .downloadFile(server_path)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (dataSource: Blob) => {
          if (dataSource) {
            saveAs(dataSource, this.getNameFile(server_path));
          } else {
            this._notificationService.error(
              'Ocurrió un error descargando el archivo'
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
  getInfoFile = (nameFile: string) => {
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
  };
  /**
   * getNameFile
   * @param server_path
   * @returns
   */
  getNameFile = (server_path: string): string => {
    let position: number = 0;
    for (let index = 0; index < server_path.length; index++) {
      const caracter: string = server_path.substring(index, index + 1);
      if (caracter == '/') {
        position = index;
      }
    }
    return server_path.substring(position + 1, server_path.length);
  };
  /**
   * getAbreviationNameFile
   * @param nameFile
   * @returns
   */
  getAbreviationNameFile(nameFile: string): string {
    return nameFile.length > 10
      ? `${nameFile.substring(0, 5)}...${nameFile.substring(
          nameFile.length - 5,
          nameFile.length
        )}`
      : nameFile;
  }
  /**
   * closeModalResourceCourse
   */
  closeModalResourceCourse(): void {
    this._modalResourceCourseService.closeModalResourceCourse();
  }
  /**
   * getTypeSelectResourceCourse
   * @param extension
   */
  getTypeSelectResourceCourse(extension: string): string | undefined {
    return this.typeResourceCourse.find(
      (item: TYPE_RESOURCE_COURSE_ENUM) => item.value_type === extension
    )
      ? this.typeResourceCourse.find(
          (item: TYPE_RESOURCE_COURSE_ENUM) => item.value_type === extension
        )?.name_type
      : undefined;
  }
}
