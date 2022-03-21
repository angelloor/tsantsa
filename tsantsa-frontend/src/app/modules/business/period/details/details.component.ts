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
import moment from 'moment';
import { filter, fromEvent, merge, Subject, takeUntil } from 'rxjs';
import { PeriodListComponent } from '../list/list.component';
import { PeriodService } from '../period.service';
import { Period } from '../period.types';

@Component({
  selector: 'period-details',
  templateUrl: './details.component.html',
  animations: angelAnimations,
})
export class PeriodDetailsComponent implements OnInit {
  nameEntity: string = 'Periodo';
  private data!: AppInitialData;

  startDate: any = '';
  endDate: any = '';

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
  period!: Period;
  periodForm!: FormGroup;
  private periods!: Period[];

  private _tagsPanelOverlayRef!: OverlayRef;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  /**
   * isOpenModal
   */
  isOpenModal: boolean = false;
  maximum_rating: number = 0;
  /**
   * isOpenModal
   */
  /**
   * Constructor
   */
  constructor(
    private _store: Store<{ global: AppInitialData }>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _periodListComponent: PeriodListComponent,
    private _periodService: PeriodService,
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
    this._periodListComponent.matDrawer.open();
    /**
     * Create the period form
     */
    this.periodForm = this._formBuilder.group({
      id_period: [''],
      company: [''],
      name_period: ['', [Validators.required, Validators.maxLength(100)]],
      description_period: [
        '',
        [Validators.required, Validators.maxLength(250)],
      ],
      start_date_period: ['', [Validators.required]],
      end_date_period: ['', [Validators.required]],
      maximum_rating: ['', [Validators.required, Validators.maxLength(3)]],
      approval_note_period: [
        '',
        [Validators.required, Validators.maxLength(3)],
      ],
    });
    /**
     * Get the periods
     */
    this._periodService.periods$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((periods: Period[]) => {
        this.periods = periods;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the period
     */
    this._periodService.period$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((period: Period) => {
        /**
         * Open the drawer in case it is closed
         */
        this._periodListComponent.matDrawer.open();
        /**
         * Get the period
         */
        this.period = period;
        /**
         * Patch values to the form
         */
        this.patchForm();
        this.startDate = this.period.start_date_period;
        this.endDate = this.period.end_date_period;
        /**
         * disabledDependency
         */
        this.disabledDependency(this.period.dependency);
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
    this.periodForm.patchValue(this.period);
    this.maximum_rating = this.period.maximum_rating;
  }
  /**
   * disabledDependency
   */
  disabledDependency(dependency: string): void {
    if (parseInt(dependency) >= 1) {
      this.periodForm.disable();
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
    return this._periodListComponent.matDrawer.close();
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
   * Update the period
   */
  updatePeriod(): void {
    /**
     * Get the period
     */
    const id_user_ = this.data.user.id_user;
    let period = this.periodForm.getRawValue();
    /**
     *  change the default name
     */
    if (period.name_period.trim() == 'Nuevo periodo') {
      this._notificationService.warn(
        'Tienes que cambiar el nombre del periodo'
      );
      return;
    }
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    period = {
      ...period,
      name_period: period.name_period.trim(),
      description_period: period.description_period.trim(),
      id_user_: parseInt(id_user_),
      id_period: parseInt(period.id_period),
      company: {
        id_company: parseInt(period.company.id_company),
      },
      maximum_rating: parseInt(period.maximum_rating),
      approval_note_period: parseInt(period.maximum_rating),
    };
    /**
     * Update
     */
    this._periodService
      .updatePeriod(period)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_period: Period) => {
          if (_period) {
            this._notificationService.success(
              'Periodo actualizada correctamente'
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
   * Delete the period
   */
  deletePeriod(): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar periodo',
        message:
          '¿Estás seguro de que deseas eliminar esta periodo? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the current period's id
           */
          const id_user_ = this.data.user.id_user;
          const id_period = this.period.id_period;
          /**
           * Get the next/previous period's id
           */
          const currentIndex = this.periods.findIndex(
            (item) => item.id_period === id_period
          );

          const nextIndex =
            currentIndex + (currentIndex === this.periods.length - 1 ? -1 : 1);
          const nextId =
            this.periods.length === 1 && this.periods[0].id_period === id_period
              ? null
              : this.periods[nextIndex].id_period;
          /**
           * Delete the period
           */
          this._periodService
            .deletePeriod(id_user_, id_period)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the period wasn't deleted...
                   */
                  this._notificationService.success(
                    'Periodo eliminada correctamente'
                  );
                  /**
                   * Get the current activated route
                   */
                  let route = this._activatedRoute;
                  while (route.firstChild) {
                    route = route.firstChild;
                  }
                  /**
                   * Navigate to the next period if available
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
  /**
   * change
   */
  change() {
    this.periodForm.getRawValue().maximum_rating;
    this.maximum_rating = this.periodForm.getRawValue().maximum_rating;
  }

  /**
   * changeKeyPress
   */
  changeKeyPress(form: any) {
    setTimeout(() => {
      this.maximum_rating = form.getRawValue().maximum_rating;
    }, 0);
  }
  /**
   * changeStartDatePeriod
   * isBefore, isSame, and isAfter of moment
   * @param form
   */
  changeStartDatePeriod(form: any) {
    let startDatePeriod = form.getRawValue().start_date_period;

    var isBefore = moment(startDatePeriod).isBefore(this.endDate);

    if (isBefore) {
      this.startDate = startDatePeriod;
    } else {
      this.periodForm.patchValue({
        ...form.getRawValue(),
        start_date_period: this.startDate,
      });
      this._notificationService.warn(
        'La fecha inicial tiene que ser menor que la final'
      );
    }
  }
  /**
   * changeEndDatePeriod
   * isBefore, isSame, and isAfter of moment
   * @param form
   */
  changeEndDatePeriod(form: any) {
    let endDatePeriod = form.getRawValue().end_date_period;

    var isAfter = moment(endDatePeriod).isAfter(this.startDate);

    if (isAfter) {
      this.endDate = endDatePeriod;
    } else {
      this.periodForm.patchValue({
        ...form.getRawValue(),
        end_date_period: this.endDate,
      });
      this._notificationService.warn(
        'La fecha final tiene que ser mayor que la inicial'
      );
    }
  }
}
