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
import { career, careers } from './career.data';
import { Career } from './career.types';

@Injectable({
  providedIn: 'root',
})
export class CareerService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _career: BehaviorSubject<Career> = new BehaviorSubject(career);
  private _careers: BehaviorSubject<Career[]> = new BehaviorSubject(careers);

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/career';
  }
  /**
   * Getter
   */
  get career$(): Observable<Career> {
    return this._career.asObservable();
  }
  /**
   * Getter for _careers
   */
  get careers$(): Observable<Career[]> {
    return this._careers.asObservable();
  }
  /**
   * Create function
   */
  createCareer(id_user_: string): Observable<any> {
    return this._careers.pipe(
      take(1),
      switchMap((careers) =>
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
              const _career: Career = response.body;
              /**
               * Update the career in the store
               */
              this._careers.next([_career, ...careers]);

              return of(_career);
            })
          )
      )
    );
  }
  /**
   * Read All Career
   */
  readAllCareer(): Observable<Career[]> {
    return this._httpClient.get<Career[]>(this._url + '/read/query-all').pipe(
      tap((careers: Career[]) => {
        this._careers.next(careers);
      })
    );
  }
  /**
   * Read Career by query
   * @param query
   */
  readCareerByQuery(query: string): Observable<Career[]> {
    return this._httpClient
      .get<Career[]>(this._url + `/read/${query != '' ? query : 'query-all'}`)
      .pipe(
        tap((careers: Career[]) => {
          this._careers.next(careers);
        })
      );
  }
  /**
   * Read Career by id
   * @param idCareer
   */
  readCareerById(idCareer: string): Observable<Career> {
    return this._httpClient
      .get<Career>(this._url + `/specificRead/${idCareer}`)
      .pipe(
        tap((careers: Career) => {
          return careers;
        })
      );
  }
  /**
   * Read Career by id of local Observable
   */
  readCareerByIdLocal(id: string): Observable<Career> {
    return this._careers.pipe(
      take(1),
      map((careers) => {
        /**
         * Find
         */
        const career = careers.find((item) => item.id_career == id) || null;
        /**
         * Update
         */
        this._career.next(career!);
        /**
         * Return
         */
        return career;
      }),
      switchMap((career) => {
        if (!career) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(career);
      })
    );
  }
  /**
   * Update career
   * @param id_user_ that will be updated
   * @param career
   */
  updateCareer(career: Career): Observable<any> {
    return this.careers$.pipe(
      take(1),
      switchMap((careers) =>
        this._httpClient
          .patch(this._url + '/update', career, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _career: Career = response.body;
              /**
               * Find the index of the updated career
               */
              const index = careers.findIndex(
                (item) => item.id_career == career.id_career
              );
              /**
               * Update the career
               */
              careers[index] = _career;
              /**
               * Update the careers
               */
              this._careers.next(careers);

              /**
               * Update the career
               */
              this._career.next(_career);

              return of(_career);
            })
          )
      )
    );
  }
  /**
   * Delete the career
   * @param id
   */
  deleteCareer(id_user_: string, id_career: string): Observable<any> {
    return this.careers$.pipe(
      take(1),
      switchMap((careers) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_career },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated career
                 */
                const index = careers.findIndex(
                  (item) => item.id_career == id_career
                );
                /**
                 * Delete the object of array
                 */
                careers.splice(index, 1);
                /**
                 * Update the careers
                 */
                this._careers.next(careers);
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
