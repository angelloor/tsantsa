import {
  ActionAngelConfirmation,
  AngelConfirmationService,
} from '@angel/services/confirmation';
import { AngelMediaWatcherService } from '@angel/services/media-watcher';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { AuthService } from 'app/core/auth/auth.service';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ProfileService } from '../profile.service';
import { Profile } from '../profile.types';

@Component({
  selector: 'profile-list',
  templateUrl: './list.component.html',
})
export class ProfileListComponent implements OnInit {
  @ViewChild('matDrawer', { static: true }) matDrawer!: MatDrawer;
  count: number = 0;
  profiles$!: Observable<Profile[]>;

  openMatDrawer: boolean = false;

  private data!: AppInitialData;

  drawerMode!: 'side' | 'over';
  searchInputControl: FormControl = new FormControl();
  selectedProfile!: Profile;

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  /**
   * isOpenModal
   */
  isOpenModal: boolean = false;
  /**
   * isOpenModal
   */
  constructor(
    private _store: Store<{ global: AppInitialData }>,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _angelMediaWatcherService: AngelMediaWatcherService,
    private _profileService: ProfileService,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    /**
     * checkSession
     */
    this._authService
      .checkSession()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe();
    /**
     * checkSession
     */
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
     * Get the profiles
     */
    this.profiles$ = this._profileService.profiles$;
    /**
     *  Count Subscribe and readAll
     */
    this._profileService
      .readAllProfile()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((profiles: Profile[]) => {
        /**
         * Update the counts
         */
        this.count = profiles.length;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     *  Count Subscribe
     */
    this._profileService.profiles$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((profiles: Profile[]) => {
        /**
         * Update the counts
         */
        this.count = profiles.length;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Subscribe to search input field value changes
     */
    this.searchInputControl.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        switchMap((query) => {
          /**
           * Search
           */
          return this._profileService.readProfileByQuery(query.toLowerCase());
        })
      )
      .subscribe();
    /**
     * Subscribe to media changes
     */
    this._angelMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
        /**
         * Set the drawerMode if the given breakpoint is active
         */
        if (matchingAliases.includes('lg')) {
          this.drawerMode = 'side';
        } else {
          this.drawerMode = 'over';
        }
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Subscribe to MatDrawer opened change
     */
    this.matDrawer.openedChange
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((opened) => {
        this.openMatDrawer = opened;
        if (!opened) {
          /**
           * Remove the selected when drawer closed
           */
          this.selectedProfile = null!;
          /**
           * Mark for check
           */
          this._changeDetectorRef.markForCheck();
        }
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
  }

  /** ----------------------------------------------------------------------------------------------------- */
  /** @ Public methods
   /** ----------------------------------------------------------------------------------------------------- */

  /**
   * Go to Perfil
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
     * Go to Perfil
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
   * On backdrop clicked
   */
  onBackdropClicked(): void {
    /**
     * Get the current activated route
     */
    let route = this._activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    /**
     * Go to the parent route
     */
    this._router.navigate(['../'], { relativeTo: route });
    /**
     * Mark for check
     */
    this._changeDetectorRef.markForCheck();
  }
  /**
   * Create Perfil
   */
  createProfile(): void {
    this._angelConfirmationService
      .open({
        title: 'Añadir perfil',
        message:
          '¿Estás seguro de que deseas añadir un nuevo perfil? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          const id_user_ = this.data.user.id_user;
          /**
           * Create the perfil
           */
          this._profileService
            .createProfile(id_user_)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (_profile: Profile) => {
                if (_profile) {
                  this._notificationService.success(
                    'Perfil agregado correctamente'
                  );
                  /**
                   * Go to new perfil
                   */
                  this.goToEntity(_profile.id_profile);
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
  /**
   * Track by function for ngFor loops
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
