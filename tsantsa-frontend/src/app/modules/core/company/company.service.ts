import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
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
import { company, companys } from './company.data';
import { Company } from './company.types';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _company: BehaviorSubject<Company> = new BehaviorSubject(company);
  private _companys: BehaviorSubject<Company[]> = new BehaviorSubject(companys);

  constructor(private _httpClient: HttpClient, private _router: Router) {
    this._url = environment.urlBackend + '/app/core/company';
  }
  /**
   * Getter
   */
  get company$(): Observable<Company> {
    return this._company.asObservable();
  }
  /**
   * Getter for _companys
   */
  get companys$(): Observable<Company[]> {
    return this._companys.asObservable();
  }
  /**
   * Create function
   */
  createCompany(id_user_: string): Observable<any> {
    return this._companys.pipe(
      take(1),
      switchMap((companys) =>
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
              const _company: Company = response.body;
              /**
               * Update the company in the store
               */
              this._companys.next([_company, ...companys]);

              return of(_company);
            })
          )
      )
    );
  }
  /**
   * Read All Company
   */
  readAllCompany(): Observable<Company[] | any> {
    return this._httpClient
      .get<Company[] | any>(this._url + '/read/query-all')
      .pipe(
        tap((companys: Company[]) => {
          this._companys.next(companys);
        })
      );
  }
  /**
   * Read Company by query
   * @param query
   */
  readCompanyByQuery(query: string): Observable<Company[]> {
    return this._httpClient
      .get<Company[]>(this._url + `/read/${query != '' ? query : 'query-all'}`)
      .pipe(
        tap((companys: Company[]) => {
          this._companys.next(companys);
        })
      );
  }
  /**
   * Read Company by id
   * @param idCompany
   */
  readCompanyById(idCompany: string): Observable<Company> {
    return this._httpClient
      .get<Company>(this._url + `/specificRead/${idCompany}`)
      .pipe(
        tap((companys: Company) => {
          return companys;
        })
      );
  }
  /**
   * Read Company by id of local Observable
   */
  readCompanyByIdLocal(id: string): Observable<Company> {
    return this._companys.pipe(
      take(1),
      map((companys) => {
        /**
         * Find
         */
        const company = companys.find((item) => item.id_company == id) || null;
        /**
         * Update
         */
        this._company.next(company!);
        /**
         * Return
         */
        return company;
      }),
      switchMap((company) => {
        if (!company) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(company);
      })
    );
  }
  /**
   * Update company
   * @param id_user_ that will be updated
   * @param company
   */
  updateCompany(company: Company): Observable<any> {
    return this.companys$.pipe(
      take(1),
      switchMap((companys) =>
        this._httpClient
          .patch(this._url + '/update', company, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _company: Company = response.body;
              /**
               * Find the index of the updated company
               */
              const index = companys.findIndex(
                (item) => item.id_company == company.id_company
              );
              /**
               * Update the company
               */
              companys[index] = _company;
              /**
               * Update the companys
               */
              this._companys.next(companys);

              /**
               * Update the company
               */
              this._company.next(_company);

              return of(_company);
            })
          )
      )
    );
  }
  /**
   * Delete the company
   * @param id
   */
  deleteCompany(id_user_: string, id_company: string): Observable<any> {
    return this.companys$.pipe(
      take(1),
      switchMap((companys) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_company },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated company
                 */
                const index = companys.findIndex(
                  (item) => item.id_company == id_company
                );
                /**
                 * Delete the object of array
                 */
                companys.splice(index, 1);
                /**
                 * Update the companys
                 */
                this._companys.next(companys);
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
