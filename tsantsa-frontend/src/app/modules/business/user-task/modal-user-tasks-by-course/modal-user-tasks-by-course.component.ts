import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppInitialData } from 'app/core/app/app.type';
import { AuthService } from 'app/core/auth/auth.service';
import { LayoutService } from 'app/layout/layout.service';
import { TYPE_USER } from 'app/modules/core/user/user.types';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ModalUserTaskService } from '../modal-user-task/modal-user-task.service';
import { UserTaskService } from '../user-task.service';
import { UserTask } from '../user-task.types';
import { ModalUserTasksByCourseService } from './modal-user-tasks-by-course.service';

@Component({
  selector: 'app-modal-user-tasks-by-course',
  templateUrl: './modal-user-tasks-by-course.component.html',
})
export class ModalUserTasksByCourseComponent implements OnInit {
  id_course: string = '';

  type_user: TYPE_USER = 'student';

  count: number = 0;
  userTasks$!: Observable<UserTask[]>;

  private data!: AppInitialData;

  searchInputControl: FormControl = new FormControl();
  selectedUserTask!: UserTask;

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
    private _userTaskService: UserTaskService,
    private _layoutService: LayoutService,
    private _authService: AuthService,
    private _modalUserTasksByCourseService: ModalUserTasksByCourseService,
    private _modalUserTaskService: ModalUserTaskService
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
     * Get the userTasks
     */
    this.userTasks$ = this._userTaskService.userTasks$;
    /**
     *  Count Subscribe and readAll
     */
    this._userTaskService
      .byCourseRead(this.id_course)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((userTasks: UserTask[]) => {
        /**
         * Update the counts
         */
        this.count = userTasks.length;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });

    /**
     *  Count Subscribe
     */
    this._userTaskService.userTasks$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((userTasks: UserTask[]) => {
        /**
         * Update the counts
         */
        this.count = userTasks.length;
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
          return this._userTaskService.byCourseQueryRead(
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
   * closeModalUserTasksByCourse
   */
  closeModalUserTasksByCourse(): void {
    this._modalUserTasksByCourseService.closeModalUserTasksByCourse();
  }
  /**
   * openModalUserTask
   * @param id_user_task
   */
  openModalUserTask(id_user_task: string): void {
    this._modalUserTaskService.openModalUserTask(id_user_task);
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
