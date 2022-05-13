import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import {
  ActionAngelConfirmation,
  AngelConfirmationService,
} from '@angel/services/confirmation';
import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { LayoutService } from 'app/layout/layout.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { Subject, takeUntil } from 'rxjs';
import { course } from '../../course.data';
import { CourseService } from '../../course.service';
import { Course } from '../../course.types';
import { GlossaryService } from '../glossary.service';
import { Glossary } from '../glossary.types';
import { ModalGlossaryService } from './modal-glossary.service';

@Component({
  selector: 'app-modal-glossary',
  templateUrl: './modal-glossary.component.html',
  animations: angelAnimations,
})
export class ModalGlossaryComponent implements OnInit {
  id_glosary: string = '';

  categoriesCourse: Course[] = [];
  selectedCourse: Course = course;

  nameEntity: string = 'Glosario';
  private data!: AppInitialData;

  editMode: boolean = false;
  userId: string = '';
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
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
    private _layoutService: LayoutService,
    private _courseService: CourseService,
    private _modalGlossaryService: ModalGlossaryService
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
         * Toggle the edit mode off
         */
        this.toggleEditMode(false);
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
   * Update the glossary
   */
  updateGlossary(): void {
    /**
     * Get the glossary
     */
    const id_user_ = this.data.user.id_user;
    let glossary = this.glossaryForm.getRawValue();
    /**
     * Delete whitespace (trim() the atributes type string)
     */
    glossary = {
      ...glossary,
      id_user_: parseInt(id_user_),
      id_glossary: parseInt(glossary.id_glossary),
      course: {
        id_course: parseInt(glossary.id_course),
      },
    };
    /**
     * Update
     */
    this._glossaryService
      .updateGlossary(glossary)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (_glossary: Glossary) => {
          if (_glossary) {
            this._notificationService.success(
              'Glosario actualizada correctamente'
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
   * Delete the glossary
   */
  deleteGlossary(): void {
    this._angelConfirmationService
      .open({
        title: 'Eliminar glosario',
        message:
          '¿Estás seguro de que deseas eliminar esta glosario? ¡Esta acción no se puede deshacer!',
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          /**
           * Get the current glossary's id
           */
          const id_user_ = this.data.user.id_user;
          const id_glossary = this.glossary.id_glossary;
          /**
           * Get the next/previous glossary's id
           */
          const currentIndex = this.glossarys.findIndex(
            (item) => item.id_glossary === id_glossary
          );

          const nextIndex =
            currentIndex +
            (currentIndex === this.glossarys.length - 1 ? -1 : 1);
          const nextId =
            this.glossarys.length === 1 &&
            this.glossarys[0].id_glossary === id_glossary
              ? null
              : this.glossarys[nextIndex].id_glossary;
          /**
           * Delete the glossary
           */
          this._glossaryService
            .deleteGlossary(id_user_, id_glossary)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (response: boolean) => {
                if (response) {
                  /**
                   * Return if the glossary wasn't deleted_newsletter...
                   */
                  this._notificationService.success(
                    'Glosario eliminada correctamente'
                  );
                  /**
                   * Get the current activated route
                   */
                  let route = this._activatedRoute;
                  while (route.firstChild) {
                    route = route.firstChild;
                  }
                  /**
                   * Navigate to the next glossary if available
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
   * closeModalGlossary
   */
  closeModalGlossary(): void {
    this._modalGlossaryService.closeModalGlossary();
  }
}
