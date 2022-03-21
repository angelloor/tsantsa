import { AngelAlertType } from '@angel/components/alert';
import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { LocalDatePipe } from 'app/shared/pipes/local-date.pipe';
import { Subject, takeUntil } from 'rxjs';
import { AssistanceService } from '../../assistance.service';
import { Assistance } from '../../assistance.types';

@Component({
  selector: 'app-modal-assistance-details',
  templateUrl: './modal-assistance-details.component.html',
  providers: [LocalDatePipe],
})
export class ModalAssistanceDetailsComponent implements OnInit {
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
  assistance!: Assistance;
  assistanceForm!: FormGroup;

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
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _assistanceService: AssistanceService,
    private _matDialog: MatDialog,
    private _layoutService: LayoutService,
    private _localDatePipe: LocalDatePipe
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
     * Create the assistance form
     */
    this.assistanceForm = this._formBuilder.group({
      id_assistance: [''],
      user: ['', [Validators.required]],
      course: ['', [Validators.required]],
      start_marking_date: [''],
      end_marking_date: [''],
      is_late: ['', [Validators.required]],
    });
    /**
     * Get the assistances
     */
    this._assistanceService.assistance$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_assistance: Assistance) => {
        this.assistance = _assistance;

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
    this.assistanceForm.patchValue({
      ...this.assistance,
      start_marking_date: this.parseTime(this.assistance.start_marking_date),
      end_marking_date: this.parseTime(this.assistance.end_marking_date),
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
   * closeModalAssistance
   */
  closeModalAssistance(): void {
    this._matDialog.closeAll();
  }
  /**
   * @param date
   */
  parseTime(date: string) {
    return this._localDatePipe.transform(date, 'shortTime');
  }
}
