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
import { session, sessions } from './session.data';
import { Session } from './session.types';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _session: BehaviorSubject<Session> = new BehaviorSubject(session);
  private _sessions: BehaviorSubject<Session[]> = new BehaviorSubject(sessions);

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/core/session';
  }
  /**
   * Getter
   */
  get session$(): Observable<Session> {
    return this._session.asObservable();
  }
  /**
   * Getter for _sessions
   */
  get sessions$(): Observable<Session[]> {
    return this._sessions.asObservable();
  }
  /**
   * Read All Session
   */
  readAllSession(): Observable<Session[]> {
    return this._httpClient.get<Session[]>(this._url + '/read/query-all').pipe(
      tap((sessions: Session[]) => {
        this._sessions.next(sessions);
      })
    );
  }
  /**
   * Read Session by query
   * @param query
   */
  readSessionByQuery(query: string): Observable<Session[]> {
    return this._httpClient
      .get<Session[]>(this._url + `/read/${query != '' ? query : 'query-all'}`)
      .pipe(
        tap((sessions: Session[]) => {
          this._sessions.next(sessions);
        })
      );
  }
  /**
   * Read Session by id
   * @param idSession
   */
  readSessionById(idSession: string): Observable<Session> {
    return this._httpClient
      .get<Session>(this._url + `/specificRead/${idSession}`)
      .pipe(
        tap((sessions: Session) => {
          return sessions;
        })
      );
  }

  /**
   * byUserRead
   * @param idSession
   */
  byUserRead(id_user: string): Observable<Session> {
    return this._httpClient
      .get<Session>(this._url + `/byUserRead/${id_user}`)
      .pipe(
        tap((sessions: Session) => {
          return sessions;
        })
      );
  }
  /**
   * Read Session by id of local Observable
   */
  readSessionByIdLocal(id: string): Observable<Session> {
    return this._sessions.pipe(
      take(1),
      map((sessions) => {
        /**
         * Find
         */
        const session = sessions.find((item) => item.id_session == id) || null;
        /**
         * Update
         */
        this._session.next(session!);
        /**
         * Return
         */
        return session;
      }),
      switchMap((session) => {
        if (!session) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(session);
      })
    );
  }
  /**
   * bySessionRelease
   * @param id_user_ that will be updated
   * @param session
   */
  bySessionRelease(session: Session | any): Observable<any> {
    return this.sessions$.pipe(
      take(1),
      switchMap((sessions) =>
        this._httpClient
          .patch(this._url + '/bySessionRelease', session, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _session: Session = response.body;
              /**
               * Find the index of the updated session
               */
              const index = sessions.findIndex(
                (item) => item.id_session == session.id_session
              );
              /**
               * Update the session
               */
              sessions[index] = _session;
              /**
               * Update the sessions
               */
              this._sessions.next(sessions);

              /**
               * Update the session
               */
              this._session.next(_session);

              return of(_session);
            })
          )
      )
    );
  }
  /**
   * byUserReleaseAll
   * @param id_user_ that will be updated
   * @param session
   */
  byUserReleaseAll(session: Session | any): Observable<any> {
    return this.sessions$.pipe(
      take(1),
      switchMap((sessions) =>
        this._httpClient
          .patch(this._url + '/byUserReleaseAll', session, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * Find sessions of company
               */
              let session_users = sessions.filter(
                (item: any) => item.user.id_user == session.user.id_user
              );

              session_users.map((item: any, index: number) => {
                session_users[index] = {
                  ...item,
                  status_session: false,
                  date_sign_out_session: new Date(),
                };
              });
              /**
               * Update the sessions
               */
              this._sessions.next(session_users);

              return of(response);
            })
          )
      )
    );
  }
  /**
   * byCompanyReleaseAll
   * @param id_user_ that will be updated
   * @param session
   */
  byCompanyReleaseAll(session: Session | any): Observable<any> {
    return this.sessions$.pipe(
      take(1),
      switchMap((sessions) =>
        this._httpClient
          .patch(this._url + '/byCompanyReleaseAll', session, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * Find sessions of company
               */
              let session_company = sessions.filter(
                (item: any) =>
                  item.user.company.id_company ==
                  session.user.company.id_company
              );

              session_company.map((item: any, index: number) => {
                session_company[index] = {
                  ...item,
                  status_session: false,
                  date_sign_out_session: new Date(),
                };
              });
              /**
               * Update the sessions
               */
              this._sessions.next(session_company);

              return of(response);
            })
          )
      )
    );
  }
}
