import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import {
  ActionAngelConfirmation,
  AngelConfirmationService,
} from '@angel/services/confirmation';
import { OverlayRef } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { filter, fromEvent, merge, Subject, takeUntil } from 'rxjs';
import { EnrollmentService } from '../../enrollment.service';
import { Enrollment } from '../../enrollment.types';
import { ModalAssistancesService } from '../../modal-assistances/modal-assistances.service';

@Component({
  selector: 'app-modal-enrollment-details',
  templateUrl: './modal-enrollment-details.component.html',
  animations: angelAnimations,
})
export class ModalEnrollmentDetailsComponent implements OnInit {
  nameEntity: string = 'Mis cursos';
  private data!: AppInitialData;

  editMode: boolean = false;
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
  enrollment!: Enrollment;
  enrollmentForm!: FormGroup;
  private enrollments!: Enrollment[];

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
    private _store: Store<{ global: AppInitialData }>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _enrollmentService: EnrollmentService,
    @Inject(DOCUMENT) private _document: any,
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _matDialog: MatDialog,
    private _modalAssistancesService: ModalAssistancesService
  ) {}

  /** ----------------------------------------------------------------------------------------------------- */
  /** @ Lifecycle hooks
	  /** ----------------------------------------------------------------------------------------------------- */

  /**
   * On init
   */
  ngOnInit(): void {
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
     * Create the enrollment form
     */
    this.enrollmentForm = this._formBuilder.group({
      id_enrollment: [''],
      course: ['', [Validators.required]],
      user: ['', [Validators.required]],
      date_enrollment: ['', [Validators.required]],
      status_enrollment: ['', [Validators.required]],
      completed_course: ['', [Validators.required]],
    });
    /**
     * Get the enrollments
     */
    this._enrollmentService.enrollments$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((enrollments: Enrollment[]) => {
        this.enrollments = enrollments;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the enrollment
     */
    this._enrollmentService.enrollment$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((enrollment: Enrollment) => {
        /**
         * Get the enrollment
         */
        this.enrollment = enrollment;
        /**
         * Patch values to the form
         */
        this.patchForm();
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Shortcuts
     */
    merge(
      fromEvent(this._document, 'keydown').pipe(
        takeUntil(this._unsubscribeAll),
        filter<KeyboardEvent | any>((e) => e.key === 'Escape')
      )
    )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((keyUpOrKeyDown) => {
        /**
         * Shortcut Escape
         */
        if (!this.isOpenModal && keyUpOrKeyDown.key == 'Escape') {
          /**
           * Navigate parentUrl
           */
          const parentUrl = this._router.url.split('/').slice(0, -1).join('/');
          this._router.navigate([parentUrl]);
        }
      });
    /**
     * Shortcuts
     */
  }

  /**
   * Pacth the form with the information of the database
   */
  patchForm(): void {
    this.enrollmentForm.patchValue(this.enrollment);
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
   * Update the enrollment
   */
  updateEnrollment(): void {
    /**
     * Get the enrollment
     */
    const id_user_ = this.data.user.id_user;
    let enrollment = this.enrollmentForm.getRawValue();
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    enrollment = {
      ...enrollment,
      id_user_: parseInt(id_user_),
      id_enrollment: parseInt(enrollment.id_enrollment),
      id_course: {
        id_course: parseInt(enrollment.course.id_course),
      },
      id_user: {
        id_user: parseInt(enrollment.user.id_user),
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
              'Mis cursos actualizada correctamente'
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
   * Delete the enrollment
   */
  deleteEnrollment(): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar mis cursos',
        message:
          '¿Estás seguro de que deseas eliminar esta mis cursos? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the current enrollment's id
           */
          const id_user_ = this.data.user.id_user;
          const id_enrollment = this.enrollment.id_enrollment;
          /**
           * Get the next/previous enrollment's id
           */
          const currentIndex = this.enrollments.findIndex(
            (item) => item.id_enrollment === id_enrollment
          );

          const nextIndex =
            currentIndex +
            (currentIndex === this.enrollments.length - 1 ? -1 : 1);
          const nextId =
            this.enrollments.length === 1 &&
            this.enrollments[0].id_enrollment === id_enrollment
              ? null
              : this.enrollments[nextIndex].id_enrollment;
          /**
           * Delete the enrollment
           */
          this._enrollmentService
            .deleteEnrollment(id_user_, id_enrollment)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the enrollment wasn't deleted...
                   */
                  this._notificationService.success(
                    'Mis cursos eliminada correctamente'
                  );
                  /**
                   * Get the current activated route
                   */
                  let route = this._activatedRoute;
                  while (route.firstChild) {
                    route = route.firstChild;
                  }
                  /**
                   * Navigate to the next enrollment if available
                   */
                  if (nextId) {
                    this._router.navigate(['../', nextId], {
                      relativeTo: route,
                    });
                  } else {
                    /**
                     * Otherwise, navigate to the parent
                     */
                    this._router.navigate(['../'], { relativeTo: route });
                  }
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

  closeModalEnrollment(): void {
    this._matDialog.closeAll();
  }
  openModalAssistance(): void {
    this._modalAssistancesService.openModalAssistances(
      this.enrollment.course.id_course
    );
  }
}
