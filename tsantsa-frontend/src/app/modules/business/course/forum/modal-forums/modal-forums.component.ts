import {
  ActionAngelConfirmation,
  AngelConfirmationService,
} from '@angel/services/confirmation';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { AuthService } from 'app/core/auth/auth.service';
import { LayoutService } from 'app/layout/layout.service';
import {
  TYPE_USER,
  TYPE_USER_ENUM,
  _typeUser,
} from 'app/modules/core/user/user.types';
import { NotificationService } from 'app/shared/notification/notification.service';
import { environment } from 'environments/environment';
import moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ForumService } from '../forum.service';
import { Forum } from '../forum.types';
import { ModalForumService } from '../modal-forum/modal-forum.service';
import { ModalForumsService } from './modal-forums.service';

@Component({
  selector: 'app-modal-forums',
  templateUrl: './modal-forums.component.html',
})
export class ModalForumsComponent implements OnInit {
  _urlPathAvatar: string = environment.urlBackend + '/resource/img/avatar/';
  id_course: string = '';

  typeUser: TYPE_USER_ENUM[] = _typeUser;
  lengthminimumDescription: number = 25;

  count: number = 0;
  forums$!: Observable<Forum[]>;

  private data!: AppInitialData;

  searchInputControl: FormControl = new FormControl();
  selectedForum!: Forum;

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
    private _forumService: ForumService,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _authService: AuthService,
    private _modalForumsService: ModalForumsService,
    private _modalForumService: ModalForumService
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
    });
    /**
     * Get the forums
     */
    this.forums$ = this._forumService.forums$;
    /**
     *  Count Subscribe and readAll
     */
    this._forumService
      .byCourseRead(this.id_course)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((forums: Forum[]) => {
        /**
         * Update the counts
         */
        this.count = forums.length;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     *  Count Subscribe
     */
    this._forumService.forums$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((forums: Forum[]) => {
        /**
         * Update the counts
         */
        this.count = forums.length;
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
          return this._forumService.readForumByQuery(
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
   * Create Foro
   */
  createForum(): void {
    this._angelConfirmationService
      .open({
        title: 'Añadir foro',
        message:
          '¿Estás seguro de que deseas añadir una nueva foro? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          const id_user_ = this.data.user.id_user;
          /**
           * Create the foro
           */
          this._forumService
            .createForum(id_user_, this.id_course)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (_forum: Forum) => {
                if (_forum) {
                  this._notificationService.success(
                    'Foro agregada correctamente'
                  );
                  this.openModalForum(_forum.id_forum);
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
  /**
   * closeModalForums
   */
  closeModalForums(): void {
    this._modalForumsService.closeModalForums();
  }
  /**
   * openModalForum
   * @param id_forum
   */
  openModalForum(id_forum: string): void {
    this._modalForumService.openModalForum(id_forum);
  }
  /**
   * Format the given ISO_8601 date as a relative date
   * @param date
   */
  formatDateAsRelative(date: string): string {
    return moment(date, moment.ISO_8601).locale('es').fromNow();
  }
  /**
   * getTypeSelectUser
   */
  getTypeSelectUser(type_validation: TYPE_USER): TYPE_USER_ENUM {
    return this.typeUser.find((user) => user.value_type == type_validation)!;
  }
  /**
   * minimumDescription
   * @param text
   * @returns string
   */
  minimumDescription(text: string): string {
    return `${text.slice(0, this.lengthminimumDescription)}...`;
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
