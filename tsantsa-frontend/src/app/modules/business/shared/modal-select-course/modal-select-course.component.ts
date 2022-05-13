import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { CourseService } from '../../course/course.service';
import { Course } from '../../course/course.types';
import { ModalSelectCourseService } from './modal-select-course.service';

@Component({
  selector: 'app-modal-select-course',
  templateUrl: './modal-select-course.component.html',
})
export class ModalSelectCourseComponent implements OnInit {
  id_course: string = '';

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  categoriesCourse: Course[] = [];
  selectCourseForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any, 
    private _formBuilder: FormBuilder,  
    private _courseService: CourseService,  
    private _modalSelectCourseService: ModalSelectCourseService 
  ) {}

  ngOnInit(): void {
    /**
     * get courses
     */
    this._courseService
      .readAllCourse()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_courses: Course[]) => {
        this.categoriesCourse = _courses;
      });
    /**
     * form
     */
    this.selectCourseForm = this._formBuilder.group({
      id_course: ['', [Validators.required]],
    });
  }
  /**
   * patchForm
   */
  patchForm(): void {
    this.selectCourseForm.patchValue({
      id_course: this.selectCourseForm.getRawValue().id_course,
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
    this.id_course = this.selectCourseForm.getRawValue().id_course;
  }
  /**
   * closeModalSelectCourse
   */
  closeModalSelectCourse(): void {
    this._modalSelectCourseService.closeModalSelectCourse();
  }
}
