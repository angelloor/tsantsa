import {
  ActionAngelConfirmation,
  AngelConfirmationService,
} from '@angel/services/confirmation';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { AuthService } from 'app/core/auth/auth.service';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { environment } from 'environments/environment';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssistanceService } from '../../assistance/assistance.service';
import { Assistance } from '../../assistance/assistance.types';
import { ModalAssistancesService } from './modal-assistances.service';

@Component({
  selector: 'app-modal-assistances',
  templateUrl: './modal-assistances.component.html',
})
export class ModalAssistancesComponent implements OnInit {
  _urlPathAvatar: string = environment.urlBackend + '/resource/img/avatar/';

  id_course: string = '';

  count: number = 0;
  assistances$!: Observable<Assistance[]>;

  private data!: AppInitialData;

  assistancesForm!: FormGroup;
  assistances: Assistance[] = [];

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  /**
   * isOpenModal
   */
  isOpenModal: boolean = false;
  /**
   * isOpenModal
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _store: Store<{ global: AppInitialData }>,
    private _changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private _document: any,
    private _assistanceService: AssistanceService,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _authService: AuthService,
    private _modalAssistancesService: ModalAssistancesService
  ) {}

  ngOnInit(): void {
    this.id_course = this._data.id_course;
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
    this.assistancesForm = this._formBuilder.group({
      lotAssistances: this._formBuilder.array([]),
    });

    /**
     * byUserAndCourseRead
     */
    this._assistanceService
      .byUserAndCourseRead(this.data.user.id_user, this.id_course)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe();
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
      .subscribe((_assistances: Assistance[]) => {
        this.assistances = _assistances;
        /**
         * Clear the lotAssistances form arrays
         */
        (this.assistancesForm.get('lotAssistances') as FormArray).clear();

        const lotAssistanceFormGroups: any = [];
        /**
         * Iterate through them
         */

        this.assistances.forEach((_assistance) => {
          /**
           * Create an elemento form group
           */
          lotAssistanceFormGroups.push(
            this._formBuilder.group({
              id_assistance: _assistance.id_assistance,
              user: _assistance.user,
              course: _assistance.course,
              start_marking_date: [
                {
                  value: _assistance.start_marking_date,
                  disabled: true,
                },
              ],
              end_marking_date: [
                {
                  value: _assistance.end_marking_date,
                  disabled: true,
                },
              ],
              is_late: _assistance.is_late,
            })
          );
        });
        /**
         * Add the elemento form groups to the elemento form array
         */
        lotAssistanceFormGroups.forEach((lotAssistanceFormGroup: any) => {
          (this.assistancesForm.get('lotAssistances') as FormArray).push(
            lotAssistanceFormGroup
          );
        });

        /**
         * Update the counts
         */
        this.count = this.assistances.length;
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
  }

  get formArrayAssistances(): FormArray {
    return this.assistancesForm.get('lotAssistances') as FormArray;
  }

  getFromControl(
    formArray: FormArray,
    index: number,
    control: string
  ): FormControl {
    return formArray.controls[index].get(control) as FormControl;
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
   * Create Mis asistencias
   */
  createAssistance(): void {
    this._angelConfirmationService
      .open({
        title: 'Añadir mis asistencias',
        message:
          '¿Estás seguro de que deseas añadir una nueva mis asistencias? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          const id_user_ = this.data.user.id_user;
          /**
           * Create the mis asistencias
           */
          this._assistanceService
            .createAssistance(id_user_)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (_assistance: Assistance) => {
                if (_assistance) {
                  this._notificationService.success(
                    'Mis asistencias agregada correctamente'
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
  /**
   * closeModalAssistances
   */
  closeModalAssistances(): void {
    this._modalAssistancesService.closeModalAssistances();
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
