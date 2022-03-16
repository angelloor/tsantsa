import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ModalAssistanceComponent } from './modal-assistance/modal-assistance.component';

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateAssistanceDetails
  implements CanDeactivate<ModalAssistanceComponent>
{
  canDeactivate(
    component: ModalAssistanceComponent,
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
     * If the next state doesn't contain '/assistance'
     * it means we are navigating away from the
     * assistance app
     */
    if (!nextState.url.includes('/assistance')) {
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
