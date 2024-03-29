import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.types';
import { ModalSelectUserService } from './modal-select-user.service';

@Component({
  selector: 'app-modal-select-user',
  templateUrl: './modal-select-user.component.html',
})
export class ModalSelectUserComponent implements OnInit {
  id_user: string = '';

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  categoriesUser: User[] = [];
  selectUserForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    private _modalSelectUserService: ModalSelectUserService
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
     * form
     */
    this.selectUserForm = this._formBuilder.group({
      id_user: ['', [Validators.required]],
    });
  }
  /**
   * patchForm
   */
  patchForm(): void {
    this.selectUserForm.patchValue({
      id_user: this.selectUserForm.getRawValue().id_user,
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
    this.id_user = this.selectUserForm.getRawValue().id_user;
  }
  /**
   * closeModalSelectUser
   */
  closeModalSelectUser(): void {
    this._modalSelectUserService.closeModalSelectUser();
  }
}
