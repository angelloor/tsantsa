import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, of, switchMap, take, tap } from 'rxjs';
import { comment, comments } from './comment.data';
import { Comment } from './comment.types';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _comment: BehaviorSubject<Comment> = new BehaviorSubject(comment);
  private _comments: BehaviorSubject<Comment[]> = new BehaviorSubject(comments);

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/comment';
  }
  /**
   * Getter
   */
  get comment$(): Observable<Comment> {
    return this._comment.asObservable();
  }
  /**
   * Getter for _comments
   */
  get comments$(): Observable<Comment[]> {
    return this._comments.asObservable();
  }
  /**
   * Create function
   */
  createComment(id_user_: string, id_user_task: string): Observable<any> {
    return this._comments.pipe(
      take(1),
      switchMap((comments) =>
        this._httpClient
          .post(
            this._url + '/create',
            {
              id_user_: parseInt(id_user_),
              user_task: {
                id_user_task: parseInt(id_user_task),
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
              const _comment: Comment = response.body;
              console.log(_comment);
              /**
               * Update the comment in the store
               */
              this._comments.next([_comment, ...comments]);

              return of(_comment);
            })
          )
      )
    );
  }
  /**
   * Read All Comment
   */
  readAllComment(): Observable<Comment[]> {
    return this._httpClient.get<Comment[]>(this._url + '/read/query-all').pipe(
      tap((comments: Comment[]) => {
        this._comments.next(comments);
      })
    );
  }
  /**
   * Read Comment by query
   * @param query
   */
  readCommentByQuery(query: string): Observable<Comment[]> {
    return this._httpClient
      .get<Comment[]>(this._url + `/read/${query != '' ? query : 'query-all'}`)
      .pipe(
        tap((comments: Comment[]) => {
          this._comments.next(comments);
        })
      );
  }
  /**
   * Read Comment by id
   * @param idComment
   */
  readCommentById(idComment: string): Observable<Comment> {
    return this._httpClient
      .get<Comment>(this._url + `/specificRead/${idComment}`)
      .pipe(
        tap((comments: Comment) => {
          return comments;
        })
      );
  }
  /**
   * byUserTaskRead
   * @param id_user_task
   */
  byUserTaskRead(id_user_task: string): Observable<Comment[]> {
    return this._httpClient
      .get<Comment[]>(this._url + `/byUserTaskRead/${id_user_task}`)
      .pipe(
        tap((comments: Comment[]) => {
          if (!comments) {
            this._comments.next([]);
            return [];
          } else {
            this._comments.next(comments);
            return comments;
          }
        })
      );
  }
  /**
   * Update comment
   * @param id_user_ that will be updated
   * @param comment
   */
  updateComment(comment: Comment): Observable<any> {
    return this.comments$.pipe(
      take(1),
      switchMap((comments) =>
        this._httpClient
          .patch(this._url + '/update', comment, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _comment: Comment = response.body;
              console.log(_comment);
              /**
               * Find the index of the updated comment
               */
              const index = comments.findIndex(
                (item) => item.id_comment == comment.id_comment
              );
              console.log(index);
              /**
               * Update the comment
               */
              comments[index] = _comment;
              /**
               * Update the comments
               */
              this._comments.next(comments);

              /**
               * Update the comment
               */
              this._comment.next(_comment);

              return of(_comment);
            })
          )
      )
    );
  }
  /**
   * Delete the comment
   * @param id
   */
  deleteComment(id_user_: string, id_comment: string): Observable<any> {
    return this.comments$.pipe(
      take(1),
      switchMap((comments) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_comment },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated comment
                 */
                const index = comments.findIndex(
                  (item) => item.id_comment == id_comment
                );
                console.log(index);
                /**
                 * Delete the object of array
                 */
                comments.splice(index, 1);
                /**
                 * Update the comments
                 */
                this._comments.next(comments);
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
