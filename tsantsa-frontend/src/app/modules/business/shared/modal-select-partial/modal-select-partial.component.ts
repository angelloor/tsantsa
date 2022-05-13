import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { PartialService } from '../../period/quimester/partial/partial.service';
import { Partial } from '../../period/quimester/partial/partial.types';
import { ModalSelectPartialService } from './modal-select-partial.service';

@Component({
  selector: 'app-modal-select-partial',
  templateUrl: './modal-select-partial.component.html',
})
export class ModalSelectPartialComponent implements OnInit {
  id_partial: string = '';

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  categoriesPartial: Partial[] = [];
  selectPartialForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _formBuilder: FormBuilder,
    private _partialService: PartialService,
    private _modalSelectPartialService: ModalSelectPartialService
  ) {}

  ngOnInit(): void {
    /**
     * get partials
     */
    this._partialService
      .readAllPartial()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_partials: Partial[]) => {
        this.categoriesPartial = _partials;
      });
    /**
     * form
     */
    this.selectPartialForm = this._formBuilder.group({
      id_partial: ['', [Validators.required]],
    });
  }
  /**
   * patchForm
   */
  patchForm(): void {
    this.selectPartialForm.patchValue({
      id_partial: this.selectPartialForm.getRawValue().id_partial,
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
    this.id_partial = this.selectPartialForm.getRawValue().id_partial;
  }
  /**
   * closeModalSelectPartial
   */
  closeModalSelectPartial(): void {
    this._modalSelectPartialService.closeModalSelectPartial();
  }
}
