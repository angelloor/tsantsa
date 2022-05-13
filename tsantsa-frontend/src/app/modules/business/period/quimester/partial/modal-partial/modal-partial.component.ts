import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import {
  ActionAngelConfirmation,
  AngelConfirmationService,
} from '@angel/services/confirmation';
import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { Subject, takeUntil } from 'rxjs';
import { quimester } from '../../quimester.data';
import { QuimesterService } from '../../quimester.service';
import { Quimester } from '../../quimester.types';
import { PartialService } from '../partial.service';
import { Partial } from '../partial.types';
import { ModalPartialService } from './modal-partial.service';

@Component({
  selector: 'app-modal-partial',
  templateUrl: './modal-partial.component.html',
  animations: angelAnimations,
})
export class ModalPartialComponent implements OnInit {
  id_partial: string = '';

  categoriesQuimester: Quimester[] = [];
  selectedQuimester: Quimester = quimester;

  nameEntity: string = 'Parcial';
  private data!: AppInitialData;

  editMode: boolean = false;
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
  partial!: Partial;
  partialForm!: FormGroup;
  private partials!: Partial[];

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
    private _partialService: PartialService,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _quimesterService: QuimesterService,
    private _modalPartialService: ModalPartialService
  ) {}

  /** ----------------------------------------------------------------------------------------------------- */
  /** @ Lifecycle hooks
	  /** ----------------------------------------------------------------------------------------------------- */

  /**
   * On init
   */
  ngOnInit(): void {
    this.id_partial = this._data.id_partial;
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
     * Create the partial form
     */
    this.partialForm = this._formBuilder.group({
      id_partial: [''],
      id_quimester: ['', [Validators.required]],
      name_partial: ['', [Validators.required, Validators.maxLength(100)]],
      description_partial: [
        '',
        [Validators.required, Validators.maxLength(250)],
      ],
    });
    /**
     * Get the partials
     */
    this._partialService
      .readPartialByIdLocal(this.id_partial)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe();
    /**
     * Get the partials
     */
    this._partialService.partials$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((partials: Partial[]) => {
        this.partials = partials;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the partial
     */
    this._partialService.partial$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((partial: Partial) => {
        /**
         * Get the partial
         */
        this.partial = partial;

        // Quimester
        this._quimesterService
          .readQuimesterByQuery(
            this.partial.quimester.period.id_period,
            'query-all'
          )
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((quimesters: Quimester[]) => {
            this.categoriesQuimester = quimesters;

            this.selectedQuimester = this.categoriesQuimester.find(
              (item) =>
                item.id_quimester ==
                this.partial.quimester.id_quimester.toString()
            )!;
          });

        /**
         * Patch values to the form
         */
        this.patchForm();
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
  /**
   * Pacth the form with the information of the database
   */
  patchForm(): void {
    this.partialForm.patchValue({
      ...this.partial,
      id_quimester: this.partial.quimester.id_quimester,
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
   * Update the partial
   */
  updatePartial(): void {
    /**
     * Get the partial
     */
    const id_user_ = this.data.user.id_user;
    let partial = this.partialForm.getRawValue();
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    partial = {
      ...partial,
      id_user_: parseInt(id_user_),
      id_partial: parseInt(partial.id_partial),
      quimester: {
        id_quimester: parseInt(partial.id_quimester),
      },
    };
    /**
     * Update
     */
    this._partialService
      .updatePartial(partial)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_partial: Partial) => {
          if (_partial) {
            this._notificationService.success(
              'Parcial actualizada correctamente'
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
   * Delete the partial
   */
  deletePartial(): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar parcial',
        message:
          '¿Estás seguro de que deseas eliminar esta parcial? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the current partial's id
           */
          const id_user_ = this.data.user.id_user;
          const id_partial = this.partial.id_partial;
          /**
           * Delete the partial
           */
          this._partialService
            .deletePartial(id_user_, id_partial)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the partial wasn't deleted...
                   */
                  this._notificationService.success(
                    'Parcial eliminada correctamente'
                  );
                  /**
                   * Toggle the edit mode off
                   */
                  this.toggleEditMode(false);

                  this.closeModalPartial();
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
   * closeModalPartial
   */
  closeModalPartial(): void {
    this._modalPartialService.closeModalPartial();
  }
}
