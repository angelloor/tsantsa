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
import { CompanyService } from '../company.service';
import { Company } from '../company.types';
import { CompanyListComponent } from '../list/list.component';

@Component({
  selector: 'company-details',
  templateUrl: './details.component.html',
  animations: angelAnimations,
})
export class CompanyDetailsComponent implements OnInit {
  nameEntity: string = 'Institución';
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
  company!: Company;
  companyForm!: FormGroup;
  private companys!: Company[];

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
    private _companyListComponent: CompanyListComponent,
    private _companyService: CompanyService,
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
    this._companyListComponent.matDrawer.open();
    /**
     * Create the company form
     */
    this.companyForm = this._formBuilder.group({
      id_company: [''],
      id_setting: ['', [Validators.required]],
      name_company: ['', [Validators.required, Validators.maxLength(100)]],
      acronym_company: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(50),
        ],
      ],
      address_company: ['', [Validators.required, Validators.maxLength(250)]],
      status_company: ['', [Validators.required]],
      expiration_token: [
        '',
        [Validators.required, Validators.maxLength(10), Validators.min(60)],
      ],
      expiration_verification_code: [
        '',
        [Validators.required, Validators.maxLength(10), Validators.min(60)],
      ],
      inactivity_time: [
        '',
        [Validators.required, Validators.maxLength(10), Validators.min(60)],
      ],
      session_limit: [
        '',
        [Validators.required, Validators.maxLength(2), Validators.min(1)],
      ],
    });
    /**
     * Get the companys
     */
    this._companyService.companys$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((companys: Company[]) => {
        this.companys = companys;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the company
     */
    this._companyService.company$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((company: Company) => {
        /**
         * Open the drawer in case it is closed
         */
        this._companyListComponent.matDrawer.open();
        /**
         * Get the company
         */
        this.company = company;
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
    this.companyForm.patchValue({
      ...this.company,
      id_setting: this.company.setting.id_setting,
      expiration_token: this.company.setting.expiration_token,
      expiration_verification_code:
        this.company.setting.expiration_verification_code,
      inactivity_time: this.company.setting.inactivity_time,
      session_limit: this.company.setting.session_limit,
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
    return this._companyListComponent.matDrawer.close();
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
   * Update the company
   */
  updateCompany(): void {
    /**
     * Get the company
     */
    const id_user_ = this.data.user.id_user;
    let company = this.companyForm.getRawValue();
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    company = {
      ...company,
      name_company: company.name_company.trim(),
      acronym_company: company.acronym_company.trim(),
      address_company: company.address_company.trim(),
      setting: {
        id_setting: parseInt(company.id_setting.toString()),
        expiration_token: parseInt(company.expiration_token),
        expiration_verification_code: parseInt(
          company.expiration_verification_code
        ),
        inactivity_time: parseInt(company.inactivity_time),
        session_limit: parseInt(company.session_limit),
      },
      id_user_: parseInt(id_user_),
      id_company: parseInt(company.id_company),
    };

    delete company.id_setting;
    delete company.expiration_token;
    delete company.expiration_verification_code;
    delete company.inactivity_time;
    delete company.session_limit;
    /**
     * Update
     */
    this._companyService
      .updateCompany(company)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_company: Company) => {
          if (_company) {
            this._notificationService.success(
              'Institución actualizada correctamente'
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
   * Delete the company
   */
  deleteCompany(): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar institución',
        message:
          '¿Estás seguro de que deseas eliminar esta institución? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the current company's id
           */
          const id_user_ = this.data.user.id_user;
          const id_company = this.company.id_company;
          /**
           * Get the next/previous company's id
           */
          const currentIndex = this.companys.findIndex(
            (item) => item.id_company === id_company
          );

          const nextIndex =
            currentIndex + (currentIndex === this.companys.length - 1 ? -1 : 1);
          const nextId =
            this.companys.length === 1 &&
            this.companys[0].id_company === id_company
              ? null
              : this.companys[nextIndex].id_company;
          /**
           * Delete the company
           */
          this._companyService
            .deleteCompany(id_user_, id_company)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the company wasn't deleted...
                   */
                  this._notificationService.success(
                    'Institución eliminada correctamente'
                  );
                  /**
                   * Get the current activated route
                   */
                  let route = this._activatedRoute;
                  while (route.firstChild) {
                    route = route.firstChild;
                  }
                  /**
                   * Navigate to the next company if available
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
