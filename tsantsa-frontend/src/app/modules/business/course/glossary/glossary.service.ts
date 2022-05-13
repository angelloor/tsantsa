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
import { glossary, glossarys } from './glossary.data';
import { Glossary } from './glossary.types';

@Injectable({
  providedIn: 'root',
})
export class GlossaryService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _glossary: BehaviorSubject<Glossary> = new BehaviorSubject(glossary);
  private _glossarys: BehaviorSubject<Glossary[]> = new BehaviorSubject(
    glossarys
  );

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/glossary';
  }
  /**
   * Getter
   */
  get glossary$(): Observable<Glossary> {
    return this._glossary.asObservable();
  }
  /**
   * Getter for _glossarys
   */
  get glossarys$(): Observable<Glossary[]> {
    return this._glossarys.asObservable();
  }
  /**
   * Create function
   */
  createGlossary(id_user_: string, id_course: string): Observable<any> {
    return this._glossarys.pipe(
      take(1),
      switchMap((glossarys) =>
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
              const _glossary: Glossary = response.body;
              /**
               * Update the glossary in the store
               */
              this._glossarys.next([_glossary, ...glossarys]);

              return of(_glossary);
            })
          )
      )
    );
  }
  /**
   * Read All Glossary
   */
  readAllGlossary(): Observable<Glossary[]> {
    return this._httpClient
      .get<Glossary[]>(this._url + '/read/*/query-all')
      .pipe(
        tap((glossarys: Glossary[]) => {
          this._glossarys.next(glossarys);
        })
      );
  }
  /**
   * Read Glossary by query
   * @param query
   */
  readGlossaryByQuery(
    id_course: string,
    query: string
  ): Observable<Glossary[]> {
    return this._httpClient
      .get<Glossary[]>(
        this._url + `/read/${id_course}/${query != '' ? query : 'query-all'}`
      )
      .pipe(
        tap((glossarys: Glossary[]) => {
          this._glossarys.next(glossarys);
        })
      );
  }
  /**
   * Read Glossary by id
   * @param idGlossary
   */
  readGlossaryById(idGlossary: string): Observable<Glossary> {
    return this._httpClient
      .get<Glossary>(this._url + `/specificRead/${idGlossary}`)
      .pipe(
        tap((glossarys: Glossary) => {
          return glossarys;
        })
      );
  }
  /**
   * byCourseRead
   * @param id_course
   */
  byCourseRead(id_course: string): Observable<Glossary[]> {
    return this._httpClient
      .get<Glossary[]>(this._url + `/byCourseRead/${id_course}`)
      .pipe(
        tap((glossarys: Glossary[]) => {
          if (glossarys) {
            this._glossarys.next(glossarys);
          } else {
            this._glossarys.next([]);
          }
        })
      );
  }
  /**
   * Read Glossary by id of local Observable
   */
  readGlossaryByIdLocal(id: string): Observable<Glossary> {
    return this._glossarys.pipe(
      take(1),
      map((glossarys) => {
        /**
         * Find
         */
        const glossary =
          glossarys.find((item) => item.id_glossary == id) || null;
        /**
         * Update
         */
        this._glossary.next(glossary!);
        /**
         * Return
         */
        return glossary;
      }),
      switchMap((glossary) => {
        if (!glossary) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(glossary);
      })
    );
  }
  /**
   * Update glossary
   * @param id_user_ that will be updated
   * @param glossary
   */
  updateGlossary(glossary: Glossary): Observable<any> {
    return this.glossarys$.pipe(
      take(1),
      switchMap((glossarys) =>
        this._httpClient
          .patch(this._url + '/update', glossary, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _glossary: Glossary = response.body;
              /**
               * Find the index of the updated glossary
               */
              const index = glossarys.findIndex(
                (item) => item.id_glossary == glossary.id_glossary
              );

              /**
               * Update the glossary
               */
              glossarys[index] = _glossary;
              /**
               * Update the glossarys
               */
              this._glossarys.next(glossarys);

              /**
               * Update the glossary
               */
              this._glossary.next(_glossary);

              return of(_glossary);
            })
          )
      )
    );
  }
  /**
   * Delete the glossary
   * @param id
   */
  deleteGlossary(id_user_: string, id_glossary: string): Observable<any> {
    return this.glossarys$.pipe(
      take(1),
      switchMap((glossarys) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_glossary },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated glossary
                 */
                const index = glossarys.findIndex(
                  (item) => item.id_glossary == id_glossary
                );

                /**
                 * Delete the object of array
                 */
                glossarys.splice(index, 1);
                /**
                 * Update the glossarys
                 */
                this._glossarys.next(glossarys);
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
