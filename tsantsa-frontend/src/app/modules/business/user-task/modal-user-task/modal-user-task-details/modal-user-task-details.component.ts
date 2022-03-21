import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import { AngelConfirmationService } from '@angel/services/confirmation';
import { OverlayRef } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { TYPE_USER } from 'app/modules/core/user/user.types';
import { NotificationService } from 'app/shared/notification/notification.service';
import { LocalDatePipe } from 'app/shared/pipes/local-date.pipe';
import { environment } from 'environments/environment';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { FileInput, FileValidator } from 'ngx-material-file-input';
import { filter, fromEvent, merge, Subject, takeUntil } from 'rxjs';
import { AttachedService } from '../../attached/attached.service';
import { Attached } from '../../attached/attached.types';
import { CommentService } from '../../comment/comment.service';
import { Comment } from '../../comment/comment.types';
import { ModalResourcesService } from '../../modal-resources/modal-resources.service';
import { UserTaskService } from '../../user-task.service';
import { UserTask } from '../../user-task.types';

@Component({
  selector: 'app-modal-user-task-details',
  templateUrl: './modal-user-task-details.component.html',
  animations: angelAnimations,
  providers: [LocalDatePipe],
})
export class ModalUserTaskDetailsComponent implements OnInit {
  private data!: AppInitialData;
  _urlPathAvatar: string = environment.urlBackend + '/resource/img/avatar/';
  type_user: TYPE_USER = 'student';
  maximum_rating: number = 0;
  lenght_maximum_rating: number = 0;
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
  userTask!: UserTask;
  userTaskForm!: FormGroup;
  _isafter: boolean = false;

  private userTasks!: UserTask[];

