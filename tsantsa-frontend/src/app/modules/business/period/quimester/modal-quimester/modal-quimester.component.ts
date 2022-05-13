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
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { Subject, takeUntil } from 'rxjs';
import { period } from '../../../period/period.data';
import { PeriodService } from '../../../period/period.service';
import { Period } from '../../../period/period.types';
import { ModalPartialsService } from '../partial/modal-partials/modal-partials.service';
import { QuimesterService } from '../quimester.service';
import { Quimester } from '../quimester.types';
import { ModalQuimesterService } from './modal-quimester.service';

@Component({
  selector: 'app-modal-quimester',
  templateUrl: './modal-quimester.component.html',
  animations: angelAnimations,
})
export class ModalQuimesterComponent implements OnInit {
  id_quimester: string = '';

  categoriesPeriod: Period[] = [];
  selectedPeriod: Period = period;

  nameEntity: string = 'Quimestre';
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
  quimester!: Quimester;
  quimesterForm!: FormGroup;
  private quimesters!: Quimester[];

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
    private _quimesterService: QuimesterService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _periodService: PeriodService,
    private _modalQuimesterService: ModalQuimesterService,
    private _modalPartialsService: ModalPartialsService
  ) {}

  /** ----------------------------------------------------------------------------------------------------- */
  /** @ Lifecycle hooks
	  /** ----------------------------------------------------------------------------------------------------- */

  /**
   * On init
   */
  ngOnInit(): void {
    this.id_quimester = this._data.id_quimester;
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
     * Create the quimester form
     */
    this.quimesterForm = this._formBuilder.group({
      id_quimester: [''],
      id_period: [{ data: '', disabled: true }, [Validators.required]],
      name_quimester: ['', [Validators.required, Validators.maxLength(100)]],
      description_quimester: [
        '',
        [Validators.required, Validators.maxLength(250)],
      ],
    });
    /**
     * Get the quimester
     */
    this._quimesterService
      .readQuimesterByIdLocal(this.id_quimester)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe();
    /**
     * Get the quimesters
     */
    this._quimesterService.quimesters$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((quimesters: Quimester[]) => {
        this.quimesters = quimesters;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the quimester
     */
    this._quimesterService.quimester$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((quimester: Quimester) => {
        /**
         * Get the quimester
         */
        this.quimester = quimester;

        // Period
        this._periodService
          .readAllPeriod()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((periods: Period[]) => {
            this.categoriesPeriod = periods;

            this.selectedPeriod = this.categoriesPeriod.find(
              (item) =>
                item.id_period == this.quimester.period.id_period.toString()
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
    this.quimesterForm.patchValue({
      ...this.quimester,
      id_period: this.quimester.period.id_period,
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
   * Update the quimester
   */
  updateQuimester(): void {
    /**
     * Get the quimester
     */
    const id_user_ = this.data.user.id_user;
    let quimester = this.quimesterForm.getRawValue();
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    quimester = {
      ...quimester,
      id_user_: parseInt(id_user_),
      id_quimester: parseInt(quimester.id_quimester),
      period: {
        id_period: parseInt(quimester.id_period),
      },
    };
    /**
     * Update
     */
    this._quimesterService
      .updateQuimester(quimester)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_quimester: Quimester) => {
          if (_quimester) {
            this._notificationService.success(
              'Quimestre actualizada correctamente'
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
   * Delete the quimester
   */
  deleteQuimester(): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar quimestre',
        message:
          '¿Estás seguro de que deseas eliminar esta quimestre? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the current quimester's id
           */
          const id_user_ = this.data.user.id_user;
          const id_quimester = this.quimester.id_quimester;
          /**
           * Delete the quimester
           */
          this._quimesterService
            .deleteQuimester(id_user_, id_quimester)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the quimester wasn't deleted...
                   */
                  this._notificationService.success(
                    'Quimestre eliminada correctamente'
                  );
                  /**
                   * Toggle the edit mode off
                   */
                  this.toggleEditMode(false);

                  this.closeModalQuimester();
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
   * closeModalQuimester
   */
  closeModalQuimester(): void {
    this._modalQuimesterService.closeModalQuimester();
  }
  /**
   * openModalPartials
   */
  openModalPartials(): void {
    this._modalPartialsService.openModalPartials(this.id_quimester);
  }
}
