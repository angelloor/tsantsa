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
import { systemEvent, systemEvents } from './system-event.data';
import { SystemEvent } from './system-event.types';

@Injectable({
  providedIn: 'root',
})
export class SystemEventService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _systemEvent: BehaviorSubject<SystemEvent> = new BehaviorSubject(
    systemEvent
  );
  private _systemEvents: BehaviorSubject<SystemEvent[]> = new BehaviorSubject(
    systemEvents
  );

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/core/system_event';
  }
  /**
   * Getter
   */
  get systemEvent$(): Observable<SystemEvent> {
    return this._systemEvent.asObservable();
  }
  /**
   * Getter for _systemEvents
   */
  get systemEvents$(): Observable<SystemEvent[]> {
    return this._systemEvents.asObservable();
  }
  /**
   * Create function
   */
  createSystemEvent(id_user_: string): Observable<any> {
    return this._systemEvents.pipe(
      take(1),
      switchMap((systemEvents) =>
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
              const _systemEvent: SystemEvent = response.body;
              /**
               * Update the systemEvent in the store
               */
              this._systemEvents.next([_systemEvent, ...systemEvents]);

              return of(_systemEvent);
            })
          )
      )
    );
  }
  /**
   * Read All SystemEvent
   */
  readAllSystemEvent(): Observable<SystemEvent[]> {
    return this._httpClient
      .get<SystemEvent[]>(this._url + '/read/query-all')
      .pipe(
        tap((systemEvents: SystemEvent[]) => {
          this._systemEvents.next(systemEvents);
        })
      );
  }
  /**
   * Read SystemEvent by query
   * @param query
   */
  readSystemEventByQuery(query: string): Observable<SystemEvent[]> {
    return this._httpClient
      .get<SystemEvent[]>(
        this._url + `/read/${query != '' ? query : 'query-all'}`
      )
      .pipe(
        tap((systemEvents: SystemEvent[]) => {
          this._systemEvents.next(systemEvents);
        })
      );
  }
  /**
   * Read SystemEvent by id
   * @param idSystemEvent
   */
  readSystemEventById(idSystemEvent: string): Observable<SystemEvent> {
    return this._httpClient
      .get<SystemEvent>(this._url + `/specificRead/${idSystemEvent}`)
      .pipe(
        tap((systemEvents: SystemEvent) => {
          return systemEvents;
        })
      );
  }
  /**
   * Read SystemEvent by id of local Observable
   */
  readSystemEventByIdLocal(id: string): Observable<SystemEvent> {
    return this._systemEvents.pipe(
      take(1),
      map((systemEvents) => {
        /**
         * Find
         */
        const systemEvent =
          systemEvents.find((item) => item.id_system_event == id) || null;
        /**
         * Update
         */
        this._systemEvent.next(systemEvent!);
        /**
         * Return
         */
        return systemEvent;
      }),
      switchMap((systemEvent) => {
        if (!systemEvent) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(systemEvent);
      })
    );
  }
  /**
   * Update systemEvent
   * @param id_user_ that will be updated
   * @param systemEvent
   */
  updateSystemEvent(systemEvent: SystemEvent): Observable<any> {
    return this.systemEvents$.pipe(
      take(1),
      switchMap((systemEvents) =>
        this._httpClient
          .patch(this._url + '/update', systemEvent, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _systemEvent: SystemEvent = response.body;
              /**
               * Find the index of the updated systemEvent
               */
              const index = systemEvents.findIndex(
                (item) => item.id_system_event == systemEvent.id_system_event
              );
              /**
               * Update the systemEvent
               */
              systemEvents[index] = _systemEvent;
              /**
               * Update the systemEvents
               */
              this._systemEvents.next(systemEvents);

              /**
               * Update the systemEvent
               */
              this._systemEvent.next(_systemEvent);

              return of(_systemEvent);
            })
          )
      )
    );
  }
  /**
   * Delete the systemEvent
   * @param id
   */
  deleteSystemEvent(
    id_user_: string,
    id_system_event: string
  ): Observable<any> {
    return this.systemEvents$.pipe(
      take(1),
      switchMap((systemEvents) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_system_event },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated systemEvent
                 */
                const index = systemEvents.findIndex(
                  (item) => item.id_system_event == id_system_event
                );
                /**
                 * Delete the object of array
                 */
                systemEvents.splice(index, 1);
                /**
                 * Update the systemEvents
                 */
                this._systemEvents.next(systemEvents);
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
