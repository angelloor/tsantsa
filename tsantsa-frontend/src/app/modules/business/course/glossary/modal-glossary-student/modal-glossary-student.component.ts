import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppInitialData } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { Subject, takeUntil } from 'rxjs';
import { course } from '../../course.data';
import { CourseService } from '../../course.service';
import { Course } from '../../course.types';
import { GlossaryService } from '../glossary.service';
import { Glossary } from '../glossary.types';
import { ModalGlossaryStudentService } from './modal-glossary-student.service';

@Component({
  selector: 'app-modal-glossary-student',
  templateUrl: './modal-glossary-student.component.html',
})
export class ModalGlossaryStudentComponent implements OnInit {
  id_glosary: string = '';

  categoriesCourse: Course[] = [];
  selectedCourse: Course = course;

  nameEntity: string = 'Glosario';
  private data!: AppInitialData;

  userId: string = '';

  glossary!: Glossary;
  glossaryForm!: FormGroup;
  private glossarys!: Glossary[];

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
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _store: Store<{ global: AppInitialData }>,
    private _changeDetectorRef: ChangeDetectorRef,
    private _glossaryService: GlossaryService,
    private _formBuilder: FormBuilder,
    private _layoutService: LayoutService,
    private _courseService: CourseService,
    private _modalGlossaryStudentService: ModalGlossaryStudentService
  ) {}

  /** ----------------------------------------------------------------------------------------------------- */
  /** @ Lifecycle hooks
	  /** ----------------------------------------------------------------------------------------------------- */

  /**
   * On init
   */
  ngOnInit(): void {
    this.id_glosary = this._data.id_glosary;
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
     * Create the glossary form
     */
    this.glossaryForm = this._formBuilder.group({
      id_glossary: [''],
      id_course: [''],
      term_glossary: ['', [Validators.required, Validators.maxLength(100)]],
      concept_glossary: ['', [Validators.required, Validators.maxLength(500)]],
      date_glossary: ['', [Validators.required]],
    });
    /**
     * Get the glossarys
     */
    this._glossaryService
      .readGlossaryByIdLocal(this.id_glosary)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe();
    /**
    /**
     * Get the glossarys
     */
    this._glossaryService.glossarys$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((glossarys: Glossary[]) => {
        this.glossarys = glossarys;
        /**
         * Mark for check
         */
        this._changeDetectorRef.markForCheck();
      });
    /**
     * Get the glossary
     */
    this._glossaryService.glossary$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((glossary: Glossary) => {
        /**
         * Get the glossary
         */
        this.glossary = glossary;

        // Course
        this._courseService
          .readAllCourse()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((courses: Course[]) => {
            this.categoriesCourse = courses;

            this.selectedCourse = this.categoriesCourse.find(
              (item) =>
                item.id_course == this.glossary.course.id_course.toString()
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
    this.glossaryForm.patchValue({
      ...this.glossary,
      id_course: this.glossary.course.id_course,
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
   * closeModalGlossaryStudent
   */
  closeModalGlossaryStudent(): void {
    this._modalGlossaryStudentService.closeModalGlossaryStudent();
  }
}
