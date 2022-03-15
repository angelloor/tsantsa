import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EnrollmentService } from './enrollment.service';
import { Enrollment } from './enrollment.types';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentResolver implements Resolve<any> {
  /**
   * Constructor
   */
  constructor(
    private _enrollmentService: EnrollmentService,
    private _router: Router
  ) {}

  /** ----------------------------------------------------------------------------------------------------- */
  /** @ Public methods
   /** ----------------------------------------------------------------------------------------------------- */

  /**
   * Resolver
   * @param route
   * @param state
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Enrollment> {
    return this._enrollmentService
      .readEnrollmentByIdLocal(route.paramMap.get('id')!)
      .pipe(
        /**
         * Error here means the requested is not available
         */
        catchError((error) => {
          /**
           * Log the error
           */
          // console.error(error);
          /**
           * Get the parent url
           */
          const parentUrl = state.url.split('/').slice(0, -1).join('/');
          /**
           * Navigate to there
           */
          this._router.navigateByUrl(parentUrl);
          /**
           * Throw an error
           */
          return throwError(() => error);
        })
      );
  }
}
