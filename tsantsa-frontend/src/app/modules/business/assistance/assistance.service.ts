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
import { assistance, assistances } from './assistance.data';
import { Assistance } from './assistance.types';

@Injectable({
  providedIn: 'root',
})
export class AssistanceService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _assistance: BehaviorSubject<Assistance> = new BehaviorSubject(
    assistance
  );
  private _assistances: BehaviorSubject<Assistance[]> = new BehaviorSubject(
    assistances
  );

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/assistance';
  }
  /**
   * Getter
   */
  get assistance$(): Observable<Assistance> {
    return this._assistance.asObservable();
  }
  /**
   * Getter for _assistances
   */
  get assistances$(): Observable<Assistance[]> {
    return this._assistances.asObservable();
  }
  /**
   * Create function
   */
  createAssistance(id_user_: string, id_course: string): Observable<any> {
    return this._assistances.pipe(
      take(1),
      switchMap((assistances) =>
        this._httpClient
          .post(
            this._url + '/create',
            {
              id_user_: parseInt(id_user_),
              course: {
                id_course: parseInt(id_course),
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
              const _assistance: Assistance = response.body;
              /**
               * Update the assistance in the store
               */
              this._assistances.next([_assistance, ...assistances]);

              return of(_assistance);
            })
          )
      )
    );
  }
  /**
   * Read All Assistance
   */
  readAllAssistance(): Observable<Assistance[]> {
    return this._httpClient
      .get<Assistance[]>(this._url + '/read/query-all')
      .pipe(
        tap((assistances: Assistance[]) => {
          this._assistances.next(assistances);
        })
      );
  }
  /**
   * Read Assistance by query
   * @param query
   */
  readAssistanceByQuery(query: string): Observable<Assistance[]> {
    return this._httpClient
      .get<Assistance[]>(
        this._url + `/read/${query != '' ? query : 'query-all'}`
      )
      .pipe(
        tap((assistances: Assistance[]) => {
          this._assistances.next(assistances);
        })
      );
  }
  /**
   * Read Assistance by id
   * @param idAssistance
   */
  readAssistanceById(idAssistance: string): Observable<Assistance> {
    return this._httpClient
      .get<Assistance>(this._url + `/specificRead/${idAssistance}`)
      .pipe(
        tap((assistances: Assistance) => {
          return assistances;
        })
      );
  }
  /**
   * byUserRead
   * @param id_user
   */
  byUserRead(id_user: string): Observable<Assistance[]> {
    return this._httpClient
      .get<Assistance[]>(this._url + `/byUserRead/${id_user}`)
      .pipe(
        tap((assistances: Assistance[]) => {
          if (!assistances) {
            this._assistances.next([]);
            return [];
          } else {
            this._assistances.next(assistances);
            return assistances;
          }
        })
      );
  }
  /**
   * byCourseRead
   * @param id_course
   */
  byCourseRead(id_course: string): Observable<Assistance[]> {
    return this._httpClient
      .get<Assistance[]>(this._url + `/byCourseRead/${id_course}`)
      .pipe(
        tap((assistances: Assistance[]) => {
          if (!assistances) {
            this._assistances.next([]);
            return [];
          } else {
            this._assistances.next(assistances);
            return assistances;
          }
        })
      );
  }
  /**
   * byUserAndCourseRead
   * @param id_user
   * @param id_course
   * @returns Assistance[]
   */
  byUserAndCourseRead(
    id_user: string,
    id_course: string
  ): Observable<Assistance[]> {
    return this._httpClient
      .get<Assistance[]>(
        this._url + `/byUserAndCourseRead/${id_user}/${id_course}`
      )
      .pipe(
        tap((assistances: Assistance[]) => {
          if (!assistances) {
            this._assistances.next([]);
            return [];
          } else {
            this._assistances.next(assistances);
            return assistances;
          }
        })
      );
  }
  /**
   * Read Assistance by id of local Observable
   */
  readAssistanceByIdLocal(id: string): Observable<Assistance> {
    return this._assistances.pipe(
      take(1),
      map((assistances) => {
        /**
         * Find
         */
        const assistance =
          assistances.find((item) => item.id_assistance == id) || null;
        /**
         * Update
         */
        this._assistance.next(assistance!);
        /**
         * Return
         */
        return assistance;
      }),
      switchMap((assistance) => {
        if (!assistance) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(assistance);
      })
    );
  }
  /**
   * Update assistance
   * @param id_user_ that will be updated
   * @param assistance
   */
  updateAssistance(assistance: Assistance): Observable<any> {
    return this.assistances$.pipe(
      take(1),
      switchMap((assistances) =>
        this._httpClient
          .patch(this._url + '/update', assistance, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _assistance: Assistance = response.body;
              /**
               * Find the index of the updated assistance
               */
              const index = assistances.findIndex(
                (item) => item.id_assistance == assistance.id_assistance
              );
              /**
               * Update the assistance
               */
              assistances[index] = _assistance;
              /**
               * Update the assistances
               */
              this._assistances.next(assistances);

              /**
               * Update the assistance
               */
              this._assistance.next(_assistance);

              return of(_assistance);
            })
          )
      )
    );
  }
  /**
   * Delete the assistance
   * @param id
   */
  deleteAssistance(id_user_: string, id_assistance: string): Observable<any> {
    return this.assistances$.pipe(
      take(1),
      switchMap((assistances) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_assistance },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated assistance
                 */
                const index = assistances.findIndex(
                  (item) => item.id_assistance == id_assistance
                );
                /**
                 * Delete the object of array
                 */
                assistances.splice(index, 1);
                /**
                 * Update the assistances
                 */
                this._assistances.next(assistances);
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
