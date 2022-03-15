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
import { resource, resources } from './resource.data';
import { Resource } from './resource.types';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _resource: BehaviorSubject<Resource> = new BehaviorSubject(resource);
  private _resources: BehaviorSubject<Resource[]> = new BehaviorSubject(
    resources
  );

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/resource';
  }
  /**
   * Getter
   */
  get resource$(): Observable<Resource> {
    return this._resource.asObservable();
  }
  /**
   * Getter for _resources
   */
  get resources$(): Observable<Resource[]> {
    return this._resources.asObservable();
  }
  /**
   * Create function
   */
  createResource(id_user_: string, id_task: string): Observable<any> {
    return this._resources.pipe(
      take(1),
      switchMap((resources) =>
        this._httpClient
          .post(
            this._url + '/create',
            {
              id_user_: parseInt(id_user_),
              task: { id_task: parseInt(id_task) },
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
              const _resource: Resource = response.body;
              /**
               * Update the resource in the store
               */
              this._resources.next([_resource, ...resources]);

              return of(_resource);
            })
          )
      )
    );
  }
  /**
   * Read All Resource
   */
  readAllResource(): Observable<Resource[]> {
    return this._httpClient.get<Resource[]>(this._url + '/read/query-all').pipe(
      tap((resources: Resource[]) => {
        this._resources.next(resources);
      })
    );
  }
  /**
   * Read Resource by id
   * @param idResource
   */
  readResourceById(idResource: string): Observable<Resource> {
    return this._httpClient
      .get<Resource>(this._url + `/specificRead/${idResource}`)
      .pipe(
        tap((resources: Resource) => {
          return resources;
        })
      );
  }
  /**
   * byTaskRead
   * @param id_task
   */
  byTaskRead(id_task: string): Observable<Resource[]> {
    return this._httpClient
      .get<Resource[]>(this._url + `/byTaskRead/${id_task}`)
      .pipe(
        tap((resources: Resource[]) => {
          if (!resources) {
            this._resources.next([]);
            return [];
          } else {
            this._resources.next(resources);
            return resources;
          }
        })
      );
  }
  /**
   * Read Resource by id of local Observable
   */
  readResourceByIdLocal(id: string): Observable<Resource> {
    return this._resources.pipe(
      take(1),
      map((resources) => {
        /**
         * Find
         */
        const resource =
          resources.find((item) => item.id_resource == id) || null;
        /**
         * Update
         */
        this._resource.next(resource!);
        /**
         * Return
         */
        return resource;
      }),
      switchMap((resource) => {
        if (!resource) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(resource);
      })
    );
  }
  /**
   * Update resource
   * @param id_user_ that will be updated
   * @param resource
   */
  updateResource(resource: Resource): Observable<any> {
    return this.resources$.pipe(
      take(1),
      switchMap((resources) =>
        this._httpClient
          .patch(this._url + '/update', resource, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _resource: Resource = response.body;
              /**
               * Find the index of the updated resource
               */
              const index = resources.findIndex(
                (item) => item.id_resource == resource.id_resource
              );
              /**
               * Update the resource
               */
              resources[index] = _resource;
              /**
               * Update the resources
               */
              this._resources.next(resources);

              /**
               * Update the resource
               */
              this._resource.next(_resource);

              return of(_resource);
            })
          )
      )
    );
  }
  /**
   * Delete the resource
   * @param id
   */
  deleteResource(id_user_: string, id_resource: string): Observable<any> {
    return this.resources$.pipe(
      take(1),
      switchMap((resources) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_resource },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated resource
                 */
                const index = resources.findIndex(
                  (item) => item.id_resource == id_resource
                );
                /**
                 * Delete the object of array
                 */
                resources.splice(index, 1);
                /**
                 * Update the resources
                 */
                this._resources.next(resources);
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
