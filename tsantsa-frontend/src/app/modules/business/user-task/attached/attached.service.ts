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
} from 'rxjs';
import { attached, attacheds } from './attached.data';
import { Attached } from './attached.types';

@Injectable({
  providedIn: 'root',
})
export class AttachedService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _attached: BehaviorSubject<Attached> = new BehaviorSubject(attached);
  private _attacheds: BehaviorSubject<Attached[]> = new BehaviorSubject(
    attacheds
  );

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/attached';
  }
  /**
   * Getter
   */
  get attached$(): Observable<Attached> {
    return this._attached.asObservable();
  }
  /**
   * Getter for _attacheds
   */
  get attacheds$(): Observable<Attached[]> {
    return this._attacheds.asObservable();
  }
  /**
   * Create function
   */
  createAttached(
    id_user_: string,
    id_user_task: string,
    file_name: string,
    length_mb: string,
    extension: string,
    file: File
  ): Observable<any> {
    var formData = new FormData();

    formData.append('id_user_', id_user_);
    formData.append('id_user_task', id_user_task);
    formData.append('file_name', file_name);
    formData.append('length_mb', length_mb);
    formData.append('extension', extension);
    formData.append('file', file);

    return this._attacheds.pipe(
      take(1),
      switchMap((attacheds) =>
        this._httpClient.post(this._url + '/create', formData).pipe(
          switchMap((response: any) => {
            /**
             * check the response body to match with the type
             */
            const _attached: Attached = response.body;
            /**
             * Update the attached in the store
             */
            this._attacheds.next([_attached, ...attacheds]);

            return of(_attached);
          })
        )
      )
    );
  }
  /**
   * Read All Attached
   */
  readAllAttached(): Observable<Attached[]> {
    return this._httpClient.get<Attached[]>(this._url + '/read/query-all').pipe(
      tap((attacheds: Attached[]) => {
        this._attacheds.next(attacheds);
      })
    );
  }
  /**
   * Read Attached by query
   * @param query
   */
  readAttachedByQuery(query: string): Observable<Attached[]> {
    return this._httpClient
      .get<Attached[]>(this._url + `/read/${query != '' ? query : 'query-all'}`)
      .pipe(
        tap((attacheds: Attached[]) => {
          this._attacheds.next(attacheds);
        })
      );
  }
  /**
   * Read Attached by id
   * @param idAttached
   */
  readAttachedById(idAttached: string): Observable<Attached> {
    return this._httpClient
      .get<Attached>(this._url + `/specificRead/${idAttached}`)
      .pipe(
        tap((attacheds: Attached) => {
          return attacheds;
        })
      );
  }
  /**
   * byUserTaskRead
   * @param idAttached
   */
  byUserTaskRead(id_user_task: string): Observable<Attached[]> {
    return this._httpClient
      .get<Attached[]>(this._url + `/byUserTaskRead/${id_user_task}`)
      .pipe(
        tap((attacheds: Attached[]) => {
          if (!attacheds) {
            this._attacheds.next([]);
            return [];
          } else {
            this._attacheds.next(attacheds);
            return attacheds;
          }
        })
      );
  }
  /**
   * Delete the attached
   * @param id_user_
   */
  deleteAttached(id_user_: string, id_attached: string): Observable<any> {
    return this.attacheds$.pipe(
      take(1),
      switchMap((attacheds) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_attached },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated attached
                 */
                const index = attacheds.findIndex(
                  (item) => item.id_attached == id_attached
                );
                /**
                 * Delete the object of array
                 */
                attacheds.splice(index, 1);
                /**
                 * Update the attacheds
                 */
                this._attacheds.next(attacheds);
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
