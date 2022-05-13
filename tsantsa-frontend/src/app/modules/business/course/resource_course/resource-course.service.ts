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
import { resourceCourse, resourceCourses } from './resource-course.data';
import { ResourceCourse } from './resource-course.types';

@Injectable({
  providedIn: 'root',
})
export class ResourceCourseService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _resourceCourse: BehaviorSubject<ResourceCourse> =
    new BehaviorSubject(resourceCourse);
  private _resourceCourses: BehaviorSubject<ResourceCourse[]> =
    new BehaviorSubject(resourceCourses);

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/resource_course';
  }
  /**
   * Getter
   */
  get resourceCourse$(): Observable<ResourceCourse> {
    return this._resourceCourse.asObservable();
  }
  /**
   * Getter for _resourceCourses
   */
  get resourceCourses$(): Observable<ResourceCourse[]> {
    return this._resourceCourses.asObservable();
  }
  /**
   * Create function
   */
  createResourceCourse(
    id_user_: string,
    id_course: string,
    file_name: string,
    length_mb: string,
    extension: string,
    file: File
  ): Observable<any> {
    var formData = new FormData();

    formData.append('id_user_', id_user_);
    formData.append('id_course', id_course);
    formData.append('file_name', file_name);
    formData.append('length_mb', length_mb);
    formData.append('extension', extension);
    formData.append('file', file);

    return this._resourceCourses.pipe(
      take(1),
      switchMap((resourceCourses) =>
        this._httpClient.post(this._url + '/create', formData).pipe(
          switchMap((response: any) => {
            /**
             * check the response body to match with the type
             */
            const _resourceCourse: ResourceCourse = response.body;
            /**
             * Update the resourceCourse in the store
             */
            this._resourceCourses.next([_resourceCourse, ...resourceCourses]);

            return of(_resourceCourse);
          })
        )
      )
    );
  }
  /**
   * Read All ResourceCourse
   */
  readAllResourceCourse(): Observable<ResourceCourse[]> {
    return this._httpClient
      .get<ResourceCourse[]>(this._url + `/read/*/query-all`)
      .pipe(
        tap((resourceCourses: ResourceCourse[]) => {
          this._resourceCourses.next(resourceCourses);
        })
      );
  }
  /**
   * Read ResourceCourse by query
   * @param query
   */
  readResourceCourseByQuery(
    id_course: string,
    query: string
  ): Observable<ResourceCourse[]> {
    return this._httpClient
      .get<ResourceCourse[]>(
        this._url + `/read/${id_course}/${query != '' ? query : 'query-all'}`
      )
      .pipe(
        tap((resourceCourses: ResourceCourse[]) => {
          this._resourceCourses.next(resourceCourses);
        })
      );
  }
  /**
   * Read ResourceCourse by id
   * @param idResourceCourse
   */
  readResourceCourseById(idResourceCourse: string): Observable<ResourceCourse> {
    return this._httpClient
      .get<ResourceCourse>(this._url + `/specificRead/${idResourceCourse}`)
      .pipe(
        tap((resourceCourses: ResourceCourse) => {
          return resourceCourses;
        })
      );
  }
  /**
   * byCourseRead
   * @param id_course
   */
  byCourseRead(id_course: string): Observable<ResourceCourse[]> {
    return this._httpClient
      .get<ResourceCourse[]>(this._url + `/byCourseRead/${id_course}`)
      .pipe(
        tap((resourceCourses: ResourceCourse[]) => {
          if (resourceCourses) {
            this._resourceCourses.next(resourceCourses);
          } else {
            this._resourceCourses.next([]);
          }
        })
      );
  }
  /**
   * Read ResourceCourse by id of local Observable
   */
  readResourceCourseByIdLocal(id: string): Observable<ResourceCourse> {
    return this._resourceCourses.pipe(
      take(1),
      map((resourceCourses) => {
        /**
         * Find
         */
        const resourceCourse =
          resourceCourses.find((item) => item.id_resource_course == id) || null;
        /**
         * Update
         */
        this._resourceCourse.next(resourceCourse!);
        /**
         * Return
         */
        return resourceCourse;
      }),
      switchMap((resourceCourse) => {
        if (!resourceCourse) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(resourceCourse);
      })
    );
  }
  /**
   * Update resourceCourse
   * @param id_user_ that will be updated
   * @param resourceCourse
   */
  updateResourceCourse(resourceCourse: ResourceCourse): Observable<any> {
    return this.resourceCourses$.pipe(
      take(1),
      switchMap((resourceCourses) =>
        this._httpClient
          .patch(this._url + '/update', resourceCourse, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _resourceCourse: ResourceCourse = response.body;
              /**
               * Find the index of the updated resourceCourse
               */
              const index = resourceCourses.findIndex(
                (item) =>
                  item.id_resource_course == resourceCourse.id_resource_course
              );

              /**
               * Update the resourceCourse
               */
              resourceCourses[index] = _resourceCourse;
              /**
               * Update the resourceCourses
               */
              this._resourceCourses.next(resourceCourses);

              /**
               * Update the resourceCourse
               */
              this._resourceCourse.next(_resourceCourse);

              return of(_resourceCourse);
            })
          )
      )
    );
  }
  /**
   * Delete the resourceCourse
   * @param id
   */
  deleteResourceCourse(
    id_user_: string,
    id_resource_course: string
  ): Observable<any> {
    return this.resourceCourses$.pipe(
      take(1),
      switchMap((resourceCourses) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_resource_course },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated resourceCourse
                 */
                const index = resourceCourses.findIndex(
                  (item) => item.id_resource_course == id_resource_course
                );

                /**
                 * Delete the object of array
                 */
                resourceCourses.splice(index, 1);
                /**
                 * Update the resourceCourses
                 */
                this._resourceCourses.next(resourceCourses);
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
   * downloadFile
   * @param server_path
   * @returns
   */
  downloadFile(server_path: string): any {
    return this._httpClient
      .post(
        this._url + `/downloadFile`,
        { server_path },
        {
          responseType: 'blob',
          headers: new HttpHeaders().append('Content-Type', 'application/json'),
        }
      )
      .pipe(map((data) => data));
  }
}
