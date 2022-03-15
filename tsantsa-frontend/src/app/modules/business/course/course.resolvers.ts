import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CourseService } from './course.service';
import { Course } from './course.types';

@Injectable({
  providedIn: 'root',
})
export class CourseResolver implements Resolve<any> {
  /**
   * Constructor
   */
  constructor(private _courseService: CourseService, private _router: Router) {}

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
  ): Observable<Course> {
    return this._courseService
      .readCourseByIdLocal(route.paramMap.get('id')!)
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
