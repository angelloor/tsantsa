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
import { newsletter, newsletters } from './newsletter.data';
import { Newsletter } from './newsletter.types';

@Injectable({
  providedIn: 'root',
})
export class NewsletterService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _newsletter: BehaviorSubject<Newsletter> = new BehaviorSubject(
    newsletter
  );
  private _newsletters: BehaviorSubject<Newsletter[]> = new BehaviorSubject(
    newsletters
  );

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/core/newsletter';
  }
  /**
   * Getter
   */
  get newsletter$(): Observable<Newsletter> {
    return this._newsletter.asObservable();
  }
  /**
   * Getter for _newsletters
   */
  get newsletters$(): Observable<Newsletter[]> {
    return this._newsletters.asObservable();
  }
  /**
   * Create function
   */
  createNewsletter(id_user_: string, id_company: string): Observable<any> {
    return this._newsletters.pipe(
      take(1),
      switchMap((newsletters) =>
        this._httpClient
          .post(
            this._url + '/create',
            {
              id_user_: parseInt(id_user_),
              company: {
                id_company: parseInt(id_company),
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
              const _newsletter: Newsletter = response.body;
              /**
               * Update the newsletter in the store
               */
              this._newsletters.next([_newsletter, ...newsletters]);

              return of(_newsletter);
            })
          )
      )
    );
  }
  /**
   * Read All Newsletter
   */
  readAllNewsletter(): Observable<Newsletter[]> {
    return this._httpClient
      .get<Newsletter[]>(this._url + '/read/query-all')
      .pipe(
        tap((newsletters: Newsletter[]) => {
          this._newsletters.next(newsletters);
        })
      );
  }
  /**
   * Read Newsletter by query
   * @param query
   */
  readNewsletterByQuery(query: string): Observable<Newsletter[]> {
    return this._httpClient
      .get<Newsletter[]>(
        this._url + `/read/${query != '' ? query : 'query-all'}`
      )
      .pipe(
        tap((newsletters: Newsletter[]) => {
          this._newsletters.next(newsletters);
        })
      );
  }
  /**
   * Read Newsletter by id
   * @param idNewsletter
   */
  readNewsletterById(idNewsletter: string): Observable<Newsletter> {
    return this._httpClient
      .get<Newsletter>(this._url + `/specificRead/${idNewsletter}`)
      .pipe(
        tap((newsletters: Newsletter) => {
          return newsletters;
        })
      );
  }
  /**
   * byCompanyRead
   * @param id_company
   */
  byCompanyRead(id_company: string): Observable<Newsletter[]> {
    return this._httpClient
      .get<Newsletter[]>(this._url + `/byCompanyRead/${id_company}`)
      .pipe(
        tap((newsletters: Newsletter[]) => {
          if (newsletters) {
            this._newsletters.next(newsletters);
          } else {
            this._newsletters.next([]);
          }
        })
      );
  }
  /**
   * Read Newsletter by id of local Observable
   */
  readNewsletterByIdLocal(id: string): Observable<Newsletter> {
    return this._newsletters.pipe(
      take(1),
      map((newsletters) => {
        /**
         * Find
         */
        const newsletter =
          newsletters.find((item) => item.id_newsletter == id) || null;
        /**
         * Update
         */
        this._newsletter.next(newsletter!);
        /**
         * Return
         */
        return newsletter;
      }),
      switchMap((newsletter) => {
        if (!newsletter) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(newsletter);
      })
    );
  }
  /**
   * Update newsletter
   * @param id_user_ that will be updated
   * @param newsletter
   */
  updateNewsletter(newsletter: Newsletter): Observable<any> {
    return this.newsletters$.pipe(
      take(1),
      switchMap((newsletters) =>
        this._httpClient
          .patch(this._url + '/update', newsletter, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _newsletter: Newsletter = response.body;
              /**
               * Find the index of the updated newsletter
               */
              const index = newsletters.findIndex(
                (item) => item.id_newsletter == newsletter.id_newsletter
              );

              /**
               * Update the newsletter
               */
              newsletters[index] = _newsletter;
              /**
               * Update the newsletters
               */
              this._newsletters.next(newsletters);

              /**
               * Update the newsletter
               */
              this._newsletter.next(_newsletter);

              return of(_newsletter);
            })
          )
      )
    );
  }
  /**
   * Delete the newsletter
   * @param id
   */
  deleteNewsletter(id_user_: string, id_newsletter: string): Observable<any> {
    return this.newsletters$.pipe(
      take(1),
      switchMap((newsletters) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_newsletter },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated newsletter
                 */
                const index = newsletters.findIndex(
                  (item) => item.id_newsletter == id_newsletter
                );

                /**
                 * Delete the object of array
                 */
                newsletters.splice(index, 1);
                /**
                 * Update the newsletters
                 */
                this._newsletters.next(newsletters);
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
