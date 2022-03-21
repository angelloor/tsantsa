import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'app/modules/core/user/user.service';
import { User } from 'app/modules/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';
import { CourseService } from '../../course/course.service';
import { Course } from '../../course/course.types';
import { ModalSelectUserCourseService } from './modal-select-user-course.service';

@Component({
  selector: 'app-modal-select-user-course',
  templateUrl: './modal-select-user-course.component.html',
})
export class ModalSelectUserCourseComponent implements OnInit {
  data = {
    id_user: '',
    id_course: '',
  };

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  categoriesUser: User[] = [];
  categoriesCourse: Course[] = [];
  selectCourseForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    private _courseService: CourseService,
    private _modalSelectUserCourseService: ModalSelectUserCourseService
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
     * form
     */
    this.selectCourseForm = this._formBuilder.group({
      id_user: ['', [Validators.required]],
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
    this.data.id_user = this.selectCourseForm.getRawValue().id_user;
    this.data.id_course = this.selectCourseForm.getRawValue().id_course;
  }
  /**
   * closeModalSelectUserCourse
   */
  closeModalSelectUserCourse(): void {
    this._modalSelectUserCourseService.closeModalSelectUserCourse();
  }
}
