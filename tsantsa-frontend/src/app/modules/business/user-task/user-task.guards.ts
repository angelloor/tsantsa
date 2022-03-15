import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ModalUserTaskComponent } from './modal-user-task/modal-user-task.component';

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateUserTaskDetails
  implements CanDeactivate<ModalUserTaskComponent>
{
  canDeactivate(
    component: ModalUserTaskComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    /**
     * Get the next route
     */
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) {
      nextRoute = nextRoute.firstChild;
    }
    /**
     * If the next state doesn't contain '/user-task'
     * it means we are navigating away from the
     * user_task app
     */
    if (!nextState.url.includes('/user-task')) {
      /**
       * Let it navigate
       */
      return true;
    }
    /**
     * If we are navigating to another
     */
    if (nextRoute.paramMap.get('id')) {
      /**
       * Just navigate
       */
      return true;
    } else {
      return true;
    }
  }
}
