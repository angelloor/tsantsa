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
import { TYPE_USER } from 'app/modules/core/user/user.types';
import { NotificationService } from 'app/shared/notification/notification.service';
import moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { GlossaryService } from '../glossary.service';
import { Glossary } from '../glossary.types';
import { ModalGlossaryStudentService } from '../modal-glossary-student/modal-glossary-student.service';
import { ModalGlossaryService } from '../modal-glossary/modal-glossary.service';
import { ModalGlossarysService } from './modal-glossarys.service';

@Component({
  selector: 'app-modal-glossarys',
  templateUrl: './modal-glossarys.component.html',
})
export class ModalGlossarysComponent implements OnInit {
  id_course: string = '';

  type_user: TYPE_USER = 'student';
  lengthminimumDescription: number = 25;

  count: number = 0;
  glossarys$!: Observable<Glossary[]>;

  private data!: AppInitialData;

  searchInputControl: FormControl = new FormControl();
  selectedGlossary!: Glossary;

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
    private _glossaryService: GlossaryService,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _authService: AuthService,
    private _modalGlossarysService: ModalGlossarysService,
    private _modalGlossaryService: ModalGlossaryService,
    private _modalGlossaryStudentService: ModalGlossaryStudentService
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
     * Get the glossarys
     */
    this.glossarys$ = this._glossaryService.glossarys$;
    /**
     *  Count Subscribe and readAll
     */
    this._glossaryService
      .byCourseRead(this.id_course)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((glossarys: Glossary[]) => {
        /**
         * Update the counts
         */
        this.count = glossarys.length;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     *  Count Subscribe
     */
    this._glossaryService.glossarys$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((glossarys: Glossary[]) => {
        /**
         * Update the counts
         */
        this.count = glossarys.length;
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
          return this._glossaryService.readGlossaryByQuery(
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
   * Create Glosario
   */
  createGlossary(): void {
    this._angelConfirmationService
      .open({
        title: 'Añadir glosario',
        message:
          '¿Estás seguro de que deseas añadir una nueva glosario? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          const id_user_ = this.data.user.id_user;
          /**
           * Create the glosario
           */
          this._glossaryService
            .createGlossary(id_user_, this.id_course)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (_glossary: Glossary) => {
                if (_glossary) {
                  this._notificationService.success(
                    'Glosario agregada correctamente'
                  );

                  this.openModalGlossary(_glossary.id_glossary);
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
   * closeModalGlossarys
   */
  closeModalGlossarys(): void {
    this._modalGlossarysService.closeModalGlossarys();
  }
  /**
   * openModalGlossary
   * @param id_glossary
   */
  openModalGlossary(id_glossary: string): void {
    if (this.type_user == 'student') {
      this._modalGlossaryStudentService.openModalGlossaryStudent(id_glossary);
    } else {
      this._modalGlossaryService.openModalGlossary(id_glossary);
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