  attacheds: Attached[] = [];
  comments: Comment[] = [];

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
    private _userTaskService: UserTaskService,
    @Inject(DOCUMENT) private _document: any,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _matDialog: MatDialog,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _localDatePipe: LocalDatePipe,
    private _attachedService: AttachedService,
    private _commentService: CommentService,
    private _modalResourcesService: ModalResourcesService
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
      this.type_user = this.data.user.type_user;
    });
    /**
     * Create the userTask form
     */
    this.userTaskForm = this._formBuilder.group({
      id_user_task: [''],
      user: [''],
      task: [''],
      response_user_task: [
        { value: '', disabled: this.type_user == 'teacher' ? true : false },
        [Validators.required, Validators.maxLength(500)],
      ],
      shipping_date_user_task: [''],
      qualification_user_task: [''],
      is_open: [''],
      is_dispatched: [''],
      is_qualified: [''],
      removablefileInitial: [''],
      lotAttacheds: this._formBuilder.array([]),
      lotComments: this._formBuilder.array([]),
    });
    /**
     * Get the userTasks
     */
    this._userTaskService.userTasks$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((userTasks: UserTask[]) => {
        this.userTasks = userTasks;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the userTask
     */
    this._userTaskService.userTask$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((userTask: UserTask) => {
        /**
         * Get the userTask
         */
        this.userTask = userTask;

        this.maximum_rating = this.userTask.task.course.period.maximum_rating;
        this.lenght_maximum_rating = this.maximum_rating.toString().length;

        this._isafter = this.isafter(this.userTask.task.limit_date);

        if (
          ((this._isafter || this.userTask.is_dispatched) &&
            this.type_user == 'student') ||
          this.userTask.is_qualified
        ) {
          this.userTaskForm.disable();
        }

        this._attachedService
          .byUserTaskRead(this.userTask.id_user_task)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe(() => {
            this._attachedService.attacheds$
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe((_attacheds: Attached[]) => {
                this.attacheds = _attacheds;

                /**
                 * Clear the lotAttacheds form arrays
                 */
                (this.userTaskForm.get('lotAttacheds') as FormArray).clear();

                const lotAttachedFormGroups: any = [];
                /**
                 * Iterate through them
                 */
                this.attacheds!.forEach((_attached: any, index: number) => {
                  /**
                   * Add control for the input file
                   */
                  this.userTaskForm.addControl(
                    'removablefile' + index,
                    new FormControl(
                      {
                        value: '',
                        disabled: false,
                      },
                      [FileValidator.maxContentSize(100 * 1024 * 1024)]
                    )
                  );

                  /**
                   * Creamos un objeto file para ponerlo dentro del imput para que no lo puedan remplazar
                   */
                  let _matTooltip = ``;

                  const file = new File(
                    ['attached'],
                    this.getNameFile(_attached.server_path),
                    {
                      type: 'application/pdf',
                    }
                  );
                  this.userTaskForm
                    .get('removablefile' + index)
                    ?.patchValue(new FileInput([file]));
                  /**
                   * Set _matTooltip
                   */
                  _matTooltip = `${_attached.upload_date!} | ${
                    _attached.length_mb
                  }MB`;
                  /**
                   * Create an elemento form group
                   */

                  lotAttachedFormGroups.push(
                    this._formBuilder.group({
                      id_attached: _attached.id_attached,
                      user_task: _attached.user_task,
                      file_name: _attached.file_name,
                      length_mb: _attached.length_mb,
                      extension: _attached.extension,
                      server_path: _attached.server_path,
                      upload_date: _attached.upload_date,
                      matTooltip: _matTooltip,
                    })
                  );
                });
                /**
                 * Add the elemento form groups to the elemento form array
                 */
                lotAttachedFormGroups.forEach((loteAttachedFormGroup: any) => {
                  (this.userTaskForm.get('lotAttacheds') as FormArray).push(
                    loteAttachedFormGroup
                  );
                });
              });
          });

        this._commentService
          .byUserTaskRead(this.userTask.id_user_task)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe(() => {
            this._commentService.comments$
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe((_comments: Comment[]) => {
                this.comments = _comments;

                /**
                 * Clear the lotComments form arrays
                 */
                (this.userTaskForm.get('lotComments') as FormArray).clear();

                const lotCommentFormGroups: any = [];
                /**
                 * Iterate through them
                 */

                this.comments.forEach((_comment) => {
                  /**
                   * Create an elemento form group
                   */

                  lotCommentFormGroups.push(
                    this._formBuilder.group({
                      id_comment: _comment.id_comment,
                      value_comment: [
                        {
                          value: _comment.value_comment,
                          disabled: true,
                        },
                      ],
                      date_comment: [
                        {
                          value: _comment.date_comment,
                          disabled: false,
                        },
                        [Validators.required],
                      ],
                      user_task: [
                        {
                          value: _comment.user_task,
                          disabled: false,
                        },
                        [Validators.required],
                      ],
                      user: [
                        {
                          value: _comment.user,
                          disabled: false,
                        },
                        [Validators.required],
                      ],
                      editMode: [
                        {
                          value: false,
                          disabled: false,
                        },
                      ],
                      isOwner: [
                        this.data.user.id_user == _comment.user.id_user,
                      ],
                    })
                  );
                });
                /**
                 * Add the elemento form groups to the elemento form array
                 */
                lotCommentFormGroups.forEach((lotCommentFormGroup: any) => {
                  (this.userTaskForm.get('lotComments') as FormArray).push(
                    lotCommentFormGroup
                  );
                });
              });
          });

        /**
         * Patch values to the form
         */
        this.patchForm();
        /**
         * update is_open
         */
        if (!this.userTask.is_open && this.type_user == 'student') {
          this.changeIsOpen();
        }

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

  get formArrayAttacheds(): FormArray {
    return this.userTaskForm.get('lotAttacheds') as FormArray;
  }

  get formArrayComments(): FormArray {
    return this.userTaskForm.get('lotComments') as FormArray;
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
    this.userTaskForm.patchValue({
      ...this.userTask,
      shipping_date_user_task: this.parseDate(
        this.userTask.shipping_date_user_task,
        'medium'
      ),
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
   * Update the userTask
   */
  changeIsOpen(): void {
    /**
     * Get the userTask
     */
    const id_user_ = this.data.user.id_user;
    let userTask = this.userTaskForm.getRawValue();
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    userTask = {
      ...userTask,
      response_user_task: userTask.response_user_task.trim(),
      id_user_: parseInt(id_user_),
      id_user_task: parseInt(userTask.id_user_task),
      user: {
        id_user: parseInt(userTask.user.id_user),
      },
      task: {
        id_task: parseInt(userTask.task.id_task),
      },
      is_open: true,
    };

    delete userTask.lotAttacheds;
    delete userTask.lotComments;
    delete userTask.removablefileInitial;
    /**
     * Update
     */
    this._userTaskService
      .updateUserTask(userTask)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_userTask: UserTask) => {
          if (!_userTask) {
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
   * Update the userTask
   */
  updateUserTask(): void {
    const date = new Date();
    let _shipping_date_user_task = `${this.getDate(date.toString()).fullYear}-${
      this.getDate(date.toString()).month
    }-${this.getDate(date.toString()).day} ${
      this.getDate(date.toString()).hours
    }:${this.getDate(date.toString()).minutes}:${
      this.getDate(date.toString()).seconds
    }`;

    /**
     * Get the userTask
     */
    const id_user_ = this.data.user.id_user;
    let userTask = this.userTaskForm.getRawValue();
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    userTask = {
      ...userTask,
      response_user_task: userTask.response_user_task.trim(),
      id_user_: parseInt(id_user_),
      id_user_task: parseInt(userTask.id_user_task),
      user: {
        id_user: parseInt(userTask.user.id_user),
      },
      task: {
        id_task: parseInt(userTask.task.id_task),
      },
      shipping_date_user_task: _shipping_date_user_task,
      is_dispatched: true,
    };

    delete userTask.lotAttacheds;
    delete userTask.lotComments;
    delete userTask.removablefileInitial;
    /**
     * Update
     */
    this._userTaskService
      .updateUserTask(userTask)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_userTask: UserTask) => {
          if (_userTask) {
            this._notificationService.success('Tarea enviada correctamente');
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
   * changeQualificationUserTask
   */
  changeQualificationUserTask(): void {
    /**
     * Get the userTask
     */
    const id_user_ = this.data.user.id_user;
    let userTask = this.userTaskForm.getRawValue();

    let qualification_user_task = userTask.qualification_user_task;

    if (qualification_user_task == '') {
      this._notificationService.warn('Tienes que ingresar la calificacion');
      return;
    } else if (parseInt(qualification_user_task) > this.maximum_rating) {
      this._notificationService.warn(
        'La calificacion no puede ser mayor a la nota maxima'
      );
      return;
    }
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    userTask = {
      ...userTask,
      response_user_task: userTask.response_user_task.trim(),
      id_user_: parseInt(id_user_),
      id_user_task: parseInt(userTask.id_user_task),
      user: {
        id_user: parseInt(userTask.user.id_user),
      },
      task: {
        id_task: parseInt(userTask.task.id_task),
      },
      is_qualified: true,
      qualification_user_task: parseInt(qualification_user_task),
    };

    delete userTask.lotAttacheds;
    delete userTask.lotComments;
    delete userTask.removablefileInitial;
    /**
     * Update
     */
    this._userTaskService
      .updateUserTask(userTask)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_userTask: UserTask) => {
          if (_userTask) {
            this._notificationService.success('Tarea calificada correctamente');
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
   * uploadFile
   * @param target
   */
  uploadFile(target: any): void {
    const id_user_ = this.data.user.id_user;
    const files: FileList = target.files;
    const file: File = files[0];

    const size: string = parseFloat(
      (file.size / 1024 / 1024).toFixed(2)
    ).toString();
    const name: string = this.getInfoFile(file.name).name;
    const type: string = this.getInfoFile(file.name).extension;

    this._attachedService
      .createAttached(
        id_user_,
        this.userTask.id_user_task,
        name,
        size,
        type,
        file
      )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: any) => {
          if (response) {
            this._notificationService.success('Archivo subido correctamente');
          } else {
            this._notificationService.error(
              'Ocurrió un error subiendo el archivo'
            );
          }
          /**
           * Mark for check
           */
          this._changeDetectorRef.markForCheck();
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
   * downloadFile
   * @param index
   */
  downloadFile(index: number) {
    const elementAttachedFormArray = this.userTaskForm.get(
      'lotAttacheds'
    ) as FormArray;

    const server_path =
      elementAttachedFormArray.getRawValue()[index].server_path;

    this._attachedService
      .downloadFile(server_path)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (dataSource: Blob) => {
          if (dataSource) {
            saveAs(dataSource, this.getNameFile(server_path));
          } else {
            this._notificationService.error(
              'Ocurrió un error descargando el archivo'
            );
          }
          /**
           * Mark for check
           */
          this._changeDetectorRef.markForCheck();
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
   * deleteFile
   * @param index
   */
  deleteFile(index: number) {
    const elementAttachedFormArray = this.userTaskForm.get(
      'lotAttacheds'
    ) as FormArray;

    const id_attached =
      elementAttachedFormArray.getRawValue()[index].id_attached;
    const id_user_ = this.data.user.id_user;

    this._attachedService
      .deleteAttached(id_user_, id_attached)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: any) => {
          if (response) {
            this._notificationService.success(
              'Archivo eliminado correctamente'
            );
          } else {
            this._notificationService.error(
              'Ocurrió un error eliminado el archivo'
            );
          }
          /**
           * Mark for check
           */
          this._changeDetectorRef.markForCheck();
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
   * addComment
   */
  addComment() {
    const id_user_ = this.data.user.id_user;
    this._commentService
      .createComment(id_user_, this.userTask.id_user_task)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_comment: Comment) => {
          if (_comment) {
            const index = this.comments.findIndex(
              (_comment) => _comment.id_comment == _comment.id_comment
            );

            this.editComment(index, true);

            this._notificationService.success(
              'Comentario agregado correctamente'
            );
          } else {
            this._notificationService.error(
              'Ocurrió un error agregar el comentario'
            );
          }
          /**
           * Mark for check
           */
          this._changeDetectorRef.markForCheck();
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
   * editComment
   * @param index
   * @param status
   */
  editComment(index: number, status: boolean) {
    if (status) {
      this.desactiveAllControl();
      /**
       * set edit mode
       */
      this.getFromControl(this.formArrayComments, index, 'editMode').patchValue(
        status
      );
      /**
       * Enabled control
       */
      this.getFromControl(
        this.formArrayComments,
        index,
        'value_comment'
      ).enable();
    } else {
      this.getFromControl(this.formArrayComments, index, 'editMode').patchValue(
        status
      );
      /**
       * Enabled control
       */
      this.getFromControl(
        this.formArrayComments,
        index,
        'value_comment'
      ).disable();
    }
  }
  /**
   * desactiveAllControl
   */
  desactiveAllControl() {
    this.comments.map((item: any, index: number) => {
      this.getFromControl(this.formArrayComments, index, 'editMode').patchValue(
        false
      );
      /**
       * Enabled control
       */
      this.getFromControl(
        this.formArrayComments,
        index,
        'value_comment'
      ).disable();
    });
  }
  /**
   * saveComment
   * @param index
   */
  saveComment(index: number) {
    this.editComment(index, false);

    const id_user_ = this.data.user.id_user;
    const elementCommentFormArray = this.userTaskForm.get(
      'lotComments'
    ) as FormArray;

    let comment = elementCommentFormArray.getRawValue()[index];

    comment = {
      ...comment,
      id_user_: parseInt(id_user_),
      id_comment: parseInt(comment.id_comment),
      user_task: {
        id_user_task: parseInt(comment.user_task.id_user_task),
      },
    };

    this._commentService
      .updateComment(comment)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_comment: Comment) => {
          if (_comment) {
            this._notificationService.success('Comentario actualizado');
          } else {
            this._notificationService.error(
              'Ocurrió un error al actualiar el comentario'
            );
          }
          /**
           * Mark for check
           */
          this._changeDetectorRef.markForCheck();
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
   * deleteComment
   * @param index
   */
  deleteComment(index: number) {
    const elementCommentFormArray = this.userTaskForm.get(
      'lotComments'
    ) as FormArray;

    const id_comment = elementCommentFormArray.getRawValue()[index].id_comment;
    const id_user_ = this.data.user.id_user;

    this._commentService
      .deleteComment(id_user_, id_comment)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: boolean) => {
          if (response) {
            this._notificationService.success('Comentario eliminado');
          } else {
            this._notificationService.error(
              'Ocurrió un error eliminado el comentario'
            );
          }
          /**
           * Mark for check
           */
          this._changeDetectorRef.markForCheck();
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
   * getInfoFile
   * @param nameFile
   * @returns { name, extension }
   */
  getInfoFile = (nameFile: string) => {
    let position: number = 0;
    for (let index = 0; index < nameFile.length; index++) {
      const caracter: string = nameFile.substring(index, index + 1);
      if (caracter == '.') {
        position = index;
      }
    }
    return {
      name: nameFile.substring(0, position),
      extension: nameFile.substring(position, nameFile.length),
    };
  };
  /**
   * getNameFile
   * @param server_path
   * @returns
   */
  getNameFile = (server_path: string): string => {
    let position: number = 0;
    for (let index = 0; index < server_path.length; index++) {
      const caracter: string = server_path.substring(index, index + 1);
      if (caracter == '/') {
        position = index;
      }
    }
    return server_path.substring(position + 1, server_path.length);
  };
  /**
   * getAbreviationNameFile
   * @param nameFile
   * @returns
   */
  getAbreviationNameFile(nameFile: string): string {
    return nameFile.length > 10
      ? `${nameFile.substring(0, 5)}...${nameFile.substring(
          nameFile.length - 5,
          nameFile.length
        )}`
      : nameFile;
  }
  /**
   * openModalResources
   */
  openModalResources() {
    this._modalResourcesService.openModalResources(this.userTask.task.id_task);
  }
  /**
   * closeModalUserTask
   */
  closeModalUserTask(): void {
    this._matDialog.closeAll();
  }
  /**
   * parseDate
   * @param date
   * @returns
   */
  parseDate(date: string, format: string): string {
    return this._localDatePipe.transform(date, format);
  }
  /**
   * isafter
   * @param secondDate
   */
  isafter(secondDate: any): boolean {
    const firstDate = new Date();

    const _secondDate = new Date(
      `${this.getDate(secondDate).fullYear}-${this.getDate(secondDate).month}-${
        this.getDate(secondDate).day
      }T${this.getDate(secondDate).hours}:${this.getDate(secondDate).minutes}:${
        this.getDate(secondDate).seconds
      }`
    );

    var isafter = moment(firstDate).isAfter(_secondDate);
    if (isafter) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Return { day, month, fullYear, hours, minutes, seconds }
   */
  getDate = (stringDate: string) => {
    const date = new Date(stringDate);
    return {
      day: date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate(),
      month:
        date.getMonth() + 1 <= 9
          ? `0${date.getMonth() + 1}`
          : date.getMonth() + 1,
      fullYear: date.getFullYear(),
      hours: date.getHours() <= 9 ? '0' + date.getHours() : date.getHours(),
      minutes:
        date.getMinutes() <= 9 ? '0' + date.getMinutes() : date.getMinutes(),
      seconds:
        date.getSeconds() <= 9 ? '0' + date.getSeconds() : date.getSeconds(),
    };
  };
  /**
   * Track by function for ngFor loops
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
