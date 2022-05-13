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
import { NotificationService } from 'app/shared/notification/notification.service';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ModalQuimesterService } from '../modal-quimester/modal-quimester.service';
import { QuimesterService } from '../quimester.service';
import { Quimester } from '../quimester.types';
import { ModalQuimestersService } from './modal-quimesters.service';

@Component({
  selector: 'app-modal-quimesters',
  templateUrl: './modal-quimesters.component.html',
})
export class ModalQuimestersComponent implements OnInit {
  id_period: string = '';
  count: number = 0;
  quimesters$!: Observable<Quimester[]>;

  private data!: AppInitialData;

  searchInputControl: FormControl = new FormControl();
  selectedQuimester!: Quimester;

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
    private _quimesterService: QuimesterService,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _authService: AuthService,
    private _modalQuimestersService: ModalQuimestersService,
    private _modalQuimesterService: ModalQuimesterService
  ) {}

  ngOnInit(): void {
    this.id_period = this._data.id_period;
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
     * Get the quimesters
     */
    this.quimesters$ = this._quimesterService.quimesters$;
    /**
     *  Count Subscribe and readAll
     */
    this._quimesterService
      .byPeriodRead(this.id_period)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((quimesters: Quimester[]) => {
        /**
         * Update the counts
         */
        this.count = quimesters.length;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     *  Count Subscribe
     */
    this._quimesterService.quimesters$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((quimesters: Quimester[]) => {
        /**
         * Update the counts
         */
        this.count = quimesters.length;
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
          return this._quimesterService.readQuimesterByQuery(
            this.id_period,
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
   * openModalQuimester
   */
  openModalQuimester(id_quimester: string): void {
    this._modalQuimesterService.openModalQuimester(id_quimester);
  }
  /**
   * Create Quimestre
   */
  createQuimester(): void {
    this._angelConfirmationService
      .open({
        title: 'Añadir quimestre',
        message:
          '¿Estás seguro de que deseas añadir una nueva quimestre? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          const id_user_ = this.data.user.id_user;
          /**
           * Create the quimestre
           */
          this._quimesterService
            .createQuimester(id_user_, this.id_period)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (_quimester: Quimester) => {
                if (_quimester) {
                  this.openModalQuimester(_quimester.id_quimester);
                  this._notificationService.success(
                    'Quimestre agregada correctamente'
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
  /**
   * closeModalQuimesters
   */
  closeModalQuimesters(): void {
    this._modalQuimestersService.closeModalQuimesters();
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
