import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TaskService } from './task.service';
import { Task } from './task.types';

@Injectable({
  providedIn: 'root',
})
export class TaskResolver implements Resolve<any> {
  /**
   * Constructor
   */
  constructor(private _taskService: TaskService, private _router: Router) {}

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
  ): Observable<Task> {
    return this._taskService.readTaskByIdLocal(route.paramMap.get('id')!).pipe(
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
