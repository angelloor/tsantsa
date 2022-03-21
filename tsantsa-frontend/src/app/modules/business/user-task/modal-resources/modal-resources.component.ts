import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ResourceService } from '../../task/resource/resource.service';
import { Resource } from '../../task/resource/resource.types';
import { ModalResourcesService } from './modal-resources.service';

@Component({
  selector: 'app-modal-resources',
  templateUrl: './modal-resources.component.html',
  animations: angelAnimations,
})
export class ModalResourcesComponent implements OnInit {
  id_task: string = '';
  /**
   * Alert
   */
  alert: { type: AngelAlertType; message: string } = {
    type: 'error',
    message: '',
  };
  /**
   * Alert
   */
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  resourcesForm!: FormGroup;
  resources: Resource[] = [];
  /**
   * isOpenModal
   */
  isOpenModal: boolean = false;
  /**
   * isOpenModal
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _resourceService: ResourceService,
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _modalResourcesService: ModalResourcesService
  ) {}

  ngOnInit(): void {
    this.id_task = this._data.id_task;
    /**
     * checkSession
     */
    this._authService
      .checkSession()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe();
    /**
     * checkSession
     */

    this.resourcesForm = this._formBuilder.group({
      lotResources: this._formBuilder.array([]),
    });

    /**
     * byUserAndCourseRead
     */
    this._resourceService
      .byTaskRead(this.id_task)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe();
    /**
     * Get the resources
     */
    /**
     *  Count Subscribe and readAll
     */
    this._resourceService.resources$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_resources: Resource[]) => {
        this.resources = _resources;
        /**
         * Clear the lotResources form arrays
         */
        (this.resourcesForm.get('lotResources') as FormArray).clear();

        const lotResourceFormGroups: any = [];
        /**
         * Iterate through them
         */

        this.resources.forEach((_resource) => {
          /**
           * Create an elemento form group
           */
          lotResourceFormGroups.push(
            this._formBuilder.group({
              id_resource: _resource.id_resource,
              task: _resource.task,
              name_resource: _resource.name_resource,
              description_resource: _resource.description_resource,
              link_resource: _resource.link_resource,
            })
          );
        });
        /**
         * Add the elemento form groups to the elemento form array
         */
        lotResourceFormGroups.forEach((lotResourceFormGroup: any) => {
          (this.resourcesForm.get('lotResources') as FormArray).push(
            lotResourceFormGroup
          );
        });
      });
  }

  get formArrayResources(): FormArray {
    return this.resourcesForm.get('lotResources') as FormArray;
  }

  getFromControl(
    formArray: FormArray,
    index: number,
    control: string
  ): FormControl {
    return formArray.controls[index].get(control) as FormControl;
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

  closeModalResources(): void {
    this._modalResourcesService.closeModalResources();
  }
  /**
   * openResource
   * @param link_resource
   */
  openResource(link_resource: string) {
    window.open(link_resource, '_blank');
  }
  /**
   * Track by function for ngFor loops
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
