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
import { partial, partials } from './partial.data';
import { Partial } from './partial.types';

@Injectable({
  providedIn: 'root',
})
export class PartialService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _partial: BehaviorSubject<Partial> = new BehaviorSubject(partial);
  private _partials: BehaviorSubject<Partial[]> = new BehaviorSubject(partials);

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/partial';
  }
  /**
   * Getter
   */
  get partial$(): Observable<Partial> {
    return this._partial.asObservable();
  }
  /**
   * Getter for _partials
   */
  get partials$(): Observable<Partial[]> {
    return this._partials.asObservable();
  }
  /**
   * Create function
   */
  createPartial(id_user_: string, id_quimester: string): Observable<any> {
    return this._partials.pipe(
      take(1),
      switchMap((partials) =>
        this._httpClient
          .post(
            this._url + '/create',
            {
              id_user_: parseInt(id_user_),
              quimester: {
                id_quimester: parseInt(id_quimester),
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
              const _partial: Partial = response.body;
              /**
               * Update the partial in the store
               */
              this._partials.next([_partial, ...partials]);

              return of(_partial);
            })
          )
      )
    );
  }
  /**
   * readAllPartial
   */
  readAllPartial(): Observable<Partial[]> {
    return this._httpClient
      .get<Partial[]>(this._url + `/read/*/query-all`)
      .pipe(
        tap((partials: Partial[]) => {
          this._partials.next(partials);
        })
      );
  }
  /**
   * Read Partial by query
   * @param query
   */
  readPartialByQuery(
    id_quimester: string,
    query: string
  ): Observable<Partial[]> {
    return this._httpClient
      .get<Partial[]>(
        this._url + `/read/${id_quimester}/${query != '' ? query : 'query-all'}`
      )
      .pipe(
        tap((partials: Partial[]) => {
          this._partials.next(partials);
        })
      );
  }
  /**
   * Read Partial by id
   * @param idPartial
   */
  readPartialById(idPartial: string): Observable<Partial> {
    return this._httpClient
      .get<Partial>(this._url + `/specificRead/${idPartial}`)
      .pipe(
        tap((partials: Partial) => {
          return partials;
        })
      );
  }
  /**
   * byQuimesterRead
   * @param id_quimester
   */
  byQuimesterRead(id_quimester: string): Observable<Partial[]> {
    return this._httpClient
      .get<Partial[]>(this._url + `/byQuimesterRead/${id_quimester}`)
      .pipe(
        tap((partials: Partial[]) => {
          if (partials) {
            this._partials.next(partials);
          } else {
            this._partials.next([]);
          }
        })
      );
  }
  /**
   * Read Partial by id of local Observable
   */
  readPartialByIdLocal(id: string): Observable<Partial> {
    return this._partials.pipe(
      take(1),
      map((partials) => {
        /**
         * Find
         */
        const partial = partials.find((item) => item.id_partial == id) || null;
        /**
         * Update
         */
        this._partial.next(partial!);
        /**
         * Return
         */
        return partial;
      }),
      switchMap((partial) => {
        if (!partial) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(partial);
      })
    );
  }
  /**
   * Update partial
   * @param id_user_ that will be updated
   * @param partial
   */
  updatePartial(partial: Partial): Observable<any> {
    return this.partials$.pipe(
      take(1),
      switchMap((partials) =>
        this._httpClient
          .patch(this._url + '/update', partial, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _partial: Partial = response.body;
              /**
               * Find the index of the updated partial
               */
              const index = partials.findIndex(
                (item) => item.id_partial == partial.id_partial
              );

              /**
               * Update the partial
               */
              partials[index] = _partial;
              /**
               * Update the partials
               */
              this._partials.next(partials);

              /**
               * Update the partial
               */
              this._partial.next(_partial);

              return of(_partial);
            })
          )
      )
    );
  }
  /**
   * Delete the partial
   * @param id
   */
  deletePartial(id_user_: string, id_partial: string): Observable<any> {
    return this.partials$.pipe(
      take(1),
      switchMap((partials) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_partial },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated partial
                 */
                const index = partials.findIndex(
                  (item) => item.id_partial == id_partial
                );

                /**
                 * Delete the object of array
                 */
                partials.splice(index, 1);
                /**
                 * Update the partials
                 */
                this._partials.next(partials);
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
