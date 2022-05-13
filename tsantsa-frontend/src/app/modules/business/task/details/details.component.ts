import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import {
  ActionAngelConfirmation,
  AngelConfirmationService,
} from '@angel/services/confirmation';
import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { Subject, takeUntil } from 'rxjs';
import { course } from '../../course/course.data';
import { CourseService } from '../../course/course.service';
import { Course } from '../../course/course.types';
import { partial } from '../../period/quimester/partial/partial.data';
import { PartialService } from '../../period/quimester/partial/partial.service';
import { Partial } from '../../period/quimester/partial/partial.types';
import { TaskListComponent } from '../list/list.component';
import { ModalResourceService } from '../resource/modal-resource/modal-resource.service';
import { ResourceService } from '../resource/resource.service';
import { Resource } from '../resource/resource.types';
import { TaskService } from '../task.service';
import { Task } from '../task.types';
@Component({
  selector: 'task-details',
  templateUrl: './details.component.html',
  animations: angelAnimations,
})
export class TaskDetailsComponent implements OnInit {
  categoriesCourse: Course[] = [];
  selectedCourse: Course = course;

  categoriesPartial: Partial[] = [];
  selectedPartial: Partial = partial;

  havedDependency: boolean = false;

  nameEntity: string = 'Tareas';
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
  task!: Task;
  taskForm!: FormGroup;
  private tasks!: Task[];

