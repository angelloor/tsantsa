import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import {
  ActionAngelConfirmation,
  AngelConfirmationService,
} from '@angel/services/confirmation';
import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { Subject, takeUntil } from 'rxjs';
import { ValidationListComponent } from '../list/list.component';
import { ValidationService } from '../validation.service';
import {
  TYPE_VALIDATION_ENUM,
  Validation,
  _typeValidation,
} from '../validation.types';

@Component({
  selector: 'validation-details',
  templateUrl: './details.component.html',
  animations: angelAnimations,
})
export class ValidationDetailsComponent implements OnInit {
  nameEntity: string = 'Validaciones';
  private data!: AppInitialData;

  /**
   * Type Enum
   */
  typeValidation: TYPE_VALIDATION_ENUM[] = _typeValidation;

  typeSelect!: TYPE_VALIDATION_ENUM;
  /**
   * Type Enum
   */

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
  validation!: Validation;
  validationForm!: FormGroup;
  private validations!: Validation[];

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
    private _validationListComponent: ValidationListComponent,
    private _validationService: ValidationService,
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
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
     * Open the drawer
     */
    this._validationListComponent.matDrawer.open();
    /**
     * Create the validation form
     */
    this.validationForm = this._formBuilder.group({
      id_validation: [''],
      id_company: [''],
      type_validation: ['', [Validators.required]],
      status_validation: ['', [Validators.required]],
      pattern_validation: [
        '',
        [Validators.required, Validators.maxLength(500)],
      ],
      message_validation: [
        '',
        [Validators.required, Validators.maxLength(250)],
      ],
    });
    /**
     * Get the validations
     */
    this._validationService.validations$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((validations: Validation[]) => {
        this.validations = validations;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the validation
     */
    this._validationService.validation$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((validation: Validation) => {
        /**
         * Open the drawer in case it is closed
         */
        this._validationListComponent.matDrawer.open();
        /**
         * Get the validation
         */
        this.validation = validation;

        /**
         * Type Enum
         */
        this.typeSelect = this.typeValidation.find(
          (validation) =>
            validation.value_type == this.validation.type_validation
        )!;
        /**
         * Type Enum
         */
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
    this.validationForm.patchValue({
      ...this.validation,
      id_company: this.validation.company.id_company,
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
   * Close the drawer
   */
  closeDrawer(): Promise<MatDrawerToggleResult> {
    return this._validationListComponent.matDrawer.close();
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
   * Update the validation
   */
  updateValidation(): void {
    /**
     * Get the validation
     */
    const id_user_ = this.data.user.id_user;
    let validation = this.validationForm.getRawValue();

    /**
     * Delete whitespace (trim() the atributes type string)
     */

    if (!this.regExpValidator(validation.pattern_validation.trim())) {
      this._notificationService.error('La expresión regular es incorrecta');
      return;
    }

    validation = {
      ...validation,
      pattern_validation: validation.pattern_validation.trim(),
      message_validation: validation.message_validation.trim(),
      company: {
        id_company: parseInt(validation.id_company),
      },
      id_user_: parseInt(id_user_),
      id_validation: parseInt(validation.id_validation),
      id_company: parseInt(validation.id_company.toString()),
    };

    delete validation.id_company;
    /**
     * Update
     */
    this._validationService
      .updateValidation(validation)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_validation: Validation) => {
          if (_validation) {
            this._notificationService.success(
              'Validación actualizada correctamente'
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
   * Delete the validation
   */
  deleteValidation(): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar validación',
        message:
          '¿Estás seguro de que deseas eliminar esta validación? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the current validation's id
           */
          const id_user_ = this.data.user.id_user;
          const id_validation = this.validation.id_validation;
          /**
           * Get the next/previous validation's id
           */
          const currentIndex = this.validations.findIndex(
            (item) => item.id_validation === id_validation
          );

          const nextIndex =
            currentIndex +
            (currentIndex === this.validations.length - 1 ? -1 : 1);
          const nextId =
            this.validations.length === 1 &&
            this.validations[0].id_validation === id_validation
              ? null
              : this.validations[nextIndex].id_validation;
          /**
           * Delete the validation
           */
          this._validationService
            .deleteValidation(id_user_, id_validation)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the validation wasn't deleted...
                   */
                  this._notificationService.success(
                    'Validación eliminada correctamente'
                  );
                  /**
                   * Get the current activated route
                   */
                  let route = this._activatedRoute;
                  while (route.firstChild) {
                    route = route.firstChild;
                  }
                  /**
                   * Navigate to the next validation if available
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

  regExpValidator(regExpString: string): RegExp | boolean {
    try {
      const regExp = new RegExp(regExpString);
      return regExp;
    } catch (e) {
      return false;
    }
  }
}
