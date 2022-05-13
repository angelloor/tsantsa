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
import { ModalPartialService } from '../modal-partial/modal-partial.service';
import { PartialService } from '../partial.service';
import { Partial } from '../partial.types';
import { ModalPartialsService } from './modal-partials.service';

@Component({
  selector: 'app-modal-partials',
  templateUrl: './modal-partials.component.html',
})
export class ModalPartialsComponent implements OnInit {
  id_quimester: string = '';

  count: number = 0;
  partials$!: Observable<Partial[]>;

  private data!: AppInitialData;

  searchInputControl: FormControl = new FormControl();
  selectedPartial!: Partial;

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
    private _partialService: PartialService,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _authService: AuthService,
    private _modalPartialsService: ModalPartialsService,
    private _modalPartialService: ModalPartialService
  ) {}

  ngOnInit(): void {
    this.id_quimester = this._data.id_quimester;
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
     * Get the partials
     */
    this.partials$ = this._partialService.partials$;
    /**
     *  Count Subscribe and readAll
     */
    this._partialService
      .byQuimesterRead(this.id_quimester)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((partials: Partial[]) => {
        /**
         * Update the counts
         */
        this.count = partials.length;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     *  Count Subscribe
     */
    this._partialService.partials$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((partials: Partial[]) => {
        /**
         * Update the counts
         */
        this.count = partials.length;
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
          return this._partialService.readPartialByQuery(
            this.id_quimester,
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
   * Create Parcial
   */
  createPartial(): void {
    this._angelConfirmationService
      .open({
        title: 'Añadir parcial',
        message:
          '¿Estás seguro de que deseas añadir una nueva parcial? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          const id_user_ = this.data.user.id_user;
          /**
           * Create the parcial
           */
          this._partialService
            .createPartial(id_user_, this.id_quimester)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (_partial: Partial) => {
                if (_partial) {
                  this._notificationService.success(
                    'Parcial agregada correctamente'
                  );

                  this.openModalPartial(_partial.id_partial);
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
   * closeModalPartials
   */
  closeModalPartials(): void {
    this._modalPartialsService.closeModalPartials();
  }
  /**
   * openModalPartial
   * @param id_partial
   */
  openModalPartial(id_partial: string): void {
    this._modalPartialService.openModalPartial(id_partial);
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
