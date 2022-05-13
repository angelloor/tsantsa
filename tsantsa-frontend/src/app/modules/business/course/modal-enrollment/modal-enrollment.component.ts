import { angelAnimations } from '@angel/animations';
import {
  ActionAngelConfirmation,
  AngelConfirmationService,
} from '@angel/services/confirmation';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { ModalSelectUserService } from 'app/modules/core/shared/modal-select-user/modal-select-user.service';
import { UserService } from 'app/modules/core/user/user.service';
import { User } from 'app/modules/core/user/user.types';
import { NotificationService } from 'app/shared/notification/notification.service';
import { LocalDatePipe } from 'app/shared/pipes/local-date.pipe';
import { cloneDeep } from 'lodash';
import { Subject, takeUntil } from 'rxjs';
import { EnrollmentService } from '../../enrollment/enrollment.service';
import { Enrollment } from '../../enrollment/enrollment.types';
import { ModalEnrollmentService } from './modal-enrollment.service';

@Component({
  selector: 'app-modal-enrollment',
  templateUrl: './modal-enrollment.component.html',
  animations: angelAnimations,
  providers: [LocalDatePipe],
})
export class ModalEnrollmentComponent implements OnInit {
  id_course: string = '';

  courseHavedTasks: boolean = false;

  courseFormModal!: FormGroup;
  isSelectedAll: boolean = false;
  private data!: AppInitialData;

