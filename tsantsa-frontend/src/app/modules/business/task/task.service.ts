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
import { task, tasks } from './task.data';
import { Task } from './task.types';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _task: BehaviorSubject<Task> = new BehaviorSubject(task);
  private _tasks: BehaviorSubject<Task[]> = new BehaviorSubject(tasks);

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/task';
  }
  /**
   * Getter
   */
  get task$(): Observable<Task> {
    return this._task.asObservable();
  }
  /**
   * Getter for _tasks
   */
  get tasks$(): Observable<Task[]> {
    return this._tasks.asObservable();
  }
  /**
   * Create function
   */
  createTask(
    id_user_: string,
    id_course: string,
    id_partial: string
  ): Observable<any> {
    return this._tasks.pipe(
      take(1),
      switchMap((tasks) =>
        this._httpClient
          .post(
            this._url + '/create',
            {
              id_user_: parseInt(id_user_),
              course: {
                id_course: parseInt(id_course),
              },
              partial: {
                id_partial: parseInt(id_partial),
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
              const _task: Task = response.body;
              /**
               * Update the task in the store
               */
              this._tasks.next([_task, ...tasks]);

              return of(_task);
            })
          )
      )
    );
  }
  /**
   * readAllTask
   */
  readAllTask(): Observable<Task[]> {
    return this._httpClient.get<Task[]>(this._url + '/allRead').pipe(
      tap((tasks: Task[]) => {
        this._tasks.next(tasks);
      })
    );
  }
  /**
   * Read Task by query
   * @param query
   */
  readTaskByQuery(id_user: string, query: string): Observable<Task[]> {
    return this._httpClient
      .get<Task[]>(
        this._url + `/read/${id_user}/${query != '' ? query : 'query-all'}`
      )
      .pipe(
        tap((tasks: Task[]) => {
          this._tasks.next(tasks);
        })
      );
  }
  /**
   * Read Task by id
   * @param idTask
   */
  readTaskById(idTask: string): Observable<Task> {
    return this._httpClient
      .get<Task>(this._url + `/specificRead/${idTask}`)
      .pipe(
        tap((tasks: Task) => {
          return tasks;
        })
      );
  }
  /**
   * byUserRead
   * @param id_user
   */
  byUserRead(id_user: string): Observable<Task[]> {
    return this._httpClient
      .get<Task[]>(this._url + `/byUserRead/${id_user}`)
      .pipe(
        tap((tasks: Task[]) => {
          if (!tasks) {
            this._tasks.next([]);
            return [];
          } else {
            this._tasks.next(tasks);
            return tasks;
          }
        })
      );
  }
  /**
   * Read Task by id of local Observable
   */
  readTaskByIdLocal(id: string): Observable<Task> {
    return this._tasks.pipe(
      take(1),
      map((tasks) => {
        /**
         * Find
         */
        const task = tasks.find((item) => item.id_task == id) || null;
        /**
         * Update
         */
        this._task.next(task!);
        /**
         * Return
         */
        return task;
      }),
      switchMap((task) => {
        if (!task) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(task);
      })
    );
  }
  /**
   * Update task
   * @param id_user_ that will be updated
   * @param task
   */
  updateTask(task: Task): Observable<any> {
    return this.tasks$.pipe(
      take(1),
      switchMap((tasks) =>
        this._httpClient
          .patch(this._url + '/update', task, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _task: Task = response.body;
              /**
               * Find the index of the updated task
               */
              const index = tasks.findIndex(
                (item) => item.id_task == task.id_task
              );
              /**
               * Update the task
               */
              tasks[index] = _task;
              /**
               * Update the tasks
               */
              this._tasks.next(tasks);

              /**
               * Update the task
               */
              this._task.next(_task);

              return of(_task);
            })
          )
      )
    );
  }
  /**
   * sendTask
   * @param task
   */
  sendTask(task: Task): Observable<any> {
    return this.tasks$.pipe(
      take(1),
      switchMap((tasks) =>
        this._httpClient
          .patch(this._url + '/sendTask', task, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _task: Task = response.body;
              /**
               * Find the index of the updated task
               */
              const index = tasks.findIndex(
                (item) => item.id_task == task.id_task
              );
              /**
               * Update the task
               */
              tasks[index] = _task;
              /**
               * Update the tasks
               */
              this._tasks.next(tasks);

              /**
               * Update the task
               */
              this._task.next(_task);

              return of(_task);
            })
          )
      )
    );
  }
  /**
   * Delete the task
   * @param id
   */
  deleteTask(id_user_: string, id_task: string): Observable<any> {
    return this.tasks$.pipe(
      take(1),
      switchMap((tasks) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_task },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated task
                 */
                const index = tasks.findIndex(
                  (item) => item.id_task == id_task
                );
                /**
                 * Delete the object of array
                 */
                tasks.splice(index, 1);
                /**
                 * Update the tasks
                 */
                this._tasks.next(tasks);
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
   * reportTaskByCourse
   */
  reportTaskByCourse(id_course: string): Observable<any> {
    return this._httpClient
      .post(
        this._url + `/reportTaskByCourse`,
        {
          course: {
            id_course,
          },
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
