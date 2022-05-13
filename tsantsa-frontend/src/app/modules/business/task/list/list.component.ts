import { AngelMediaWatcherService } from '@angel/services/media-watcher';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { AuthService } from 'app/core/auth/auth.service';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ModalSelectCourseService } from '../../shared/modal-select-course/modal-select-course.service';
import { ModalSelectPartialService } from '../../shared/modal-select-partial/modal-select-partial.service';
import { TaskService } from '../task.service';
import { Task } from '../task.types';

@Component({
  selector: 'task-list',
  templateUrl: './list.component.html',
})
export class TaskListComponent implements OnInit {
  @ViewChild('matDrawer', { static: true }) matDrawer!: MatDrawer;
  count: number = 0;
  tasks$!: Observable<Task[]>;

  openMatDrawer: boolean = false;

  private data!: AppInitialData;

  drawerMode!: 'side' | 'over';
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
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _angelMediaWatcherService: AngelMediaWatcherService,
    private _taskService: TaskService,
    private _notificationService: NotificationService,
    private _layoutService: LayoutService,
    private _authService: AuthService,
    private _modalSelectCourseService: ModalSelectCourseService,
    private _modalSelectPartialService: ModalSelectPartialService
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
    /**
     * Subscribe to media changes
     */
    this._angelMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
        /**
         * Set the drawerMode if the given breakpoint is active
         */
        if (matchingAliases.includes('lg')) {
          this.drawerMode = 'side';
        } else {
          this.drawerMode = 'over';
        }
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Subscribe to MatDrawer opened change
     */
    this.matDrawer.openedChange
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((opened) => {
        this.openMatDrawer = opened;
        if (!opened) {
          /**
           * Remove the selected when drawer closed
           */
          this.selectedTask = null!;
          /**
           * Mark for check
           */
          this._changeDetectorRef.markForCheck();
        }
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
  }

  /** ----------------------------------------------------------------------------------------------------- */
  /** @ Public methods
   /** ----------------------------------------------------------------------------------------------------- */

  /**
   * Go to Tarea
   * @param id
   */
  goToEntity(id: string): void {
    /**
     * Get the current activated route
     */
    let route = this._activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    /**
     * Go to Tarea
     */
    this._router.navigate([this.openMatDrawer ? '../' : './', id], {
      relativeTo: route,
    });
    /**
     * Mark for check
     */
    this._changeDetectorRef.markForCheck();
  }
  /**
   * On backdrop clicked
   */
  onBackdropClicked(): void {
    /**
     * Get the current activated route
     */
    let route = this._activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    /**
     * Go to the parent route
     */
    this._router.navigate(['../'], { relativeTo: route });
    /**
     * Mark for check
     */
    this._changeDetectorRef.markForCheck();
  }
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
   * Track by function for ngFor loops
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
