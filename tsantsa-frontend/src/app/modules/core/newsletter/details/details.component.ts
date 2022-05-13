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
import { company } from '../../company/company.data';
import { CompanyService } from '../../company/company.service';
import { Company } from '../../company/company.types';
import { user } from '../../user/user.data';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.types';
import { NewsletterListComponent } from '../list/list.component';
import { NewsletterService } from '../newsletter.service';
import { Newsletter } from '../newsletter.types';

@Component({
  selector: 'newsletter-details',
  templateUrl: './details.component.html',
  animations: angelAnimations,
})
export class NewsletterDetailsComponent implements OnInit {
  categoriesCompany: Company[] = [];
  selectedCompany: Company = company;

  categoriesUser: User[] = [];
  selectedUser: User = user;

  nameEntity: string = 'Anuncios';
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
  newsletter!: Newsletter;
  newsletterForm!: FormGroup;
  private newsletters!: Newsletter[];

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
    private _newsletterListComponent: NewsletterListComponent,
    private _newsletterService: NewsletterService,
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _companyService: CompanyService,
    private _userService: UserService
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
    this._newsletterListComponent.matDrawer.open();
    /**
     * Create the newsletter form
     */
    this.newsletterForm = this._formBuilder.group({
      id_newsletter: [''],
      id_company: [''],
      id_user: [''],
      name_newsletter: ['', [Validators.required, Validators.maxLength(100)]],
      description_newsletter: [
        '',
        [Validators.required, Validators.maxLength(500)],
      ],
      date_newsletter: ['', [Validators.required]],
    });
    /**
     * Get the newsletters
     */
    this._newsletterService.newsletters$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((newsletters: Newsletter[]) => {
        this.newsletters = newsletters;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the newsletter
     */
    this._newsletterService.newsletter$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((newsletter: Newsletter) => {
        /**
         * Open the drawer in case it is closed
         */
        this._newsletterListComponent.matDrawer.open();
        /**
         * Get the newsletter
         */
        this.newsletter = newsletter;

        // Company
        this._companyService
          .readAllCompany()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((companys: Company[]) => {
            this.categoriesCompany = companys;

            this.selectedCompany = this.categoriesCompany.find(
              (item) =>
                item.id_company == this.newsletter.company.id_company.toString()
            )!;
          });

        // User
        this._userService
          .readAllUser()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((users: User[]) => {
            this.categoriesUser = users;

            this.selectedUser = this.categoriesUser.find(
              (item) => item.id_user == this.newsletter.user.id_user.toString()
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
    this.newsletterForm.patchValue(this.newsletter);
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
    return this._newsletterListComponent.matDrawer.close();
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
   * Update the newsletter
   */
  updateNewsletter(): void {
    /**
     * Get the newsletter
     */
    const id_user_ = this.data.user.id_user;
    const id_company = this.data.user.company.id_company;

    let newsletter = this.newsletterForm.getRawValue();
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    newsletter = {
      ...newsletter,
      id_user_: parseInt(id_user_),
      id_newsletter: parseInt(newsletter.id_newsletter),
      company: {
        id_company: parseInt(id_company),
      },
      user: {
        id_user: parseInt(id_user_),
      },
    };

    delete newsletter.id_company;
    delete newsletter.id_user;
    /**
     * Update
     */
    this._newsletterService
      .updateNewsletter(newsletter)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_newsletter: Newsletter) => {
          if (_newsletter) {
            this._notificationService.success(
              'Anuncios actualizada correctamente'
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
   * Delete the newsletter
   */
  deleteNewsletter(): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar anuncios',
        message:
          '¿Estás seguro de que deseas eliminar esta anuncios? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the current newsletter's id
           */
          const id_user_ = this.data.user.id_user;
          const id_newsletter = this.newsletter.id_newsletter;
          /**
           * Get the next/previous newsletter's id
           */
          const currentIndex = this.newsletters.findIndex(
            (item) => item.id_newsletter === id_newsletter
          );

          const nextIndex =
            currentIndex +
            (currentIndex === this.newsletters.length - 1 ? -1 : 1);
          const nextId =
            this.newsletters.length === 1 &&
            this.newsletters[0].id_newsletter === id_newsletter
              ? null
              : this.newsletters[nextIndex].id_newsletter;
          /**
           * Delete the newsletter
           */
          this._newsletterService
            .deleteNewsletter(id_user_, id_newsletter)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the newsletter wasn't deleted...
                   */
                  this._notificationService.success(
                    'Anuncios eliminada correctamente'
                  );
                  /**
                   * Get the current activated route
                   */
                  let route = this._activatedRoute;
                  while (route.firstChild) {
                    route = route.firstChild;
                  }
                  /**
                   * Navigate to the next newsletter if available
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
