import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ModalTaskComponent } from './modal-task/modal-task.component';

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateTaskDetails
  implements CanDeactivate<ModalTaskComponent>
{
  canDeactivate(
    component: ModalTaskComponent,
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
     * If the next state doesn't contain '/task'
     * it means we are navigating away from the
     * task app
     */
    if (!nextState.url.includes('/task')) {
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
