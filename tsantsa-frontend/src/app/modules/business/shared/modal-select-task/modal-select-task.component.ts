import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { TaskService } from '../../task/task.service';
import { Task } from '../../task/task.types';
import { ModalSelectTaskService } from './modal-select-task.service';

@Component({
  selector: 'app-modal-select-task',
  templateUrl: './modal-select-task.component.html',
})
export class ModalSelectTaskComponent implements OnInit {
  id_task: string = '';

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  categoriesTask: Task[] = [];
  selectTaskForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _formBuilder: FormBuilder,
    private _taskService: TaskService,
    private _modalSelectTaskService: ModalSelectTaskService
  ) {}

  ngOnInit(): void {
    /**
     * get tasks
     */
    this._taskService
      .readAllTask()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_tasks: Task[]) => {
        this.categoriesTask = _tasks;
      });
    /**
     * form
     */
    this.selectTaskForm = this._formBuilder.group({
      id_task: ['', [Validators.required]],
    });
  }
  /**
   * patchForm
   */
  patchForm(): void {
    this.selectTaskForm.patchValue({
      id_task: this.selectTaskForm.getRawValue().id_task,
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
    this.id_task = this.selectTaskForm.getRawValue().id_task;
  }
  /**
   * closeModalSelectTask
   */
  closeModalSelectTask(): void {
    this._modalSelectTaskService.closeModalSelectTask();
  }
}
