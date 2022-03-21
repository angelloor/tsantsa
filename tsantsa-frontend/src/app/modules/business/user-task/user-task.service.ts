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
import { userTask, userTasks } from './user-task.data';
import { UserTask } from './user-task.types';

@Injectable({
  providedIn: 'root',
})
export class UserTaskService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _userTask: BehaviorSubject<UserTask> = new BehaviorSubject(userTask);
  private _userTasks: BehaviorSubject<UserTask[]> = new BehaviorSubject(
    userTasks
  );

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/user_task';
  }
  /**
   * Getter
   */
  get userTask$(): Observable<UserTask> {
    return this._userTask.asObservable();
  }
  /**
   * Getter for _userTasks
   */
  get userTasks$(): Observable<UserTask[]> {
    return this._userTasks.asObservable();
  }
  /**
   * Create function
   */
  createUserTask(id_user_: string): Observable<any> {
    return this._userTasks.pipe(
      take(1),
      switchMap((userTasks) =>
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
              const _userTask: UserTask = response.body;
              /**
               * Update the userTask in the store
               */
              this._userTasks.next([_userTask, ...userTasks]);

              return of(_userTask);
            })
          )
      )
    );
  }
  /**
   * Read All UserTask
   */
  readAllUserTask(): Observable<UserTask[]> {
    return this._httpClient.get<UserTask[]>(this._url + '/read/query-all').pipe(
      tap((userTasks: UserTask[]) => {
        this._userTasks.next(userTasks);
      })
    );
  }
  /**
   * Read UserTask by query
   * @param query
   */
  readUserTaskByQuery(query: string): Observable<UserTask[]> {
    return this._httpClient
      .get<UserTask[]>(this._url + `/read/${query != '' ? query : 'query-all'}`)
      .pipe(
        tap((userTasks: UserTask[]) => {
          this._userTasks.next(userTasks);
        })
      );
  }
  /**
   * Read UserTask by id
   * @param idUserTask
   */
  readUserTaskById(idUserTask: string): Observable<UserTask> {
    return this._httpClient
      .get<UserTask>(this._url + `/specificRead/${idUserTask}`)
      .pipe(
        tap((userTasks: UserTask) => {
          return userTasks;
        })
      );
  }
  /**
   * byUserRead
   * @param id_user
   */
  byUserRead(id_user: string): Observable<UserTask[]> {
    return this._httpClient
      .get<UserTask[]>(this._url + `/byUserRead/${id_user}`)
      .pipe(
        tap((userTasks: UserTask[]) => {
          if (!userTasks) {
            this._userTasks.next([]);
            return [];
          } else {
            this._userTasks.next(userTasks);
            return userTasks;
          }
        })
      );
  }
  /**
   * bySenderUserRead
   * @param id_user_sender
   */
  bySenderUserRead(id_user_sender: string): Observable<UserTask[]> {
    return this._httpClient
      .get<UserTask[]>(this._url + `/bySenderUserRead/${id_user_sender}`)
      .pipe(
        tap((userTasks: UserTask[]) => {
          if (!userTasks) {
            this._userTasks.next([]);
            return [];
          } else {
            this._userTasks.next(userTasks);
            return userTasks;
          }
        })
      );
  }
  /**
   * Read UserTask by id of local Observable
   */
  readUserTaskByIdLocal(id: string): Observable<UserTask> {
    return this._userTasks.pipe(
      take(1),
      map((userTasks) => {
        /**
         * Find
         */
        const userTask =
          userTasks.find((item) => item.id_user_task == id) || null;
        /**
         * Update
         */
        this._userTask.next(userTask!);
        /**
         * Return
         */
        return userTask;
      }),
      switchMap((userTask) => {
        if (!userTask) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(userTask);
      })
    );
  }
  /**
   * Update userTask
   * @param userTask
   */
  updateUserTask(userTask: UserTask): Observable<any> {
    return this.userTasks$.pipe(
      take(1),
      switchMap((userTasks) =>
        this._httpClient
          .patch(this._url + '/update', userTask, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _userTask: UserTask = response.body;
              /**
               * Find the index of the updated userTask
               */
              const index = userTasks.findIndex(
                (item) => item.id_user_task == userTask.id_user_task
              );
              /**
               * Update the userTask
               */
              userTasks[index] = _userTask;
              /**
               * Update the userTasks
               */
              this._userTasks.next(userTasks);

              /**
               * Update the userTask
               */
              this._userTask.next(_userTask);

              return of(_userTask);
            })
          )
      )
    );
  }
  /**
   * Delete the userTask
   * @param id_user_
   */
  deleteUserTask(id_user_: string, id_user_task: string): Observable<any> {
    return this.userTasks$.pipe(
      take(1),
      switchMap((userTasks) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_user_task },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated userTask
                 */
                const index = userTasks.findIndex(
                  (item) => item.id_user_task == id_user_task
                );
                /**
                 * Delete the object of array
                 */
                userTasks.splice(index, 1);
                /**
                 * Update the userTasks
                 */
                this._userTasks.next(userTasks);
                return of(response.body);
              } else {
                return of(false);
              }
            })
          )
      )
    );
  }
  /**
   * reportUserTaskByUser
   */
  reportUserTaskByUser(id_user: string): Observable<any> {
    return this._httpClient
      .post(
        this._url + `/reportUserTaskByUser`,
        {
          user: id_user,
        },
        {
          responseType: 'blob',
          observe: 'response',
          headers: new HttpHeaders().append('Content-Type', 'application/json'),
        }
      )
      .pipe(map((response: any) => response));
  }
}
