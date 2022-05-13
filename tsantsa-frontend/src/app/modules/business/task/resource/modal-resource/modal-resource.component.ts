import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { Subject, takeUntil } from 'rxjs';
import { ResourceService } from '../resource.service';
import { Resource } from '../resource.types';
import { ModalResourceService } from './modal-resource.service';

@Component({
  selector: 'app-modal-resource',
  templateUrl: './modal-resource.component.html',
  animations: angelAnimations,
})
export class ModalResourceComponent implements OnInit {
  private data!: AppInitialData;
  id_resource: string = '';

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
  resource!: Resource;
  resourceForm!: FormGroup;
  private resources!: Resource[];

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
    private _resourceService: ResourceService,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _layoutService: LayoutService,
    private _modalResourceService: ModalResourceService
  ) {}

  /** ----------------------------------------------------------------------------------------------------- */
  /** @ Lifecycle hooks
	  /** ----------------------------------------------------------------------------------------------------- */

  /**
   * On init
   */
  ngOnInit(): void {
    this.id_resource = this._data.id_resource;
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
     * Create the resource form
     */
    this.resourceForm = this._formBuilder.group({
      id_resource: [''],
      task: [''],
      name_resource: ['', [Validators.required, Validators.maxLength(100)]],
      description_resource: [
        '',
        [Validators.required, Validators.maxLength(250)],
      ],
      link_resource: ['', [Validators.required, Validators.maxLength(500)]],
    });
    /**
     * Get the resource
     */
    this._resourceService
      .readResourceById(this.id_resource)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((resource: Resource) => {
        /**
         * Get the resource
         */
        this.resource = resource;
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
  /**
   * Pacth the form with the information of the database
   */
  patchForm(): void {
    this.resourceForm.patchValue(this.resource);
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
   * Update the resource
   */
  updateResource(): void {
    /**
     * Get the resource
     */
    const id_user_ = this.data.user.id_user;
    let resource = this.resourceForm.getRawValue();
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    resource = {
      ...resource,
      name_resource: resource.name_resource.trim(),
      description_resource: resource.description_resource.trim(),
      link_resource: resource.link_resource.trim(),
      id_user_: parseInt(id_user_),
      id_resource: parseInt(resource.id_resource),
      task: {
        id_task: parseInt(resource.task.id_task),
      },
    };
    /**
     * Update
     */
    this._resourceService
      .updateResource(resource)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_resource: Resource) => {
          if (_resource) {
            this._notificationService.success(
              'Recurso actualizado correctamente'
            );
            this.closeModalResource();
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
   * closeModalResource
   */
  closeModalResource(): void {
    this._modalResourceService.closeModalResource();
  }
}
