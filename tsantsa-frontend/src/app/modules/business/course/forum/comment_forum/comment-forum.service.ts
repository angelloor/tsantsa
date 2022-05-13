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
import { commentForum, commentForums } from './comment-forum.data';
import { CommentForum } from './comment-forum.types';

@Injectable({
  providedIn: 'root',
})
export class CommentForumService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _commentForum: BehaviorSubject<CommentForum> = new BehaviorSubject(
    commentForum
  );
  private _commentForums: BehaviorSubject<CommentForum[]> = new BehaviorSubject(
    commentForums
  );

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/comment_forum';
  }
  /**
   * Getter
   */
  get commentForum$(): Observable<CommentForum> {
    return this._commentForum.asObservable();
  }
  /**
   * Getter for _commentForums
   */
  get commentForums$(): Observable<CommentForum[]> {
    return this._commentForums.asObservable();
  }
  /**
   * Create function
   */
  createCommentForum(id_user_: string, id_forum: string): Observable<any> {
    return this._commentForums.pipe(
      take(1),
      switchMap((commentForums) =>
        this._httpClient
          .post(
            this._url + '/create',
            {
              id_user_: parseInt(id_user_),
              forum: {
                id_forum: parseInt(id_forum),
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
              const _commentForum: CommentForum = response.body;
              /**
               * Update the commentForum in the store
               */
              this._commentForums.next([...commentForums, _commentForum]);

              return of(_commentForum);
            })
          )
      )
    );
  }
  /**
   * Read All CommentForum
   */
  readAllCommentForum(): Observable<CommentForum[]> {
    return this._httpClient
      .get<CommentForum[]>(this._url + '/read/query-all')
      .pipe(
        tap((commentForums: CommentForum[]) => {
          this._commentForums.next(commentForums);
        })
      );
  }
  /**
   * Read CommentForum by query
   * @param query
   */
  readCommentForumByQuery(query: string): Observable<CommentForum[]> {
    return this._httpClient
      .get<CommentForum[]>(
        this._url + `/read/${query != '' ? query : 'query-all'}`
      )
      .pipe(
        tap((commentForums: CommentForum[]) => {
          this._commentForums.next(commentForums);
        })
      );
  }
  /**
   * Read CommentForum by id
   * @param idCommentForum
   */
  readCommentForumById(idCommentForum: string): Observable<CommentForum> {
    return this._httpClient
      .get<CommentForum>(this._url + `/specificRead/${idCommentForum}`)
      .pipe(
        tap((commentForums: CommentForum) => {
          return commentForums;
        })
      );
  }
  /**
   * byForumRead
   * @param id_forum
   */
  byForumRead(id_forum: string): Observable<CommentForum[]> {
    return this._httpClient
      .get<CommentForum[]>(this._url + `/byForumRead/${id_forum}`)
      .pipe(
        tap((commentForums: CommentForum[]) => {
          if (commentForums) {
            this._commentForums.next(commentForums);
          } else {
            this._commentForums.next([]);
          }
        })
      );
  }
  /**
   * Read CommentForum by id of local Observable
   */
  readCommentForumByIdLocal(id: string): Observable<CommentForum> {
    return this._commentForums.pipe(
      take(1),
      map((commentForums) => {
        /**
         * Find
         */
        const commentForum =
          commentForums.find((item) => item.id_comment_forum == id) || null;
        /**
         * Update
         */
        this._commentForum.next(commentForum!);
        /**
         * Return
         */
        return commentForum;
      }),
      switchMap((commentForum) => {
        if (!commentForum) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(commentForum);
      })
    );
  }
  /**
   * Update commentForum
   * @param id_user_ that will be updated
   * @param commentForum
   */
  updateCommentForum(commentForum: CommentForum): Observable<any> {
    return this.commentForums$.pipe(
      take(1),
      switchMap((commentForums) =>
        this._httpClient
          .patch(this._url + '/update', commentForum, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _commentForum: CommentForum = response.body;
              /**
               * Find the index of the updated commentForum
               */
              const index = commentForums.findIndex(
                (item) => item.id_comment_forum == commentForum.id_comment_forum
              );

              /**
               * Update the commentForum
               */
              commentForums[index] = _commentForum;
              /**
               * Update the commentForums
               */
              this._commentForums.next(commentForums);

              /**
               * Update the commentForum
               */
              this._commentForum.next(_commentForum);

              return of(_commentForum);
            })
          )
      )
    );
  }
  /**
   * Delete the commentForum
   * @param id
   */
  deleteCommentForum(
    id_user_: string,
    id_comment_forum: string
  ): Observable<any> {
    return this.commentForums$.pipe(
      take(1),
      switchMap((commentForums) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_comment_forum },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated commentForum
                 */
                const index = commentForums.findIndex(
                  (item) => item.id_comment_forum == id_comment_forum
                );

                /**
                 * Delete the object of array
                 */
                commentForums.splice(index, 1);
                /**
                 * Update the commentForums
                 */
                this._commentForums.next(commentForums);
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
