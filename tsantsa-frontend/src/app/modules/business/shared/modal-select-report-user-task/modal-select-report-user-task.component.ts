import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'app/modules/core/user/user.service';
import { User } from 'app/modules/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';
import { CourseService } from '../../course/course.service';
import { Course } from '../../course/course.types';
import { PartialService } from '../../period/quimester/partial/partial.service';
import { Partial } from '../../period/quimester/partial/partial.types';
import { ModalSelectReportUserTaskService } from './modal-select-report-user-task.service';

@Component({
  selector: 'app-modal-select-report-user-task',
  templateUrl: './modal-select-report-user-task.component.html',
})
export class ModalSelectReportUserTaskComponent implements OnInit {
  data = {
    id_user: '',
    id_course: '',
    id_partial: '',
  };

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  categoriesUser: User[] = [];
  categoriesCourse: Course[] = [];
  categoriesPartial: Partial[] = [];
  selectCourseForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    private _courseService: CourseService,
    private _partialService: PartialService,
    private _modalSelectReportUserTaskService: ModalSelectReportUserTaskService
  ) {}

  ngOnInit(): void {
    /**
     * get users
     */
    this._userService
      .readAllUser()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_users: User[]) => {
        this.categoriesUser = _users;
      });
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
     * get courses
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
    this.selectCourseForm = this._formBuilder.group({
      id_user: ['', [Validators.required]],
      id_course: ['', [Validators.required]],
      id_partial: ['', [Validators.required]],
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
    this.data.id_user = this.selectCourseForm.getRawValue().id_user;
    this.data.id_course = this.selectCourseForm.getRawValue().id_course;
    this.data.id_partial = this.selectCourseForm.getRawValue().id_partial;
  }
  /**
   * closeModalSelectReportUserTask
   */
  closeModalSelectReportUserTask(): void {
    this._modalSelectReportUserTaskService.closeModalSelectReportUserTask();
  }
}
