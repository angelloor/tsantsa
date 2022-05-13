import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import {
  ActionAngelConfirmation,
  AngelConfirmationService,
} from '@angel/services/confirmation';
import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { environment } from 'environments/environment';
import { Subject, takeUntil } from 'rxjs';
import { course } from '../../course.data';
import { CourseService } from '../../course.service';
import { Course } from '../../course.types';
import { CommentForumService } from '../comment_forum/comment-forum.service';
import { CommentForum } from '../comment_forum/comment-forum.types';
import { ForumService } from '../forum.service';
import { Forum } from '../forum.types';
import { ModalForumService } from './modal-forum.service';

@Component({
  selector: 'app-modal-forum',
  templateUrl: './modal-forum.component.html',
  animations: angelAnimations,
})
export class ModalForumComponent implements OnInit {
  _urlPathAvatar: string = environment.urlBackend + '/resource/img/avatar/';

  id_forum: string = '';
  /**
   * Button status
   */
  btn_title_forum: boolean = false;
  btn_description_forum: boolean = false;
  /**
   * Button status
   */

  expireForum: boolean = false;

  isCreator: boolean = false;
  lengthCommentForum: number = 0;

  categoriesCourse: Course[] = [];
  selectedCourse: Course = course;

  nameEntity: string = 'Foro';
  private data!: AppInitialData;

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
  forum!: Forum;
  forumForm!: FormGroup;
  private forums!: Forum[];

