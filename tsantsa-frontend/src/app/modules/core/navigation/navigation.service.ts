import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import {
  BehaviorSubject,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import { navigation, navigations } from './navigation.data';
import { Navigation } from './navigation.types';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _navigation: BehaviorSubject<Navigation> = new BehaviorSubject(
    navigation
  );
  private _navigations: BehaviorSubject<Navigation[]> = new BehaviorSubject(
    navigations
  );

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/core/navigation';
  }
  /**
   * Getter
   */
  get navigation$(): Observable<Navigation> {
    return this._navigation.asObservable();
  }
  /**
   * Getter for _navigations
   */
  get navigations$(): Observable<Navigation[]> {
    return this._navigations.asObservable();
  }
  /**
   * Create function
   */
  createNavigation(id_user_: string): Observable<any> {
    return this._navigations.pipe(
      take(1),
      switchMap((navigations) =>
        this._httpClient
          .post(
            this._url + '/create',
            {
              id_user_: parseInt(id_user_),
            },
            {
              headers: this._headers,
            }
          )
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _navigation: Navigation = response.body;
              /**
               * Update the navigation in the store
               */
              this._navigations.next([_navigation, ...navigations]);

              return of(_navigation);
            })
          )
      )
    );
  }
  /**
   * Read All Navigation
   */
  readAllNavigation(): Observable<Navigation[]> {
    return this._httpClient
      .get<Navigation[]>(this._url + '/read/query-all')
      .pipe(
        tap((navigations: Navigation[]) => {
          this._navigations.next(navigations);
        })
      );
  }
  /**
   * Read Navigation by query
   * @param query
   */
  readNavigationByQuery(query: string): Observable<Navigation[]> {
    return this._httpClient
      .get<Navigation[]>(
        this._url + `/read/${query != '' ? query : 'query-all'}`
      )
      .pipe(
        tap((navigations: Navigation[]) => {
          this._navigations.next(navigations);
        })
      );
  }
  /**
   * Read Navigation by id
   * @param idNavigation
   */
  readNavigationById(idNavigation: string): Observable<Navigation> {
    return this._httpClient
      .get<Navigation>(this._url + `/specificRead/${idNavigation}`)
      .pipe(
        tap((navigations: Navigation) => {
          return navigations;
        })
      );
  }
  /**
   * Read Navigation by id of local Observable
   */
  readNavigationByIdLocal(id: string): Observable<Navigation> {
    return this._navigations.pipe(
      take(1),
      map((navigations) => {
        /**
         * Find
         */
        const navigation =
          navigations.find((item) => item.id_navigation == id) || null;
        /**
         * Update
         */
        this._navigation.next(navigation!);
        /**
         * Return
         */
        return navigation;
      }),
      switchMap((navigation) => {
        if (!navigation) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(navigation);
      })
    );
  }
  /**
   * Update navigation
   * @param id_user_ that will be updated
   * @param navigation
   */
  updateNavigation(navigation: Navigation): Observable<any> {
    return this.navigations$.pipe(
      take(1),
      switchMap((navigations) =>
        this._httpClient
          .patch(this._url + '/update', navigation, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _navigation: Navigation = response.body;
              /**
               * Find the index of the updated navigation
               */
              const index = navigations.findIndex(
                (item) => item.id_navigation == navigation.id_navigation
              );
              /**
               * Update the navigation
               */
              navigations[index] = _navigation;
              /**
               * Update the navigations
               */
              this._navigations.next(navigations);

              /**
               * Update the navigation
               */
              this._navigation.next(_navigation);

              return of(_navigation);
            })
          )
      )
    );
  }
  /**
   * Delete the navigation
   * @param id
   */
  deleteNavigation(id_user_: string, id_navigation: string): Observable<any> {
    return this.navigations$.pipe(
      take(1),
      switchMap((navigations) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_navigation },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated navigation
                 */
                const index = navigations.findIndex(
                  (item) => item.id_navigation == id_navigation
                );
                /**
                 * Delete the object of array
                 */
                navigations.splice(index, 1);
                /**
                 * Update the navigations
                 */
                this._navigations.next(navigations);
                return of(response.body);
              } else {
                return of(false);
              }
            })
          )
      )
    );
  }
}
