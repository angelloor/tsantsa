import { angelAnimations } from '@angel/animations';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { AuthService } from 'app/core/auth/auth.service';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ModalSelectCourseService } from '../../shared/modal-select-course/modal-select-course.service';
import { ModalSelectPartialService } from '../../shared/modal-select-partial/modal-select-partial.service';
import { ModalTaskService } from '../modal-task/modal-task.service';
import { TaskService } from '../task.service';
import { Task } from '../task.types';

@Component({
  selector: 'task-list',
  templateUrl: './list.component.html',
  animations: angelAnimations,
})
export class TaskListComponent implements OnInit {
  count: number = 0;
  tasks$!: Observable<Task[]>;

  query: string = '';

  private data!: AppInitialData;

  searchInputControl: FormControl = new FormControl();
  selectedTask!: Task;

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  /**
   * isOpenModal
   */
  isOpenModal: boolean = false;
  /**
   * isOpenModal
   */
  constructor(
    private _store: Store<{ global: AppInitialData }>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _taskService: TaskService,
    private _notificationService: NotificationService,
    private _layoutService: LayoutService,
    private _authService: AuthService,
    private _modalSelectCourseService: ModalSelectCourseService,
    private _modalSelectPartialService: ModalSelectPartialService,
    private _modalTaskService: ModalTaskService
  ) {}

  ngOnInit(): void {
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
    });
    /**
     * Get the tasks
     */
    this.tasks$ = this._taskService.tasks$;
    /**
     *  Count Subscribe and readAll
     */
    this._taskService
      .byUserRead(this.data.user.id_user)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((tasks: Task[]) => {
        /**
         * Update the counts
         */
        this.count = tasks.length;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     *  Count Subscribe
     */
    this._taskService.tasks$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((tasks: Task[]) => {
        /**
         * Update the counts
         */
        this.count = tasks.length;
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
          this.query = query;
          /**
           * Search
           */
          return this._taskService.readTaskByQuery(
            this.data.user.id_user,
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
   * Create Tarea
   */
  createTask(): void {
    this._modalSelectCourseService
      .openModalSelectCourse()
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((id_course: string) => {
        if (id_course) {
          this._modalSelectPartialService
            .openModalSelectPartial()
            .afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((id_partial: string) => {
              if (id_partial) {
                const id_user_ = this.data.user.id_user;
                /**
                 * Create the tarea
                 */
                this._taskService
                  .createTask(id_user_, id_course, id_partial)
                  .pipe(takeUntil(this._unsubscribeAll))
                  .subscribe({
                    next: (_task: Task) => {
                      if (_task) {
                        this._notificationService.success(
                          'Tarea agregada correctamente'
                        );
                        /**
                         * Go to new tarea
                         */
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
      });
  }
  /**
   * openModalTask
   * @param id_task
   */
  openModalTask(id_task: string): void {
    this._modalTaskService.openModalTask(id_task);
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
