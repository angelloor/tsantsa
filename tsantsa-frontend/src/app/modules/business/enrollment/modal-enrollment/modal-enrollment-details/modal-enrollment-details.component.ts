import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppInitialData } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { ModalForumsService } from 'app/modules/business/course/forum/modal-forums/modal-forums.service';
import { ModalGlossarysService } from 'app/modules/business/course/glossary/modal-glossarys/modal-glossarys.service';
import { ModalResourceCoursesService } from 'app/modules/business/course/resource_course/modal-resource-courses/modal-resource-courses.service';
import { LocalDatePipe } from 'app/shared/pipes/local-date.pipe';
import { Subject, takeUntil } from 'rxjs';
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
    private _formBuilder: FormBuilder,
    private _layoutService: LayoutService,
    private _matDialog: MatDialog,
    private _localDatePipe: LocalDatePipe,
    private _modalAssistancesService: ModalAssistancesService,
    private _modalResourceCoursesService: ModalResourceCoursesService,
    private _modalGlossarysService: ModalGlossarysService,
    private _modalForumsService: ModalForumsService
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
  /**
   * openModalResourceCourses
   */
  openModalResourceCourses(): void {
    this._modalResourceCoursesService.openModalResourceCourses(
      this.enrollment.course.id_course
    );
  }
  /**
   * openModalGlossarys
   */
  openModalGlossarys(): void {
    this._modalGlossarysService.openModalGlossarys(
      this.enrollment.course.id_course
    );
  }
  /**
   * openModalForums
   */
  openModalForums(): void {
    this._modalForumsService.openModalForums(this.enrollment.course.id_course);
  }
}
