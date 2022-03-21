import {
  ActionAngelConfirmation,
  AngelConfirmationService,
} from '@angel/services/confirmation';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { AuthService } from 'app/core/auth/auth.service';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { LocalDatePipe } from 'app/shared/pipes/local-date.pipe';
import { environment } from 'environments/environment';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssistanceService } from '../../assistance/assistance.service';
import { Assistance } from '../../assistance/assistance.types';
import { ModalAssistancesService } from './modal-assistances.service';

@Component({
  selector: 'app-modal-assistances',
  templateUrl: './modal-assistances.component.html',
  providers: [LocalDatePipe],
})
export class ModalAssistancesComponent implements OnInit {
  _urlPathAvatar: string = environment.urlBackend + '/resource/img/avatar/';
  id_course: string = '';

  private data!: AppInitialData;
  _isMarkedToday: boolean = false;

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
    private _assistanceService: AssistanceService,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _authService: AuthService,
    private _localDatePipe: LocalDatePipe,
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
    /**
     *  Count Subscribe and readAll
     */
    this._assistanceService.assistances$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_assistances: Assistance[]) => {
        this.assistances = _assistances;

        this._isMarkedToday = this.isMarkedToday(this.assistances);
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
              date: _assistance.start_marking_date,
              start_marking_date: [
                {
                  value: this.parseTime(_assistance.start_marking_date),
                  disabled: true,
                },
              ],
              end_marking_date: [
                {
                  value: this.parseTime(_assistance.end_marking_date),
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
        title: 'Marcar entrada',
        message:
          '¿Estás seguro de que deseas marcar tu entrada? ¡Esta acción no se puede deshacer!',
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
            .createAssistance(id_user_, this.id_course)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (_assistance: Assistance) => {
                if (_assistance) {
                  this._notificationService.success(
                    'Marcación de entrada registrada'
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
   * Update the assistance
   */
  updateAssistance(index: number): void {
    this._angelConfirmationService
      .open({
        title: 'Marcar salida',
        message:
          '¿Estás seguro de que deseas marcar tu salida? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the assistance
           */
          const id_user_ = this.data.user.id_user;

          const elementAssistanceFormArray = this.assistancesForm.get(
            'lotAssistances'
          ) as FormArray;

          let _assistance = elementAssistanceFormArray.getRawValue()[index];

          /**
           * Delete whitespace (trim() the atributes type string)
           */
          _assistance = {
            ..._assistance,
            id_user_: parseInt(id_user_),
            id_assistance: parseInt(_assistance.id_assistance),
            user: {
              id_user: parseInt(_assistance.user.id_user),
            },
            course: {
              id_course: parseInt(_assistance.course.id_course),
            },
            start_marking_date: this.getNowDateWithTime(
              _assistance.start_marking_date,
              _assistance.date
            ),
            end_marking_date: null,
          };

          /**
           * Update
           */
          this._assistanceService
            .updateAssistance(_assistance)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (_assistance: Assistance) => {
                if (_assistance) {
                  this._notificationService.success(
                    'Marcación de salida registrada'
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
      });
  }
  /**
   * closeModalAssistances
   */
  closeModalAssistances(): void {
    this._modalAssistancesService.closeModalAssistances();
  }
  /**
   * getNowDateWithTime
   * @param time
   * @param _date
   * @returns
   */
  getNowDateWithTime = (time: string, _date: string) => {
    const date = new Date(_date);
    return `${date.getFullYear()}-${
      date.getMonth() + 1 <= 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    }-${date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate()}T${time}`;
  };
  /**
   * @param date
   */
  parseTime(date: string) {
    return this._localDatePipe.transform(date, 'shortTime');
  }
  /**
   * Return dd/mm/yyyy
   */
  getDate = (stringDate: string) => {
    const date = new Date(stringDate);
    return {
      dia: date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate(),
      mes:
        date.getMonth() + 1 <= 9
          ? `0${date.getMonth() + 1}`
          : date.getMonth() + 1,
      periodo: date.getFullYear(),
    };
  };
  /**
   * Track by function for ngFor loops
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
  /**
   * isafter
   * @param secondDate
   */
  isafter(secondDate: any): boolean {
    const firstDate = new Date();

    const _secondDate = new Date(
      `${this.getDate(secondDate).periodo}-${this.getDate(secondDate).mes}-${
        this.getDate(secondDate).dia
      }T23:59:59`
    );

    var isafter = moment(firstDate).isAfter(_secondDate);
    if (isafter) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * isMarkedToday
   * @param _assistances
   * @returns
   */
  isMarkedToday(_assistances: Assistance[]): boolean {
    let isMarkedToday: boolean = false;

    _assistances.map((item) => {
      const firstDate = new Date(item.start_marking_date);
      const isSame = moment(firstDate).isSame(new Date(), 'day');

      if (isSame) {
        isMarkedToday = true;
      }
    });

    return isMarkedToday;
  }
}
