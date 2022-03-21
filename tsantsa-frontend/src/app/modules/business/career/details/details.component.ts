import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import {
  ActionAngelConfirmation,
  AngelConfirmationService,
} from '@angel/services/confirmation';
import { OverlayRef } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { filter, fromEvent, merge, Subject, takeUntil } from 'rxjs';
import { CareerService } from '../career.service';
import { Career } from '../career.types';
import { CareerListComponent } from '../list/list.component';

@Component({
  selector: 'career-details',
  templateUrl: './details.component.html',
  animations: angelAnimations,
})
export class CareerDetailsComponent implements OnInit {
  nameEntity: string = 'Curso';
  private data!: AppInitialData;

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
  career!: Career;
  careerForm!: FormGroup;
  private careers!: Career[];

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
    private _careerListComponent: CareerListComponent,
    private _careerService: CareerService,
    @Inject(DOCUMENT) private _document: any,
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
    this._careerListComponent.matDrawer.open();
    /**
     * Create the career form
     */
    this.careerForm = this._formBuilder.group({
      id_career: [''],
      company: [''],
      name_career: ['', [Validators.required, Validators.maxLength(100)]],
      description_career: [
        '',
        [Validators.required, Validators.maxLength(1000)],
      ],
      status_career: ['', [Validators.required]],
      creation_date_career: [''],
    });
    /**
     * Get the careers
     */
    this._careerService.careers$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((careers: Career[]) => {
        this.careers = careers;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the career
     */
    this._careerService.career$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((career: Career) => {
        /**
         * Open the drawer in case it is closed
         */
        this._careerListComponent.matDrawer.open();
        /**
         * Get the career
         */
        this.career = career;

        /**
         * Patch values to the form
         */
        this.patchForm();
        /**
         * disabledDependency
         */
        this.disabledDependency(this.career.dependency);
        /**
         * Toggle the edit mode off
         */
        this.toggleEditMode(false);
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
          /**
           * Close Drawer
           */
          this.closeDrawer();
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
    this.careerForm.patchValue(this.career);
  }
  /**
   * disabledDependency
   */
  disabledDependency(dependency: string): void {
    if (parseInt(dependency) >= 1) {
      this.careerForm.disable();
    }
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
    return this._careerListComponent.matDrawer.close();
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
   * Update the career
   */
  updateCareer(): void {
    /**
     * Get the career
     */
    const id_user_ = this.data.user.id_user;
    let career = this.careerForm.getRawValue();
    /**
     *  change the default name
     */
    if (career.name_career.trim() == 'Nuevo curso') {
      this._notificationService.warn('Tienes que cambiar el nombre del curso');
      return;
    }
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    career = {
      ...career,
      name_career: career.name_career.trim(),
      description_career: career.description_career.trim(),
      id_user_: parseInt(id_user_),
      id_career: parseInt(career.id_career),
      company: {
        id_company: parseInt(career.company.id_company),
      },
    };
    /**
     * Update
     */
    this._careerService
      .updateCareer(career)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_career: Career) => {
          if (_career) {
            this._notificationService.success(
              'Curso actualizado correctamente'
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
   * Delete the career
   */
  deleteCareer(): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar curso',
        message:
          '¿Estás seguro de que deseas eliminar este curso? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the current career's id
           */
          const id_user_ = this.data.user.id_user;
          const id_career = this.career.id_career;
          /**
           * Get the next/previous career's id
           */
          const currentIndex = this.careers.findIndex(
            (item) => item.id_career === id_career
          );

          const nextIndex =
            currentIndex + (currentIndex === this.careers.length - 1 ? -1 : 1);
          const nextId =
            this.careers.length === 1 && this.careers[0].id_career === id_career
              ? null
              : this.careers[nextIndex].id_career;
          /**
           * Delete the career
           */
          this._careerService
            .deleteCareer(id_user_, id_career)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the career wasn't deleted...
                   */
                  this._notificationService.success(
                    'Curso eliminado correctamente'
                  );
                  /**
                   * Get the current activated route
                   */
                  let route = this._activatedRoute;
                  while (route.firstChild) {
                    route = route.firstChild;
                  }
                  /**
                   * Navigate to the next career if available
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
}
