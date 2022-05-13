import { AngelAlertType } from '@angel/components/alert';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData } from 'app/core/app/app.type';
import { AuthService } from 'app/core/auth/auth.service';
import { LayoutService } from 'app/layout/layout.service';
import moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { EnrollmentService } from '../enrollment.service';
import { Enrollment } from '../enrollment.types';

@Component({
  selector: 'enrollment-list',
  templateUrl: './list.component.html',
})
export class EnrollmentListComponent implements OnInit {
  count: number = 0;
  enrollments$!: Observable<Enrollment[]>;

  private data!: AppInitialData;

  searchInputControl: FormControl = new FormControl();
  selectedEnrollment!: Enrollment;

  /**
   * Alert
   */
  alert: { type: AngelAlertType; message: string } = {
    type: 'info',
    message: '',
  };
  /**
   * Alert
   */

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
    private _enrollmentService: EnrollmentService,
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
     * Get the enrollments
     */
    this.enrollments$ = this._enrollmentService.enrollments$;
    /**
     *  Count Subscribe and readAll
     */
    this._enrollmentService
      .byUserRead(this.data.user.id_user)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((enrollments: Enrollment[]) => {
        /**
         * Update the counts
         */
        this.count = enrollments.length;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     *  Count Subscribe
     */
    this._enrollmentService.enrollments$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((enrollments: Enrollment[]) => {
        /**
         * Update the counts
         */
        this.count = enrollments.length;
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
          return this._enrollmentService.readEnrollmentByQuery(
            query.toLowerCase()
          );
        })
      )
      .subscribe();
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
   * Go to Mis cursos
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
     * Go to Mis cursos
     */
    this._router.navigate(['./', id], {
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
   * Format the given ISO_8601 date as a relative date
   * @param date
   */
  formatDateAsRelative(date: string): string {
    return moment(date, moment.ISO_8601).locale('es').fromNow();
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
