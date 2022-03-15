import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { NotificationService } from 'app/shared/notification/notification.service';
import { Subject, takeUntil } from 'rxjs';
import { ValidationService } from '../validation.service';
import {
  TYPE_VALIDATION,
  TYPE_VALIDATION_ENUM,
  Validation,
  _typeValidation,
} from '../validation.types';
import { ModalTypeValidationService } from './modal-type-validation.service';

@Component({
  selector: 'app-modal-type-validation',
  templateUrl: './modal-type-validation.component.html',
})
export class ModalTypeValidationComponent implements OnInit {
  private data!: AppInitialData;
  typeValidationForm!: FormGroup;

  openMatDrawer: boolean = false;

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  /**
   * Type Enum
   */
  typeValidation: TYPE_VALIDATION_ENUM[] = _typeValidation;
  /**
   * Type Enum
   */
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _store: Store<{ global: AppInitialData }>,
    private _validationService: ValidationService,
    private _modalTypeValidationService: ModalTypeValidationService,
    private _notificationService: NotificationService,
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    /**
     * Subscribe to user changes of state
     */
    this._store.pipe(takeUntil(this._unsubscribeAll)).subscribe((state) => {
      this.data = state.global;
    });
    // Create the form
    this.typeValidationForm = this._formBuilder.group({
      type_validation: ['', [Validators.required]],
    });

    /**
     * Subscribe to MatDrawer opened change
     */
    this._modalTypeValidationService.openMatDrawer$.subscribe(
      (_openMatDrawer) => {
        this.openMatDrawer = _openMatDrawer;
      }
    );
  }

  /**
   * Go to Solicitud
   * @param id
   */
  goToEntity(id: string): void {
    /**
     * Get the current activated route
     */
    let route = this._activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    /**
     * Go to Solicitud
     */
    this._router.navigate([this.openMatDrawer ? '../' : './', id], {
      relativeTo: route,
    });
    /**
     * Mark for check
     */
    this._changeDetectorRef.markForCheck();
  }
  /**
   * Save and close
   */
  saveAndClose(): void {
    // Close the dialog
    this._modalTypeValidationService.closeModalTypeValidationService();
  }

  /**
   * Discard the message
   */
  discard(): void {
    this._modalTypeValidationService.closeModalTypeValidationService();
  }
  /**
   * Send the message
   */
  send(): void {
    const id_user = this.data.user.id_user;
    const type_validation =
      this.typeValidationForm.getRawValue().type_validation;
    /**
     * Create the solicitud
     */
    this._validationService
      .createValidation(id_user, type_validation)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_validation: Validation) => {
          if (_validation) {
            this.saveAndClose();
            this._notificationService.success(
              'Validación agregada correctamente'
            );
            /**
             * Go to new solicitud
             */
            this.goToEntity(_validation.id_validation);
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
   * getTypeSelect
   */
  getTypeSelect(type_validation: TYPE_VALIDATION): TYPE_VALIDATION_ENUM {
    return this.typeValidation.find(
      (validation) => validation.value_type == type_validation
    )!;
  }
}
