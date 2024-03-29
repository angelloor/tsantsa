import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import {
  ActionAngelConfirmation,
  AngelConfirmationService,
} from '@angel/services/confirmation';
import { OverlayRef } from '@angular/cdk/overlay';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { SecurityCap } from 'app/utils/SecurityCap';
import { environment } from 'environments/environment';
import { Subject, takeUntil } from 'rxjs';
import { company } from '../../company/company.data';
import { CompanyService } from '../../company/company.service';
import { Company } from '../../company/company.types';
import { profile } from '../../profile/profile.data';
import { ProfileService } from '../../profile/profile.service';
import { Profile, TYPE_PROFILE } from '../../profile/profile.types';
import { SessionService } from '../../session/session.service';
import { validation } from '../../validation/validation.data';
import { ValidationService } from '../../validation/validation.service';
import { Validation } from '../../validation/validation.types';
import { UserListComponent } from '../list/list.component';
import { UserService } from '../user.service';
import { TYPE_USER_ENUM, User, _typeUser } from '../user.types';

@Component({
  selector: 'user-details',
  templateUrl: './details.component.html',
  animations: angelAnimations,
})
export class UserDetailsComponent implements OnInit {
  _urlPathAvatar: string = environment.urlBackend + '/resource/img/avatar/';
  type_profile: TYPE_PROFILE = 'commonProfile';

  @ViewChild('avatarFileInput') private _avatarFileInput!: ElementRef;

  categoriesCompany: Company[] = [];
  selectedCompany: Company = company;

  categoriesProfile: Profile[] = [];
  selectedProfile: Profile = profile;

  nameEntity: string = 'Usuario';
  private data!: AppInitialData;

  /**
   * Type Enum
   */
  typeUser: TYPE_USER_ENUM[] = _typeUser;

