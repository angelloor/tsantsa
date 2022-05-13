import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppInitialData } from 'app/core/app/app.type';
import { AuthService } from 'app/core/auth/auth.service';
import { LayoutService } from 'app/layout/layout.service';
import { TYPE_USER } from 'app/modules/core/user/user.types';
import moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ModalResourceCourseStudentService } from '../modal-resource-course-student/modal-resource-course-student.service';
import { ModalResourceCourseService } from '../modal-resource-course/modal-resource-course.service';
import { ModalUploadResourceCourseService } from '../modal-upload-resource-course/modal-upload-resource-course.service';
import { ResourceCourseService } from '../resource-course.service';
import { ResourceCourse } from '../resource-course.types';
import { ModalResourceCoursesService } from './modal-resource-courses.service';

@Component({
  selector: 'app-modal-resource-courses',
  templateUrl: './modal-resource-courses.component.html',
})
export class ModalResourceCoursesComponent implements OnInit {
  id_course: string = '';

  type_user: TYPE_USER = 'student';

  count: number = 0;
  resourceCourses$!: Observable<ResourceCourse[]>;

  private data!: AppInitialData;

  drawerMode!: 'side' | 'over';
  searchInputControl: FormControl = new FormControl();
  selectedResourceCourse!: ResourceCourse;

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  /**
   * isOpenModal
   */
  isOpenModal: boolean = false;
  /**
   * isOpenModal
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _store: Store<{ global: AppInitialData }>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _resourceCourseService: ResourceCourseService,
    private _layoutService: LayoutService,
    private _authService: AuthService,
    private _modalResourceCoursesService: ModalResourceCoursesService,
    private _modalResourceCourseService: ModalResourceCourseService,
    private _modalUploadResourceCourseService: ModalUploadResourceCourseService,
    private _modalResourceCourseStudentService: ModalResourceCourseStudentService
  ) {}

  ngOnInit(): void {
    this.id_course = this._data.id_course;
    /**
     * checkSession
     */
    this._authService
      .checkSession()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe();
    /**
     * checkSession
     */
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
      this.type_user = this.data.user.type_user;
    });
    /**
     * Get the resourceCourses
     */
    this.resourceCourses$ = this._resourceCourseService.resourceCourses$;
    /**
     *  Count Subscribe and readAll
     */
    this._resourceCourseService
      .byCourseRead(this.id_course)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resourceCourses: ResourceCourse[]) => {
        /**
         * Update the counts
         */
        this.count = resourceCourses.length;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     *  Count Subscribe
     */
    this._resourceCourseService.resourceCourses$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resourceCourses: ResourceCourse[]) => {
        /**
         * Update the counts
         */
        this.count = resourceCourses.length;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Subscribe to search input field value changes
     */
    this.searchInputControl.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        switchMap((query) => {
          /**
           * Search
           */
          return this._resourceCourseService.readResourceCourseByQuery(
            this.id_course,
            query.toLowerCase()
          );
        })
      )
      .subscribe();
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
  }

  /** ----------------------------------------------------------------------------------------------------- */
  /** @ Public methods
   /** ----------------------------------------------------------------------------------------------------- */
  /**
   * Create Recursos de la asignatura
   */
  createResourceCourse(): void {
    this._modalUploadResourceCourseService
      .openModalUploadResourceCourse(this.id_course)
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this._layoutService.setOpenModal(false);
      });
  }
  /**
   * closeModalResourceCourses
   */
  closeModalResourceCourses(): void {
    this._modalResourceCoursesService.closeModalResourceCourses();
  }
  /**
   * openModalResourceCourse
   * @param id_resource_course
   */
  openModalResourceCourse(id_resource_course: string): void {
    if (this.type_user == 'student') {
      this._modalResourceCourseStudentService.openModalResourceCourseStudent(
        id_resource_course
      );
    } else {
      this._modalResourceCourseService.openModalResourceCourse(
        id_resource_course
      );
    }
  }
  /**
   * Format the given ISO_8601 date as a relative date
   * @param date
   */
  formatDateAsRelative(date: string): string {
    return moment(date, moment.ISO_8601).locale('es').fromNow();
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
