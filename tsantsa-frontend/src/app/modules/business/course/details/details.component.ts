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
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { LocalDatePipe } from 'app/shared/pipes/local-date.pipe';
import moment from 'moment';
import { filter, fromEvent, merge, Subject, takeUntil } from 'rxjs';
import { career } from '../../career/career.data';
import { CareerService } from '../../career/career.service';
import { Career } from '../../career/career.types';
import { period } from '../../period/period.data';
import { PeriodService } from '../../period/period.service';
import { Period } from '../../period/period.types';
import { CourseService } from '../course.service';
import { Course } from '../course.types';
import { CourseListComponent } from '../list/list.component';
import { ModalEnrollmentService } from '../modal-enrollment/modal-enrollment.service';

@Component({
  selector: 'course-details',
  templateUrl: './details.component.html',
  animations: angelAnimations,
  providers: [LocalDatePipe],
})
export class CourseDetailsComponent implements OnInit {
  startDate: any = '';
  endDate: any = '';

  categoriesPeriod: Period[] = [];
  selectedPeriod: Period = period;

  categoriesCareer: Career[] = [];
  selectedCareer: Career = career;

  nameEntity: string = 'Asignatura';
  private data!: AppInitialData;

  editMode: boolean = false;
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
  course!: Course;
  courseForm!: FormGroup;
  private courses!: Course[];

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
    private _courseListComponent: CourseListComponent,
    private _courseService: CourseService,
    @Inject(DOCUMENT) private _document: any,
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _periodService: PeriodService,
    private _careerService: CareerService,
    private _modalEnrollmentService: ModalEnrollmentService,
    private _localDatePipe: LocalDatePipe
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
     * Open the drawer
     */
    this._courseListComponent.matDrawer.open();
    /**
     * Create the course form
     */
    this.courseForm = this._formBuilder.group({
      id_course: [''],
      company: ['', [Validators.required]],
      id_period: ['', [Validators.required]],
      id_career: ['', [Validators.required]],
      id_schedule: [''],
      name_course: ['', [Validators.required, Validators.maxLength(250)]],
      description_course: [
        '',
        [Validators.required, Validators.maxLength(250)],
      ],
      status_course: ['', [Validators.required]],
      creation_date_course: [''],
      start_date_schedule: ['', [Validators.required]],
      end_date_schedule: ['', [Validators.required]],
      tolerance_schedule: ['', [Validators.required, Validators.maxLength(4)]],
      creation_date_schedule: [''],
    });
    /**
     * Get the courses
     */
    this._courseService.courses$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((courses: Course[]) => {
        this.courses = courses;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the course
     */
    this._courseService.course$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((course: Course) => {
        /**
         * Open the drawer in case it is closed
         */
        this._courseListComponent.matDrawer.open();
        /**
         * Get the course
         */
        this.course = course;

        this.startDate = this.course.schedule.start_date_schedule;
        this.endDate = this.course.schedule.end_date_schedule;

        // Period
        this._periodService
          .readAllPeriod()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((periods: Period[]) => {
            this.categoriesPeriod = periods;

            this.selectedPeriod = this.categoriesPeriod.find(
              (item) =>
                item.id_period == this.course.period.id_period.toString()
            )!;
          });

        // Career
        this._careerService
          .readAllCareer()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((careers: Career[]) => {
            this.categoriesCareer = careers;

            this.selectedCareer = this.categoriesCareer.find(
              (item) =>
                item.id_career == this.course.career.id_career.toString()
            )!;
          });

        /**
         * Patch values to the form
         */
        this.patchForm();
        /**
         * disabledDependency
         */
        this.disabledDependency(this.course.dependency);
        /**
         * Toggle the edit mode off
         */
        this.toggleEditMode(false);
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
          /**
           * Close Drawer
           */
          this.closeDrawer();
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
    this.courseForm.patchValue({
      ...this.course,
      id_period: this.course.period.id_period,
      id_career: this.course.career.id_career,
      id_schedule: this.course.schedule.id_schedule,
      creation_date_schedule: this.course.schedule.creation_date_schedule,
      start_date_schedule: this.parseTime(
        this.course.schedule.start_date_schedule
      ),
      end_date_schedule: this.parseTime(this.course.schedule.end_date_schedule),
      tolerance_schedule: this.course.schedule.tolerance_schedule,
    });
  }
  /**
   * disabledDependency
   */
  disabledDependency(dependency: string): void {
    if (parseInt(dependency) >= 1) {
      this.courseForm.disable();
    }
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
   * Close the drawer
   */
  closeDrawer(): Promise<MatDrawerToggleResult> {
    return this._courseListComponent.matDrawer.close();
  }
  /**
   * Toggle edit mode
   * @param editMode
   */
  toggleEditMode(editMode: boolean | null = null): void {
    this.patchForm();

    if (editMode === null) {
      this.editMode = !this.editMode;
    } else {
      this.editMode = editMode;
    }
    /**
     * Mark for check
     */
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Update the course
   */
  updateCourse(): void {
    /**
     * Get the course
     */
    const id_user_ = this.data.user.id_user;
    let course = this.courseForm.getRawValue();
    /**
     *  change the default name
     */
    if (course.name_course.trim() == 'Nueva asignatura') {
      this._notificationService.warn(
        'Tienes que cambiar el nombre de la asignatura'
      );
      return;
    }
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    course = {
      ...course,
      name_course: course.name_course.trim(),
      description_course: course.description_course.trim(),
      id_user_: parseInt(id_user_),
      id_course: parseInt(course.id_course),
      company: {
        id_company: parseInt(course.company.id_company),
      },
      period: {
        id_period: parseInt(course.id_period),
      },
      career: {
        id_career: parseInt(course.id_career),
      },
      schedule: {
        id_schedule: parseInt(course.id_schedule),
        start_date_schedule: course.start_date_schedule,
        end_date_schedule: course.end_date_schedule,
        tolerance_schedule: parseInt(course.tolerance_schedule),
        creation_date_schedule: course.creation_date_schedule,
      },
    };

    delete course.id_company;
    delete course.id_period;
    delete course.id_career;
    delete course.id_schedule;

    delete course.start_date_schedule;
    delete course.end_date_schedule;
    delete course.tolerance_schedule;
    delete course.creation_date_schedule;

    /**
     * Update
     */
    this._courseService
      .updateCourse(course)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_course: Course) => {
          if (_course) {
            this._notificationService.success(
              'Asignatura actualizada correctamente'
            );
            /**
             * Toggle the edit mode off
             */
            this.toggleEditMode(false);
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
   * Delete the course
   */
  deleteCourse(): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar asignatura',
        message:
          '¿Estás seguro de que deseas eliminar esta asignatura? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the current course's id
           */
          const id_user_ = this.data.user.id_user;
          const id_course = this.course.id_course;
          /**
           * Get the next/previous course's id
           */
          const currentIndex = this.courses.findIndex(
            (item) => item.id_course === id_course
          );

          const nextIndex =
            currentIndex + (currentIndex === this.courses.length - 1 ? -1 : 1);
          const nextId =
            this.courses.length === 1 && this.courses[0].id_course === id_course
              ? null
              : this.courses[nextIndex].id_course;
          /**
           * Delete the course
           */
          this._courseService
            .deleteCourse(id_user_, id_course)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the course wasn't deleted...
                   */
                  this._notificationService.success(
                    'Asignatura eliminada correctamente'
                  );
                  /**
                   * Get the current activated route
                   */
                  let route = this._activatedRoute;
                  while (route.firstChild) {
                    route = route.firstChild;
                  }
                  /**
                   * Navigate to the next course if available
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
                  /**
                   * Toggle the edit mode off
                   */
                  this.toggleEditMode(false);
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
   * openModalEnrollment
   */
  openModalEnrollment() {
    this._modalEnrollmentService.openModalEnrollment(this.course.id_course);
  }
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
   * getNowDateWithTime
   * @param time
   * @returns
   */
  getNowDateWithTime = (time: string) => {
    const date = new Date();
    return `${date.getFullYear()}-${
      date.getMonth() + 1 <= 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    }-${date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate()}T${time}`;
  };
  /**
   * changeStartDateSchedule
   * isBefore, isSame, and isAfter of moment
   * @param form
   */
  changeStartDateSchedule(form: any) {
    let startDateSchedule = form.getRawValue().start_date_schedule;

    var isBefore = moment(this.getNowDateWithTime(startDateSchedule)).isBefore(
      this.getNowDateWithTime(this.endDate)
    );

    if (isBefore) {
      this.startDate = startDateSchedule;
    } else {
      this.courseForm.patchValue({
        ...form.getRawValue(),
        start_date_schedule: this.startDate,
      });
      this._notificationService.warn(
        'La hora inicial tiene que ser menor que la final'
      );
    }
  }

  /**
   * changeEndDateSchedule
   * isBefore, isSame, and isAfter of moment
   * @param form
   */
  changeEndDateSchedule(form: any) {
    let endDateSchedule = form.getRawValue().end_date_schedule;

    var isAfter = moment(this.getNowDateWithTime(endDateSchedule)).isAfter(
      this.getNowDateWithTime(this.startDate)
    );

    if (isAfter) {
      this.endDate = endDateSchedule;
    } else {
      this.courseForm.patchValue({
        ...form.getRawValue(),
        end_date_schedule: this.endDate,
      });
      this._notificationService.warn(
        'La hora final tiene que ser mayor que la inicial'
      );
    }
  }
}
