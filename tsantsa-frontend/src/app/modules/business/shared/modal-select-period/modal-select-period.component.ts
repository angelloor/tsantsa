import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { PeriodService } from '../../period/period.service';
import { Period } from '../../period/period.types';
import { ModalSelectPeriodService } from './modal-select-period.service';

@Component({
  selector: 'app-modal-select-period',
  templateUrl: './modal-select-period.component.html',
})
export class ModalSelectPeriodComponent implements OnInit {
  id_period: string = '';

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  categoriesPeriod: Period[] = [];
  selectPeriodForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _formBuilder: FormBuilder,
    private _periodService: PeriodService,
    private _modalSelectPeriodService: ModalSelectPeriodService
  ) {}

  ngOnInit(): void {
    /**
     * get periods
     */
    this._periodService
      .readAllPeriod()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_periods: Period[]) => {
        this.categoriesPeriod = _periods;
      });
    /**
     * form
     */
    this.selectPeriodForm = this._formBuilder.group({
      id_period: ['', [Validators.required]],
    });
  }
  /**
   * patchForm
   */
  patchForm(): void {
    this.selectPeriodForm.patchValue({
      id_period: this.selectPeriodForm.getRawValue().id_period,
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
  /**
   * changeSelect
   */
  changeSelect(): void {
    this.id_period = this.selectPeriodForm.getRawValue().id_period;
  }
  /**
   * closeModalSelectPeriod
   */
  closeModalSelectPeriod(): void {
    this._modalSelectPeriodService.closeModalSelectPeriod();
  }
}