  commentForum: CommentForum[] = [];

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
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _store: Store<{ global: AppInitialData }>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _forumService: ForumService,
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _courseService: CourseService,
    private _modalForumService: ModalForumService,
    private _commentForumService: CommentForumService
  ) {}

  /** ----------------------------------------------------------------------------------------------------- */
  /** @ Lifecycle hooks
	/** ----------------------------------------------------------------------------------------------------- */

  /**
   * On init
   */
  ngOnInit(): void {
    this.id_forum = this._data.id_forum;
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
     * Create the forum form
     */
    this.forumForm = this._formBuilder.group({
      id_forum: [''],
      id_course: [''],
      id_user: [''],
      title_forum: ['', [Validators.required, Validators.maxLength(100)]],
      description_forum: ['', [Validators.required, Validators.maxLength(250)]],
      date_forum: ['', [Validators.required]],
      lotCommentForum: this._formBuilder.array([]),
    });
    /**
     * desactiveControl
     */
    this.desactiveControl();

    /**
     * Get the forum
     */
    this._forumService
      .readForumByIdLocal(this.id_forum)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe();
    /**
     * Get the forums
     */
    this._forumService.forums$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((forums: Forum[]) => {
        this.forums = forums;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the forum
     */
    this._forumService.forum$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((forum: Forum) => {
        /**
         * Get the forum
         */
        this.forum = forum;

        if (this.forum.user.id_user === this.data.user.id_user) {
          this.isCreator = true;
        }

        this._commentForumService
          .byForumRead(this.forum.id_forum)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe(() => {
            this._commentForumService.commentForums$
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe((_commentForums: CommentForum[]) => {
                this.lengthCommentForum = _commentForums.length;
                this.commentForum = _commentForums;

                /**
                 * Clear the lotCommentForum form arrays
                 */
                (this.forumForm.get('lotCommentForum') as FormArray).clear();

                const lotCommentForumFormGroups: any = [];
                /**
                 * Iterate through them
                 */

                this.commentForum.forEach((_commentForum) => {
                  /**
                   * Create an elemento form group
                   */

                  lotCommentForumFormGroups.push(
                    this._formBuilder.group({
                      id_comment_forum: _commentForum.id_comment_forum,
                      value_comment_forum: [
                        {
                          value: _commentForum.value_comment_forum,
                          disabled: true,
                        },
                      ],
                      date_comment_forum: [
                        {
                          value: _commentForum.date_comment_forum,
                          disabled: false,
                        },
                        [Validators.required],
                      ],
                      forum: [
                        {
                          value: _commentForum.forum,
                          disabled: false,
                        },
                        [Validators.required],
                      ],
                      user: [
                        {
                          value: _commentForum.user,
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
                        this.data.user.id_user == _commentForum.user.id_user,
                      ],
                    })
                  );
                });
                /**
                 * Add the elemento form groups to the elemento form array
                 */
                lotCommentForumFormGroups.forEach(
                  (lotCommentForumFormGroup: any) => {
                    (this.forumForm.get('lotCommentForum') as FormArray).push(
                      lotCommentForumFormGroup
                    );
                  }
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
              (item) => item.id_course == this.forum.course.id_course.toString()
            )!;
          });

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

  get formArrayCommentForum(): FormArray {
    return this.forumForm.get('lotCommentForum') as FormArray;
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
    this.forumForm.patchValue({
      ...this.forum,
      id_course: this.forum.course.id_course,
      id_user: this.forum.user.id_user,
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
   * Update the forum
   */
  updateForum(): void {
    /**
     * Get the forum
     */
    const id_user_ = this.data.user.id_user;
    let forum = this.forumForm.getRawValue();
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    forum = {
      ...forum,
      id_user_: parseInt(id_user_),
      id_forum: parseInt(forum.id_forum),
      course: {
        id_course: parseInt(forum.id_course),
      },
      user: {
        id_user: parseInt(forum.id_user),
      },
    };
    /**
     * Update
     */
    this._forumService
      .updateForum(forum)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_forum: Forum) => {
          if (_forum) {
            this._notificationService.success('Foro actualizada correctamente');
            /**
             * Toggle the edit mode off
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
  /**
   * Delete the forum
   */
  deleteForum(): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar foro',
        message:
          '¿Estás seguro de que deseas eliminar esta foro? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the current forum's id
           */
          const id_user_ = this.data.user.id_user;
          const id_forum = this.forum.id_forum;
          /**
           * Delete the forum
           */
          this._forumService
            .deleteForum(id_user_, id_forum)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the forum wasn't deleted_newsletter...
                   */
                  this._notificationService.success(
                    'Foro eliminada correctamente'
                  );
                  /**
                   * closeModalForum
                   */
                  this.closeModalForum();
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
   * editField
   * @param control
   * @param status
   */
  editField(control: string, status: boolean) {
    if (status) {
      this.desactiveControl();

      if (control == 'title_forum') {
        this.btn_title_forum = true;
      } else if (control == 'description_forum') {
        this.btn_description_forum = true;
      }
      /**
       * Enabled control
       */
      this.forumForm.get(control)?.enable();
    } else {
      if (control == 'title_forum') {
        this.btn_title_forum = false;
      } else if (control == 'description_forum') {
        this.btn_description_forum = false;
      }
      /**
       * Disabled control
       */
      this.forumForm.get(control)?.disable();
    }
  }
  /**
   * saveField
   * @param control
   */
  saveField(control: string) {
    this.editField(control, false);
    this.updateForum();
  }
  /**
   * desactiveControl
   */
  desactiveControl() {
    this.forumForm.get('title_forum')?.disable();
    this.forumForm.get('description_forum')?.disable();

    this.btn_title_forum = false;
    this.btn_description_forum = false;
  }
  /**
   * closeModalForum
   */
  closeModalForum(): void {
    this._modalForumService.closeModalForum();
  }
  /**
   * addCommentForum
   */
  addCommentForum() {
    const id_user_ = this.data.user.id_user;
    this._commentForumService
      .createCommentForum(id_user_, this.forum.id_forum)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_newCommentForum: CommentForum) => {
          if (_newCommentForum) {
            const index = this.commentForum.findIndex(
              (_commentForum) =>
                _commentForum.id_comment_forum ==
                _newCommentForum.id_comment_forum
            );

            this.editCommentForum(index, true);

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
   * editCommentForum
   * @param index
   * @param status
   */
  editCommentForum(index: number, status: boolean) {
    if (status) {
      this.desactiveAllControlCommentForum();
      /**
       * set edit mode
       */
      this.getFromControl(
        this.formArrayCommentForum,
        index,
        'editMode'
      ).patchValue(status);
      /**
       * Enabled control
       */
      this.getFromControl(
        this.formArrayCommentForum,
        index,
        'value_comment_forum'
      ).enable();
    } else {
      this.getFromControl(
        this.formArrayCommentForum,
        index,
        'editMode'
      ).patchValue(status);
      /**
       * Enabled control
       */
      this.getFromControl(
        this.formArrayCommentForum,
        index,
        'value_comment_forum'
      ).disable();
    }
  }
  /**
   * desactiveAllControlCommentForum
   */
  desactiveAllControlCommentForum() {
    this.commentForum.map((item: any, index: number) => {
      this.getFromControl(
        this.formArrayCommentForum,
        index,
        'editMode'
      ).patchValue(false);
      /**
       * Enabled control
       */
      this.getFromControl(
        this.formArrayCommentForum,
        index,
        'value_comment_forum'
      ).disable();
    });
  }
  /**
   * saveComment
   * @param index
   */
  saveComment(index: number) {
    this.editCommentForum(index, false);

    const id_user_ = this.data.user.id_user;
    const elementCommentFormArray = this.forumForm.get(
      'lotCommentForum'
    ) as FormArray;

    let commentForum = elementCommentFormArray.getRawValue()[index];

    commentForum = {
      ...commentForum,
      id_user_: parseInt(id_user_),
      id_comment_forum: parseInt(commentForum.id_comment_forum),
      forum: {
        id_forum: parseInt(commentForum.forum.id_forum),
      },
    };

    this._commentForumService
      .updateCommentForum(commentForum)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_commentForum: CommentForum) => {
          if (_commentForum) {
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
    const elementCommentFormArray = this.forumForm.get(
      'lotCommentForum'
    ) as FormArray;

    const id_comment_forum =
      elementCommentFormArray.getRawValue()[index].id_comment_forum;
    const id_user_ = this.data.user.id_user;

    this._commentForumService
      .deleteCommentForum(id_user_, id_comment_forum)
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
   * Track by function for ngFor loops
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
