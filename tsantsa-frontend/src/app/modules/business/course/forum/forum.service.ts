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
import { forum, forums } from './forum.data';
import { Forum } from './forum.types';

@Injectable({
  providedIn: 'root',
})
export class ForumService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _forum: BehaviorSubject<Forum> = new BehaviorSubject(forum);
  private _forums: BehaviorSubject<Forum[]> = new BehaviorSubject(forums);

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/forum';
  }
  /**
   * Getter
   */
  get forum$(): Observable<Forum> {
    return this._forum.asObservable();
  }
  /**
   * Getter for _forums
   */
  get forums$(): Observable<Forum[]> {
    return this._forums.asObservable();
  }
  /**
   * Create function
   */
  createForum(id_user_: string, id_course: string): Observable<any> {
    return this._forums.pipe(
      take(1),
      switchMap((forums) =>
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
              const _forum: Forum = response.body;
              /**
               * Update the forum in the store
               */
              this._forums.next([_forum, ...forums]);

              return of(_forum);
            })
          )
      )
    );
  }
  /**
   * Read All Forum
   */
  readAllForum(): Observable<Forum[]> {
    return this._httpClient.get<Forum[]>(this._url + '/read/*/query-all').pipe(
      tap((forums: Forum[]) => {
        this._forums.next(forums);
      })
    );
  }
  /**
   * Read Forum by query
   * @param query
   */
  readForumByQuery(id_course: string, query: string): Observable<Forum[]> {
    return this._httpClient
      .get<Forum[]>(
        this._url + `/read/${id_course}/${query != '' ? query : 'query-all'}`
      )
      .pipe(
        tap((forums: Forum[]) => {
          this._forums.next(forums);
        })
      );
  }
  /**
   * Read Forum by id
   * @param idForum
   */
  readForumById(idForum: string): Observable<Forum> {
    return this._httpClient
      .get<Forum>(this._url + `/specificRead/${idForum}`)
      .pipe(
        tap((forums: Forum) => {
          return forums;
        })
      );
  }
  /**
   * byCourseRead
   * @param id_course
   */
  byCourseRead(id_course: string): Observable<Forum[]> {
    return this._httpClient
      .get<Forum[]>(this._url + `/byCourseRead/${id_course}`)
      .pipe(
        tap((forums: Forum[]) => {
          if (forums) {
            this._forums.next(forums);
          } else {
            this._forums.next([]);
          }
        })
      );
  }
  /**
   * Read Forum by id of local Observable
   */
  readForumByIdLocal(id: string): Observable<Forum> {
    return this._forums.pipe(
      take(1),
      map((forums) => {
        /**
         * Find
         */
        const forum = forums.find((item) => item.id_forum == id) || null;
        /**
         * Update
         */
        this._forum.next(forum!);
        /**
         * Return
         */
        return forum;
      }),
      switchMap((forum) => {
        if (!forum) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(forum);
      })
    );
  }
  /**
   * Update forum
   * @param id_user_ that will be updated
   * @param forum
   */
  updateForum(forum: Forum): Observable<any> {
    return this.forums$.pipe(
      take(1),
      switchMap((forums) =>
        this._httpClient
          .patch(this._url + '/update', forum, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _forum: Forum = response.body;
              /**
               * Find the index of the updated forum
               */
              const index = forums.findIndex(
                (item) => item.id_forum == forum.id_forum
              );
              /**
               * Update the forum
               */
              forums[index] = _forum;
              /**
               * Update the forums
               */
              this._forums.next(forums);

              /**
               * Update the forum
               */
              this._forum.next(_forum);

              return of(_forum);
            })
          )
      )
    );
  }
  /**
   * Delete the forum
   * @param id
   */
  deleteForum(id_user_: string, id_forum: string): Observable<any> {
    return this.forums$.pipe(
      take(1),
      switchMap((forums) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_forum },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated forum
                 */
                const index = forums.findIndex(
                  (item) => item.id_forum == id_forum
                );

                /**
                 * Delete the object of array
                 */
                forums.splice(index, 1);
                /**
                 * Update the forums
                 */
                this._forums.next(forums);
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
