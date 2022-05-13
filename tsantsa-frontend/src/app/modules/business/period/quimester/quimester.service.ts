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
import { quimester, quimesters } from './quimester.data';
import { Quimester } from './quimester.types';

@Injectable({
  providedIn: 'root',
})
export class QuimesterService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _quimester: BehaviorSubject<Quimester> = new BehaviorSubject(
    quimester
  );
  private _quimesters: BehaviorSubject<Quimester[]> = new BehaviorSubject(
    quimesters
  );

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/quimester';
  }
  /**
   * Getter
   */
  get quimester$(): Observable<Quimester> {
    return this._quimester.asObservable();
  }
  /**
   * Getter for _quimesters
   */
  get quimesters$(): Observable<Quimester[]> {
    return this._quimesters.asObservable();
  }
  /**
   * Create function
   */
  createQuimester(id_user_: string, id_period: string): Observable<any> {
    return this._quimesters.pipe(
      take(1),
      switchMap((quimesters) =>
        this._httpClient
          .post(
            this._url + '/create',
            {
              id_user_: parseInt(id_user_),
              period: {
                id_period: parseInt(id_period),
              },
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
              const _quimester: Quimester = response.body;
              /**
               * Update the quimester in the store
               */
              this._quimesters.next([_quimester, ...quimesters]);

              return of(_quimester);
            })
          )
      )
    );
  }
  /**
   * Read All Quimester
   */
  readAllQuimester(): Observable<Quimester[]> {
    return this._httpClient
      .get<Quimester[]>(this._url + `/read/*/query-all`)
      .pipe(
        tap((quimesters: Quimester[]) => {
          this._quimesters.next(quimesters);
        })
      );
  }
  /**
   * Read Quimester by query
   * @param query
   */
  readQuimesterByQuery(
    id_period: string,
    query: string
  ): Observable<Quimester[]> {
    return this._httpClient
      .get<Quimester[]>(
        this._url + `/read/${id_period}/${query != '' ? query : 'query-all'}`
      )
      .pipe(
        tap((quimesters: Quimester[]) => {
          this._quimesters.next(quimesters);
        })
      );
  }
  /**
   * Read Quimester by id
   * @param idQuimester
   */
  readQuimesterById(idQuimester: string): Observable<Quimester> {
    return this._httpClient
      .get<Quimester>(this._url + `/specificRead/${idQuimester}`)
      .pipe(
        tap((quimesters: Quimester) => {
          return quimesters;
        })
      );
  }
  /**
   * byPeriodRead
   * @param id_period
   */
  byPeriodRead(id_period: string): Observable<Quimester[]> {
    return this._httpClient
      .get<Quimester[]>(this._url + `/byPeriodRead/${id_period}`)
      .pipe(
        tap((quimesters: Quimester[]) => {
          if (quimesters) {
            this._quimesters.next(quimesters);
          } else {
            this._quimesters.next([]);
          }
        })
      );
  }
  /**
   * Read Quimester by id of local Observable
   */
  readQuimesterByIdLocal(id: string): Observable<Quimester> {
    return this._quimesters.pipe(
      take(1),
      map((quimesters) => {
        /**
         * Find
         */
        const quimester =
          quimesters.find((item) => item.id_quimester == id) || null;
        /**
         * Update
         */
        this._quimester.next(quimester!);
        /**
         * Return
         */
        return quimester;
      }),
      switchMap((quimester) => {
        if (!quimester) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(quimester);
      })
    );
  }
  /**
   * Update quimester
   * @param id_user_ that will be updated
   * @param quimester
   */
  updateQuimester(quimester: Quimester): Observable<any> {
    return this.quimesters$.pipe(
      take(1),
      switchMap((quimesters) =>
        this._httpClient
          .patch(this._url + '/update', quimester, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _quimester: Quimester = response.body;
              /**
               * Find the index of the updated quimester
               */
              const index = quimesters.findIndex(
                (item) => item.id_quimester == quimester.id_quimester
              );

              /**
               * Update the quimester
               */
              quimesters[index] = _quimester;
              /**
               * Update the quimesters
               */
              this._quimesters.next(quimesters);

              /**
               * Update the quimester
               */
              this._quimester.next(_quimester);

              return of(_quimester);
            })
          )
      )
    );
  }
  /**
   * Delete the quimester
   * @param id
   */
  deleteQuimester(id_user_: string, id_quimester: string): Observable<any> {
    return this.quimesters$.pipe(
      take(1),
      switchMap((quimesters) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_quimester },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated quimester
                 */
                const index = quimesters.findIndex(
                  (item) => item.id_quimester == id_quimester
                );

                /**
                 * Delete the object of array
                 */
                quimesters.splice(index, 1);
                /**
                 * Update the quimesters
                 */
                this._quimesters.next(quimesters);
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
