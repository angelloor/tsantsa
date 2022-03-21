import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import { AngelConfirmationService } from '@angel/services/confirmation';
import { OverlayRef } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { LocalDatePipe } from 'app/shared/pipes/local-date.pipe';
import { filter, fromEvent, merge, Subject, takeUntil } from 'rxjs';
import { EnrollmentService } from '../../enrollment.service';
import { Enrollment } from '../../enrollment.types';
import { ModalAssistancesService } from '../../modal-assistances/modal-assistances.service';

@Component({
  selector: 'app-modal-enrollment-details',
  templateUrl: './modal-enrollment-details.component.html',
  animations: angelAnimations,
  providers: [LocalDatePipe],
})
export class ModalEnrollmentDetailsComponent implements OnInit {
  nameEntity: string = 'Mis cursos';
  private data!: AppInitialData;

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
    private _localDatePipe: LocalDatePipe,
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
    this.enrollmentForm.patchValue({
      ...this.enrollment,
    });
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
   * closeModalEnrollment
   */
  closeModalEnrollment(): void {
    this._matDialog.closeAll();
  }
  /**
   * openModalAssistance
   */
  openModalAssistance(): void {
    this._modalAssistancesService.openModalAssistances(
      this.enrollment.course.id_course
    );
  }
  /**
   * getNowDateWithTime
   * @param time
   * @param date
   * @returns
   */
  getNowDateWithTime = (time: string) => {
    const date = new Date();
    return `${date.getFullYear()}-${
      date.getMonth() + 1 <= 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    }-${date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate()}T${time}`;
  };
  /**
   * @param time
   */
  parseTime(time: string) {
    return this._localDatePipe.transform(
      this.getNowDateWithTime(time),
      'shortTime'
    );
  }
  /**
   * parseDate
   * @param date
   * @returns
   */

  parseDate(date: string) {
    return this._localDatePipe.transform(date, 'longDate');
  }
}
