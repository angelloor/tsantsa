import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ModalEnrollmentComponent } from './modal-enrollment/modal-enrollment.component';

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateEnrollmentDetails
  implements CanDeactivate<ModalEnrollmentComponent>
{
  canDeactivate(
    component: ModalEnrollmentComponent,
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
     * If the next state doesn't contain '/enrollment'
     * it means we are navigating away from the
     * enrollment app
     */
    if (!nextState.url.includes('/enrollment')) {
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
