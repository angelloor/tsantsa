import { AngelAlertType } from '@angel/components/alert';
import {
  ActionAngelConfirmation,
  AngelConfirmationService,
} from '@angel/services/confirmation';
import { OverlayRef } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { filter, fromEvent, merge, Subject, takeUntil } from 'rxjs';
import { AssistanceService } from '../../assistance.service';
import { Assistance } from '../../assistance.types';

@Component({
  selector: 'app-modal-assistance-details',
  templateUrl: './modal-assistance-details.component.html',
})
export class ModalAssistanceDetailsComponent implements OnInit {
  nameEntity: string = 'Mis asistencias';
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
  assistance!: Assistance;
  assistanceForm!: FormGroup;
  private assistances!: Assistance[];

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
    @Inject(DOCUMENT) private _document: any,
    private _formBuilder: FormBuilder,
    private _assistanceService: AssistanceService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _matDialog: MatDialog,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService
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
     * Create the assistance form
     */
    this.assistanceForm = this._formBuilder.group({
      id_assistance: [''],
      user: ['', [Validators.required]],
      course: ['', [Validators.required]],
      start_marking_date: ['', [Validators.required]],
      end_marking_date: ['', [Validators.required]],
      is_late: ['', [Validators.required]],
    });
    /**
     * Get the assistances
     */
    this._assistanceService.assistances$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((assistances: Assistance[]) => {
        this.assistances = assistances;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the assistance
     */
    this._assistanceService.assistance$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((assistance: Assistance) => {
        /**
         * Get the assistance
         */
        this.assistance = assistance;
        /**
         * Patch values to the form
         */
        this.patchForm();
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
  /**
   * Pacth the form with the information of the database
   */
  patchForm(): void {
    this.assistanceForm.patchValue(this.assistance);
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
   * Update the assistance
   */
  updateAssistance(): void {
    /**
     * Get the assistance
     */
    const id_user_ = this.data.user.id_user;
    let assistance = this.assistanceForm.getRawValue();
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    assistance = {
      ...assistance,
      id_user_: parseInt(id_user_),
      id_assistance: parseInt(assistance.id_assistance),
      id_user: parseInt(assistance.id_user),
      id_course: parseInt(assistance.id_course),
    };
    /**
     * Update
     */
    this._assistanceService
      .updateAssistance(assistance)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_assistance: Assistance) => {
          if (_assistance) {
            this._notificationService.success(
              'Mis asistencias actualizada correctamente'
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
  /**
   * Delete the assistance
   */
  deleteAssistance(): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar mis asistencias',
        message:
          '¿Estás seguro de que deseas eliminar esta mis asistencias? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the current assistance's id
           */
          const id_user_ = this.data.user.id_user;
          const id_assistance = this.assistance.id_assistance;
          /**
           * Get the next/previous assistance's id
           */
          const currentIndex = this.assistances.findIndex(
            (item) => item.id_assistance === id_assistance
          );

          const nextIndex =
            currentIndex +
            (currentIndex === this.assistances.length - 1 ? -1 : 1);
          const nextId =
            this.assistances.length === 1 &&
            this.assistances[0].id_assistance === id_assistance
              ? null
              : this.assistances[nextIndex].id_assistance;
          /**
           * Delete the assistance
           */
          this._assistanceService
            .deleteAssistance(id_user_, id_assistance)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the assistance wasn't deleted...
                   */
                  this._notificationService.success(
                    'Mis asistencias eliminada correctamente'
                  );
                  /**
                   * Get the current activated route
                   */
                  let route = this._activatedRoute;
                  while (route.firstChild) {
                    route = route.firstChild;
                  }
                  /**
                   * Navigate to the next assistance if available
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
  closeModalAssistance(): void {
    this._matDialog.closeAll();
  }
}
