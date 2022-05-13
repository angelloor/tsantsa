import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Store } from '@ngrx/store';
import { AppInitialData } from 'app/core/app/app.type';
import { Subject, takeUntil } from 'rxjs';
import { user } from '../../user/user.data';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.types';
import { SystemEventListComponent } from '../list/list.component';
import { SystemEventService } from '../system-event.service';
import { SystemEvent } from '../system-event.types';

@Component({
  selector: 'system-event-details',
  templateUrl: './details.component.html',
  animations: angelAnimations,
})
export class SystemEventDetailsComponent implements OnInit {
  categoriesUser: User[] = [];
  selectedUser: User = user;

  nameEntity: string = 'Evento del sistema';
  private data!: AppInitialData;

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
  systemEvent!: SystemEvent;
  systemEventForm!: FormGroup;

  private _tagsPanelOverlayRef!: OverlayRef;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  /**
   * Constructor
   */
  constructor(
    private _store: Store<{ global: AppInitialData }>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemEventListComponent: SystemEventListComponent,
    private _systemEventService: SystemEventService,
    private _formBuilder: FormBuilder,
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
     * Subscribe to user changes of state
     */
    this._store.pipe(takeUntil(this._unsubscribeAll)).subscribe((state) => {
      this.data = state.global;
    });
    /**
     * Open the drawer
     */
    this._systemEventListComponent.matDrawer.open();
    /**
     * Create the systemEvent form
     */
    this.systemEventForm = this._formBuilder.group({
      id_system_event: [''],
      id_user: ['', [Validators.required]],
      table_system_event: ['', [Validators.required, Validators.maxLength(50)]],
      row_system_event: ['', [Validators.required, Validators.maxLength(10)]],
      action_system_event: [
        '',
        [Validators.required, Validators.maxLength(50)],
      ],
      date_system_event: ['', [Validators.required]],
    });
    /**
     * Get the systemEvents
     */
    this._systemEventService.systemEvents$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((systemEvents: SystemEvent[]) => {
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the systemEvent
     */
    this._systemEventService.systemEvent$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((systemEvent: SystemEvent) => {
        /**
         * Open the drawer in case it is closed
         */
        this._systemEventListComponent.matDrawer.open();
        /**
         * Get the systemEvent
         */
        this.systemEvent = systemEvent;

        // User
        this._userService
          .readAllUser()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((users: User[]) => {
            this.categoriesUser = users;

            this.selectedUser = this.categoriesUser.find(
              (item) => item.id_user == this.systemEvent.user.id_user.toString()
            )!;
          });

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
    this.systemEventForm.patchValue(this.systemEvent);
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
    return this._systemEventListComponent.matDrawer.close();
  }
}
