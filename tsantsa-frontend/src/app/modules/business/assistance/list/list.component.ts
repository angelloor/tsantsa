import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData } from 'app/core/app/app.type';
import { AuthService } from 'app/core/auth/auth.service';
import { LayoutService } from 'app/layout/layout.service';
import { LocalDatePipe } from 'app/shared/pipes/local-date.pipe';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { AssistanceService } from '../assistance.service';
import { Assistance } from '../assistance.types';

@Component({
  selector: 'assistance-list',
  templateUrl: './list.component.html',
  providers: [LocalDatePipe],
})
export class AssistanceListComponent implements OnInit {
  count: number = 0;
  assistances$!: Observable<Assistance[]>;

  private data!: AppInitialData;

  searchInputControl: FormControl = new FormControl();
  selectedAssistance!: Assistance;

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
    private _assistanceService: AssistanceService,
    private _layoutService: LayoutService,
    private _localDatePipe: LocalDatePipe,
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
     * Get the assistances
     */
    this.assistances$ = this._assistanceService.assistances$;
    /**
     *  Count Subscribe and readAll
     */
    this._assistanceService
      .byUserRead(this.data.user.id_user)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((assistances: Assistance[]) => {
        /**
         * Update the counts
         */
        this.count = assistances.length;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     *  Count Subscribe
     */
    this._assistanceService.assistances$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((assistances: Assistance[]) => {
        /**
         * Update the counts
         */
        this.count = assistances.length;
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
          return this._assistanceService.readAssistanceByQuery(
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
   * parseDate
   * @param date
   * @returns
   */
  parseDate(date: string, format: string): string {
    return this._localDatePipe.transform(date, format);
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