  typeSelect!: TYPE_USER_ENUM;
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
  user!: User;
  userForm!: FormGroup;
  private users!: User[];

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
   * Validation
   */
  validationPassword: Validation = validation;
  validationDNI: Validation = validation;
  validationPhoneNumber: Validation = validation;
  /**
   * Validation
   */
  /**
   * Constructor
   */
  constructor(
    private _store: Store<{ global: AppInitialData }>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _userListComponent: UserListComponent,
    private _userService: UserService,
    private _formBuilder: FormBuilder,
    private _securityCap: SecurityCap,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _companyService: CompanyService,
    private _profileService: ProfileService,
    private _layoutService: LayoutService,
    private _validationService: ValidationService,
    private _sessionService: SessionService
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
      this.type_profile = this.data.user.profile.type_profile;
    });
    /**
     * Open the drawer
     */
    this._userListComponent.matDrawer.open();
    /**
     * Create the user form
     */
    this.userForm = this._formBuilder.group({
      id_user: [''],
      type_user: ['', [Validators.required]],
      name_user: ['', [Validators.required, Validators.maxLength(50)]],
      password_user: ['', [Validators.required, Validators.maxLength(250)]],
      avatar_user: [''],
      status_user: ['', [Validators.required]],

      id_company: ['', [Validators.required]],
      id_profile: ['', [Validators.required]],

      id_person: [''],
      dni_person: ['', [Validators.required, Validators.maxLength(20)]],
      name_person: ['', [Validators.required, Validators.maxLength(150)]],
      last_name_person: ['', [Validators.required, Validators.maxLength(150)]],
      address_person: ['', [Validators.required, Validators.maxLength(150)]],
      phone_person: ['', [Validators.required, Validators.maxLength(13)]],

      id_academic: [''],
      title_academic: ['', [Validators.maxLength(250)]],
      abbreviation_academic: ['', [Validators.maxLength(50)]],
      nivel_academic: ['', [Validators.maxLength(100)]],

      id_job: [''],
      name_job: ['', [Validators.maxLength(200)]],
      address_job: ['', [Validators.maxLength(200)]],
      phone_job: ['', [Validators.maxLength(13)]],
      position_job: ['', [Validators.maxLength(150)]],
    });
    /**
     * Validations
     */
    this._validationService.validationsActive$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((validations: Validation[]) => {
        /**
         * validationPassword
         */
        if (
          !validations.find(
            (validation) => validation.type_validation == 'validationPassword'
          )
        ) {
          this._validationService
            .byTypeValidationRead('validationPassword')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
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
        } else {
          this.validationPassword = validations.find(
            (validation) => validation.type_validation == 'validationPassword'
          )!;
          /**
           * Set Validation Pattern
           */
          if (this.validationPassword.type_validation == 'validationPassword') {
            /**
             * Parse to String RegExp to RegExp
             */
            let validationPasswordRegExp = new RegExp(
              this.validationPassword.pattern_validation
            );
            /**
             * Set Validators
             */
            this.userForm.controls['password_user'].setValidators([
              Validators.required,
              Validators.maxLength(250),
              Validators.pattern(validationPasswordRegExp),
            ]);
          } else {
            this.userForm.controls['password_user'].setValidators([
              Validators.required,
              Validators.maxLength(250),
            ]);
          }
        }
        /**
         * validationDNI
         */
        if (
          !validations.find(
            (validation) => validation.type_validation == 'validationDNI'
          )
        ) {
          this._validationService
            .byTypeValidationRead('validationDNI')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
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
        } else {
          this.validationDNI = validations.find(
            (validation) => validation.type_validation == 'validationDNI'
          )!;
          /**
           * Set Validation Pattern
           */
          if (this.validationDNI.type_validation == 'validationDNI') {
            /**
             * Parse to String RegExp to RegExp
             */
            let validationDNIRegExp = new RegExp(
              this.validationDNI.pattern_validation
            );
            /**
             * Set Validators
             */
            this.userForm.controls['dni_person'].setValidators([
              Validators.required,
              Validators.maxLength(20),
              Validators.pattern(validationDNIRegExp),
            ]);
          } else {
            this.userForm.controls['dni_person'].setValidators([
              Validators.required,
              Validators.maxLength(20),
            ]);
          }
        }
        /**
         * validationPhoneNumber
         */
        if (
          !validations.find(
            (validation) =>
              validation.type_validation == 'validationPhoneNumber'
          )
        ) {
          this._validationService
            .byTypeValidationRead('validationPhoneNumber')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
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
        } else {
          this.validationPhoneNumber = validations.find(
            (validation) =>
              validation.type_validation == 'validationPhoneNumber'
          )!;
          /**
           * Set Validation Pattern
           */
          if (
            this.validationPhoneNumber.type_validation ==
            'validationPhoneNumber'
          ) {
            /**
             * Parse to String RegExp to RegExp
             */
            let validationPhoneNumberRegExp = new RegExp(
              this.validationPhoneNumber.pattern_validation
            );
            /**
             * Set Validators
             */
            this.userForm.controls['phone_person'].setValidators([
              Validators.required,
              Validators.maxLength(13),
              Validators.pattern(validationPhoneNumberRegExp),
            ]);
            this.userForm.controls['phone_job'].setValidators([
              Validators.required,
              Validators.maxLength(13),
              Validators.pattern(validationPhoneNumberRegExp),
            ]);
          } else {
            this.userForm.controls['phone_person'].setValidators([
              Validators.required,
              Validators.maxLength(13),
            ]);
            this.userForm.controls['phone_job'].setValidators([
              Validators.required,
              Validators.maxLength(13),
            ]);
          }
        }
      });
    /**
     * Validations
     */
    /**
     * Get the users
     */
    this._userService.users$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((users: User[]) => {
        this.users = users;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the user
     */
    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: User) => {
        /**
         * Open the drawer in case it is closed
         */
        this._userListComponent.matDrawer.open();
        /**
         * Get the user
         */
        this.user = user;

        /**
         * Type Enum
         */
        this.typeSelect = this.typeUser.find(
          (user) => user.value_type == this.user.type_user
        )!;
        /**
         * Type Enum
         */

        // Company
        this._companyService
          .readAllCompany()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((companys: Company[]) => {
            this.categoriesCompany = companys;

            this.selectedCompany = this.categoriesCompany.find(
              (item) =>
                item.id_company == this.user.company.id_company.toString()
            )!;
          });

        // Profile
        this._profileService
          .readAllProfile()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((profiles: Profile[]) => {
            this.categoriesProfile = profiles;

            this.selectedProfile = this.categoriesProfile.find(
              (item) =>
                item.id_profile == this.user.profile.id_profile.toString()
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
    this.userForm.patchValue({
      ...this.user,
      password_user: this.aesDecrypt(this.user.password_user),
      id_company: this.user.company.id_company,
      id_profile: this.user.profile.id_profile,

      id_person: this.user.person.id_person,
      dni_person: this.user.person.dni_person,
      name_person: this.user.person.name_person,
      last_name_person: this.user.person.last_name_person,
      address_person: this.user.person.address_person,
      phone_person: this.user.person.phone_person,

      id_academic: this.user.person.academic.id_academic,
      title_academic: this.user.person.academic.title_academic,
      abbreviation_academic: this.user.person.academic.abbreviation_academic,
      nivel_academic: this.user.person.academic.nivel_academic,

      id_job: this.user.person.job.id_job,
      name_job: this.user.person.job.name_job,
      address_job: this.user.person.job.address_job,
      phone_job: this.user.person.job.phone_job,
      position_job: this.user.person.job.position_job,
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
    return this._userListComponent.matDrawer.close();
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
   * Update the user
   */
  updateUser(): void {
    /**
     * Get the user
     */
    const id_user_ = this.data.user.id_user;
    let user = this.userForm.getRawValue();
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    user = {
      ...user,
      name_user: user.name_user.trim(),
      password_user: this.aesEncrypt(user.password_user.trim()),
      id_user_: parseInt(id_user_),
      id_user: parseInt(user.id_user),
      company: {
        id_company: parseInt(user.id_company),
      },
      person: {
        id_person: parseInt(user.id_person),
        academic: {
          id_academic: parseInt(user.id_academic),
          title_academic: user.title_academic.trim(),
          abbreviation_academic: user.abbreviation_academic.trim(),
          nivel_academic: user.nivel_academic.trim(),
        },
        job: {
          id_job: parseInt(user.id_job),
          name_job: user.name_job.trim(),
          address_job: user.address_job.trim(),
          phone_job: user.phone_job.trim(),
          position_job: user.position_job.trim(),
        },
        dni_person: user.dni_person.trim(),
        name_person: user.name_person.trim(),
        last_name_person: user.last_name_person.trim(),
        address_person: user.address_person.trim(),
        phone_person: user.phone_person.trim(),
      },
      profile: {
        id_profile: parseInt(user.id_profile),
      },
    };
    /**
     * Update
     */
    this._userService
      .updateUser(user)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_user: User) => {
          if (_user) {
            this._notificationService.success(
              'Usuario actualizado correctamente'
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
   * Delete the user
   */
  deleteUser(): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar usuario',
        message:
          '¿Estás seguro de que deseas eliminar este usuario? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the current user's id
           */
          const id_user_ = this.data.user.id_user;
          const id_user = this.user.id_user;
          /**
           * Get the next/previous user's id
           */
          const currentIndex = this.users.findIndex(
            (item) => item.id_user === id_user
          );

          const nextIndex =
            currentIndex + (currentIndex === this.users.length - 1 ? -1 : 1);
          const nextId =
            this.users.length === 1 && this.users[0].id_user === id_user
              ? null
              : this.users[nextIndex].id_user;
          /**
           * Delete the user
           */
          this._userService
            .deleteUser(id_user_, id_user)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the user wasn't deleted...
                   */
                  this._notificationService.success(
                    'Usuario eliminado correctamente'
                  );
                  /**
                   * Get the current activated route
                   */
                  let route = this._activatedRoute;
                  while (route.firstChild) {
                    route = route.firstChild;
                  }
                  /**
                   * Navigate to the next user if available
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

  aesDecrypt(textEncrypted: string) {
    return this._securityCap.aesDecrypt(textEncrypted);
  }

  aesEncrypt(text: string) {
    return this._securityCap.aesEncrypt(text);
  }

  /**
   * Upload avatar
   *
   * @param fileList
   */
  uploadAvatar(fileList: FileList, user: User): void {
    // Return if canceled
    if (!fileList.length) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    const file = fileList[0];

    // Return if the file is not allowed
    if (!allowedTypes.includes(file.type)) {
      return;
    }

    // Upload the avatar
    this._userService.uploadAvatar(user, file, this.data.user).subscribe();
    // Set Edit mode in true
    this.editMode = false;
  }

  /**
   * Remove the avatar
   */
  removeAvatar(user: User): void {
    this._userService.removeAvatar(user, this.data.user).subscribe();
    // Set the file input value as null
    this._avatarFileInput.nativeElement.value = null;
    // Set Edit mode in true
    this.editMode = false;
  }
  /**
   * byUserReleaseAll
   */
  byUserReleaseAll() {
    this._angelConfirmationService
      .open({
        title: 'Cerrar sesión',
        message:
          '¿Estás seguro de que deseas cerrar todas las sesiones de este usuario? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          const id_user_ = this.data.user.id_user;

          let sesion = {
            id_user_: parseInt(id_user_),
            user: {
              id_user: parseInt(this.user.id_user),
            },
          };
          /**
           * Create the sesiones
           */
          this._sessionService
            .byUserReleaseAll(sesion)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  this._notificationService.success(
                    'Sesiones cerradas correctamente'
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
        this._layoutService.setOpenModal(false);
      });
  }
}