  private _tagsPanelOverlayRef!: OverlayRef;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  resources: Resource[] = [];
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
    private _taskListComponent: TaskListComponent,
    private _taskService: TaskService,
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _courseService: CourseService,
    private _partialService: PartialService,
    private _resourceService: ResourceService,
    private _modalResourceService: ModalResourceService
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
    this._taskListComponent.matDrawer.open();
    /**
     * Create the task form
     */
    this.taskForm = this._formBuilder.group({
      id_task: [''],
      id_course: ['', [Validators.required]],
      id_user: ['', [Validators.required]],
      id_partial: ['', [Validators.required]],
      name_task: ['', [Validators.required, Validators.maxLength(100)]],
      description_task: ['', [Validators.required, Validators.maxLength(250)]],
      status_task: ['', [Validators.required]],
      creation_date_task: ['', [Validators.required]],
      limit_date: ['', [Validators.required]],
      resources: this._formBuilder.array([]),
    });
    /**
     * Get the tasks
     */
    this._taskService.tasks$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((tasks: Task[]) => {
        this.tasks = tasks;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the task
     */
    this._taskService.task$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((task: Task) => {
        /**
         * Open the drawer in case it is closed
         */
        this._taskListComponent.matDrawer.open();
        /**
         * Get the task
         */
        this.task = task;

        this._resourceService
          .byTaskRead(this.task.id_task)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe();

        this._resourceService.resources$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((_resource: Resource[]) => {
            this.resources = _resource;

            /**
             * Clear the users form arrays
             */
            (this.taskForm.get('resources') as FormArray).clear();

            const resourcesFormGroups: any = [];

            /**
             * Iterate through them
             */
            this.resources.forEach((_resource, index: number) => {
              /**
               * Create an resource form group
               */
              resourcesFormGroups.push(
                this._formBuilder.group({
                  id_resource: [_resource.id_resource],
                  task: [_resource.task],
                  name_resource: [_resource.name_resource],
                  description_resource: [_resource.description_resource],
                  link_resource: [_resource.link_resource],
                  deleted_resource: [_resource.deleted_resource],
                })
              );
            });

            /**
             * Add the resources form groups to the resources form array
             */
            resourcesFormGroups.forEach((resourcesFormGroup: any) => {
              (this.taskForm.get('resources') as FormArray).push(
                resourcesFormGroup
              );
            });
          });

        // Course
        this._courseService
          .readAllCourse()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((courses: Course[]) => {
            this.categoriesCourse = courses;

            this.selectedCourse = this.categoriesCourse.find(
              (item) => item.id_course == this.task.course.id_course.toString()
            )!;
          });

        // Partial
        this._partialService
          .readAllPartial()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((partials: Partial[]) => {
            this.categoriesPartial = partials;

            this.selectedPartial = this.categoriesPartial.find(
              (item) =>
                item.id_partial == this.task.partial.id_partial.toString()
            )!;
          });

        /**
         * Patch values to the form
         */
        this.patchForm();

        /**
         * disabledDependency
         */
        this.disabledDependency(this.task.dependency);
        /**
         * Toggle the edit mode off
         */
        this.toggleEditMode(false);
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
  }
  get formArrayResources(): FormArray {
    return this.taskForm.get('resources') as FormArray;
  }

  getFromControl(
    formArray: FormArray,
    index: number,
    control: string
  ): FormControl {
    return formArray.controls[index].get(control) as FormControl;
  }
  /**
   * Pacth the form with the information of the database
   */
  patchForm(): void {
    this.taskForm.patchValue({
      ...this.task,
      id_course: this.task.course.id_course,
      id_user: this.task.user.id_user,
      id_partial: this.task.partial.id_partial,
    });
  }
  /**
   * disabledDependency
   */
  disabledDependency(dependency: string): void {
    if (parseInt(dependency) >= 1) {
      this.havedDependency = true;
      this.taskForm.disable();
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
    return this._taskListComponent.matDrawer.close();
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
   * Update the task
   */
  updateTask(): void {
    /**
     * Get the task
     */
    const id_user_ = this.data.user.id_user;
    let task = this.taskForm.getRawValue();
    /**
     *  change the default name
     */
    if (task.name_task.trim() == 'Nueva tarea') {
      this._notificationService.warn(
        'Tienes que cambiar el nombre de la tarea'
      );
      return;
    }
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    task = {
      ...task,
      name_task: task.name_task.trim(),
      description_task: task.description_task.trim(),
      id_user_: parseInt(id_user_),
      id_task: parseInt(task.id_task),
      course: {
        id_course: parseInt(task.id_course),
      },
      user: {
        id_user: parseInt(task.id_user),
      },
      partial: {
        id_partial: parseInt(task.id_partial),
      },
    };
    /**
     * Update
     */
    this._taskService
      .updateTask(task)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_task: Task) => {
          if (_task) {
            this._notificationService.success(
              'Tarea actualizada correctamente'
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
   * sendTask
   */
  sendTask(): void {
    /**
     * Get the task
     */
    const id_user_ = this.data.user.id_user;
    let task = this.taskForm.getRawValue();
    /**
     *  change the default name
     */
    if (task.name_task.trim() == 'Nueva tarea') {
      this._notificationService.warn(
        'Tienes que cambiar el nombre de la tarea'
      );
      return;
    }
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    task = {
      ...task,
      name_task: task.name_task.trim(),
      description_task: task.description_task.trim(),
      id_user_: parseInt(id_user_),
      id_task: parseInt(task.id_task),
      course: {
        id_course: parseInt(task.id_course),
      },
      user: {
        id_user: parseInt(task.id_user),
      },
      partial: {
        id_partial: parseInt(task.id_partial),
      },
      status_task: true,
    };

    /**
     * Update
     */
    this._taskService
      .sendTask(task)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_task: Task) => {
          if (_task) {
            this._notificationService.success('Tarea enviada correctamente');
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
   * Delete the task
   */
  deleteTask(): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar tarea',
        message:
          '¿Estás seguro de que deseas eliminar esta tarea? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the current task's id
           */
          const id_user_ = this.data.user.id_user;
          const id_task = this.task.id_task;
          /**
           * Get the next/previous task's id
           */
          const currentIndex = this.tasks.findIndex(
            (item) => item.id_task === id_task
          );

          const nextIndex =
            currentIndex + (currentIndex === this.tasks.length - 1 ? -1 : 1);
          const nextId =
            this.tasks.length === 1 && this.tasks[0].id_task === id_task
              ? null
              : this.tasks[nextIndex].id_task;
          /**
           * Delete the task
           */
          this._taskService
            .deleteTask(id_user_, id_task)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the task wasn't deleted...
                   */
                  this._notificationService.success(
                    'Tarea eliminada correctamente'
                  );
                  /**
                   * Get the current activated route
                   */
                  let route = this._activatedRoute;
                  while (route.firstChild) {
                    route = route.firstChild;
                  }
                  /**
                   * Navigate to the next task if available
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

  addResourceField() {
    this._angelConfirmationService
      .open({
        title: 'Añadir recurso',
        message:
          '¿Estás seguro de que deseas añadir un nuevo recurso? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          const id_user_ = this.data.user.id_user;
          /**
           * Create the recurso
           */
          this._resourceService
            .createResource(id_user_, this.task.id_task)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (_resource: Resource) => {
                if (_resource) {
                  this._notificationService.success(
                    'Recurso agregado correctamente'
                  );
                  /**
                   * Go to new recurso
                   */
                  this._modalResourceService.openModalResource(
                    _resource.id_resource
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
        this._layoutService.setOpenModal(false);
      });
  }

  editResourceField(id_resource: string) {
    this._modalResourceService.openModalResource(id_resource);
  }

  removeResourceField(id_resource: string) {
    this._angelConfirmationService
      .open({
        title: 'Eliminar recurso',
        message:
          '¿Estás seguro de que deseas eliminar este recurso? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          const id_user_ = this.data.user.id_user;
          /**
           * Delete the resource
           */
          this._resourceService
            .deleteResource(id_user_, id_resource)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the resource wasn't deleted...
                   */
                  this._notificationService.success(
                    'Recurso eliminado correctamente'
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
