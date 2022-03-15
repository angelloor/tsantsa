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
import { period, periods } from './period.data';
import { Period } from './period.types';

@Injectable({
  providedIn: 'root',
})
export class PeriodService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _period: BehaviorSubject<Period> = new BehaviorSubject(period);
  private _periods: BehaviorSubject<Period[]> = new BehaviorSubject(periods);

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/period';
  }
  /**
   * Getter
   */
  get period$(): Observable<Period> {
    return this._period.asObservable();
  }
  /**
   * Getter for _periods
   */
  get periods$(): Observable<Period[]> {
    return this._periods.asObservable();
  }
  /**
   * Create function
   */
  createPeriod(id_user_: string): Observable<any> {
    return this._periods.pipe(
      take(1),
      switchMap((periods) =>
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
              const _period: Period = response.body;
              /**
               * Update the period in the store
               */
              this._periods.next([_period, ...periods]);

              return of(_period);
            })
          )
      )
    );
  }
  /**
   * Read All Period
   */
  readAllPeriod(): Observable<Period[]> {
    return this._httpClient.get<Period[]>(this._url + '/read/query-all').pipe(
      tap((periods: Period[]) => {
        this._periods.next(periods);
      })
    );
  }
  /**
   * Read Period by query
   * @param query
   */
  readPeriodByQuery(query: string): Observable<Period[]> {
    return this._httpClient
      .get<Period[]>(this._url + `/read/${query != '' ? query : 'query-all'}`)
      .pipe(
        tap((periods: Period[]) => {
          this._periods.next(periods);
        })
      );
  }
  /**
   * Read Period by id
   * @param idPeriod
   */
  readPeriodById(idPeriod: string): Observable<Period> {
    return this._httpClient
      .get<Period>(this._url + `/specificRead/${idPeriod}`)
      .pipe(
        tap((periods: Period) => {
          return periods;
        })
      );
  }
  /**
   * Read Period by id of local Observable
   */
  readPeriodByIdLocal(id: string): Observable<Period> {
    return this._periods.pipe(
      take(1),
      map((periods) => {
        /**
         * Find
         */
        const period = periods.find((item) => item.id_period == id) || null;
        /**
         * Update
         */
        this._period.next(period!);
        /**
         * Return
         */
        return period;
      }),
      switchMap((period) => {
        if (!period) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(period);
      })
    );
  }
  /**
   * Update period
   * @param id_user_ that will be updated
   * @param period
   */
  updatePeriod(period: Period): Observable<any> {
    return this.periods$.pipe(
      take(1),
      switchMap((periods) =>
        this._httpClient
          .patch(this._url + '/update', period, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _period: Period = response.body;
              /**
               * Find the index of the updated period
               */
              const index = periods.findIndex(
                (item) => item.id_period == period.id_period
              );
              /**
               * Update the period
               */
              periods[index] = _period;
              /**
               * Update the periods
               */
              this._periods.next(periods);

              /**
               * Update the period
               */
              this._period.next(_period);

              return of(_period);
            })
          )
      )
    );
  }
  /**
   * Delete the period
   * @param id
   */
  deletePeriod(id_user_: string, id_period: string): Observable<any> {
    return this.periods$.pipe(
      take(1),
      switchMap((periods) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_period },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated period
                 */
                const index = periods.findIndex(
                  (item) => item.id_period == id_period
                );
                /**
                 * Delete the object of array
                 */
                periods.splice(index, 1);
                /**
                 * Update the periods
                 */
                this._periods.next(periods);
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