  users: User[] = [];
  enrollments: Enrollment[] = [];

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _store: Store<{ global: AppInitialData }>,
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _enrollmentService: EnrollmentService,
    private _formBuilder: FormBuilder,
    private _modalEnrollmentService: ModalEnrollmentService,
    private _userService: UserService,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _modalSelectUserService: ModalSelectUserService
  ) {}

  ngOnInit(): void {
    this.id_course = this._data.id_course;
    /**
     * Subscribe to user changes of state
     */
    this._store.pipe(takeUntil(this._unsubscribeAll)).subscribe((state) => {
      this.data = state.global;
    });
    /**
     * Create the enrollment form
     */
    this.courseFormModal = this._formBuilder.group({
      enrollments: this._formBuilder.array([]),
    });

    this._enrollmentService
      .byCourseRead(this.id_course)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe();

    this._userService
      .readAllUser()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_users: User[]) => {
        this.users = _users;
        /**
         * Subscribe
         */
        this._enrollmentService.enrollments$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((_enrollments: Enrollment[]) => {
            this.enrollments = _enrollments;

            if (this.enrollments.length >= 1) {
              if (parseInt(this.enrollments[0].course.tasks!) >= 1) {
                this.courseHavedTasks = true;
              }
            }

            if (this.enrollments.length == this.users.length) {
              this.isSelectedAll = true;
            } else {
              this.isSelectedAll = false;
            }
            /**
             * Filter select
             */
            /**
             * Reset the selection
             * 1) add attribute isSelected
             * 2) [disabled]="entity.isSelected" in mat-option
             */
            this.users.map((item, index) => {
              item = {
                ...item,
                isSelected: false,
              };
              this.users[index] = item;
            });

            let filterCategoriesUsers: User[] = cloneDeep(this.users);
            /**
             * Selected Items
             */
            this.enrollments.map((itemOne) => {
              /**
               * All Items
               */
              filterCategoriesUsers.map((itemTwo, index) => {
                if (itemTwo.id_user == itemOne.user!.id_user) {
                  itemTwo = {
                    ...itemTwo,
                    isSelected: true,
                  };

                  filterCategoriesUsers[index] = itemTwo;
                }
              });
            });

            this.users = filterCategoriesUsers;
            /**
             * Filter select
             */

            /**
             * Clear the users form arrays
             */
            (this.courseFormModal.get('enrollments') as FormArray).clear();

            const usersFormGroups: any = [];

            /**
             * Iterate through them
             */
            this.enrollments.forEach((_enrollment, index: number) => {
              /**
               * Create an official form group
               */
              usersFormGroups.push(
                this._formBuilder.group({
                  id_enrollment: [_enrollment.id_enrollment],
                  course: [_enrollment.course],
                  id_user: [
                    {
                      value: _enrollment.user.id_user,
                      disabled: true,
                    },
                  ],
                  date_enrollment: [_enrollment.date_enrollment],
                  status_enrollment: [_enrollment.status_enrollment],
                  completed_course: [_enrollment.completed_course],
                  deleted_enrollment: [_enrollment.deleted_enrollment],
                })
              );
            });

            /**
             * Add the enrollments form groups to the enrollments form array
             */
            usersFormGroups.forEach((usersFormGroup: any) => {
              (this.courseFormModal.get('enrollments') as FormArray).push(
                usersFormGroup
              );
            });
          });
      });
  }
  get formArrayEnrollment(): FormArray {
    return this.courseFormModal.get('enrollments') as FormArray;
  }

  getFromControl(
    formArray: FormArray,
    index: number,
    control: string
  ): FormControl {
    return formArray.controls[index].get(control) as FormControl;
  }
  /**
   * closeModalEnrollment
   */
  closeModalEnrollment() {
    this._modalEnrollmentService.closeModalEnrollment();
  }
  /**
   * openModalSelectUser
   */
  openModalSelectUser() {
    this._modalSelectUserService
      .openModalSelectUser()
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((id_user: string) => {
        if (id_user) {
          const userExists = this.enrollments.find(
            (enrollment) => enrollment.user.id_user == id_user
          );

          if (!userExists) {
            const id_user_ = this.data.user.id_user;
            /**
             * Create the enrollment
             */
            this._enrollmentService
              .createEnrollment(id_user_, this.id_course, id_user)
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe({
                next: (_enrollment: Enrollment) => {
                  if (_enrollment) {
                    this._notificationService.success(
                      'Matrícula agregada correctamente'
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
          } else {
            this._notificationService.warn(
              `El usuario ${
                userExists.user.person.name_person +
                ' ' +
                userExists.user.person.last_name_person
              } ya se encuentra matrículado`
            );
          }
        }
      });
  }
  /**
   * updateStatusEnrollment
   * @param index
   */
  updateStatusEnrollment(index: number): void {
    const id_user_ = this.data.user.id_user;

    const enrollmentElementFormArray = this.courseFormModal.get(
      'enrollments'
    ) as FormArray;
    let enrollment = enrollmentElementFormArray.getRawValue()[index];

    enrollment = {
      ...enrollment,
      id_user_: parseInt(id_user_),
      id_enrollment: parseInt(enrollment.id_enrollment),
      course: {
        id_course: parseInt(enrollment.course.id_course),
      },
      user: {
        id_user: parseInt(enrollment.id_user),
      },
    };

    /**
     * Update
     */
    this._enrollmentService
      .updateEnrollment(enrollment)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_enrollment: Enrollment) => {
          if (_enrollment) {
            this._notificationService.success(
              'Matrícula actualizada correctamente'
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
   * removeEnrollmentField
   * @param index
   */
  removeEnrollmentField(index: number): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar matrícula',
        message:
          '¿Estás seguro de que deseas eliminar esta matrícula? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          const id_user_ = this.data.user.id_user;

          const enrollmentElementFormArray = this.courseFormModal.get(
            'enrollments'
          ) as FormArray;
          let enrollment = enrollmentElementFormArray.getRawValue()[index];

          /**
           * Delete the enrollment
           */
          this._enrollmentService
            .deleteEnrollment(id_user_, enrollment.id_enrollment)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the enrollment wasn't deleted...
                   */
                  this._notificationService.success(
                    'Matrícula eliminada correctamente'
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
      });
  }
  /**
   * Track by function for ngFor loops
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
