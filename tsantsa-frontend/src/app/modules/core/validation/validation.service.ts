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
import { validation, validations } from './validation.data';
import { TYPE_VALIDATION, Validation } from './validation.types';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _validation: BehaviorSubject<Validation> = new BehaviorSubject(
    validation
  );
  private _validations: BehaviorSubject<Validation[]> = new BehaviorSubject(
    validations
  );
  private _validationsActive: BehaviorSubject<Validation[]> =
    new BehaviorSubject(validations);

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/core/validation';
  }
  /**
   * Getter
   */
  get validation$(): Observable<Validation> {
    return this._validation.asObservable();
  }
  /**
   * Getter for _validations
   */
  get validations$(): Observable<Validation[]> {
    return this._validations.asObservable();
  }
  /**
   * Getter for _validationsActive
   */
  get validationsActive$(): Observable<Validation[]> {
    return this._validationsActive.asObservable();
  }
  /**
   * Create function
   */
  createValidation(
    id_user_: string,
    type_validation: TYPE_VALIDATION
  ): Observable<any> {
    return this._validations.pipe(
      take(1),
      switchMap((validations) =>
        this._httpClient
          .post(
            this._url + '/create',
            {
              id_user_: parseInt(id_user_),
              type_validation,
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
              const _validation: Validation = response.body;
              /**
               * Update the validation in the store
               */
              this._validations.next([_validation, ...validations]);

              return of(_validation);
            })
          )
      )
    );
  }
  /**
   * Read All Validation
   */
  readAllValidation(): Observable<Validation[]> {
    return this._httpClient
      .get<Validation[]>(this._url + '/read/query-all')
      .pipe(
        tap((validations: Validation[]) => {
          this._validations.next(validations);
        })
      );
  }
  /**
   * Read Validation by query
   * @param query
   */
  readValidationByQuery(query: string): Observable<Validation[]> {
    return this._httpClient
      .get<Validation[]>(
        this._url + `/read/${query != '' ? query : 'query-all'}`
      )
      .pipe(
        tap((validations: Validation[]) => {
          this._validations.next(validations);
        })
      );
  }
  /**
   * byTypeValidationRead
   * @param idValidation
   */
  byTypeValidationRead(
    type_validation: TYPE_VALIDATION
  ): Observable<Validation> {
    return this._validationsActive.pipe(
      take(1),
      switchMap((validationsActive: any) =>
        this._httpClient
          .get<Validation>(
            this._url + `/byTypeValidationRead/${type_validation}`
          )
          .pipe(
            tap((validation: Validation) => {
              if (!(validation == null)) {
                this._validationsActive.next([
                  validation,
                  ...validationsActive,
                ]);
              }
            })
          )
      )
    );
  }
  /**
   * Read Validation by id
   * @param idValidation
   */
  readValidationById(idValidation: string): Observable<Validation> {
    return this._httpClient
      .get<Validation>(this._url + `/specificRead/${idValidation}`)
      .pipe(
        tap((validations: Validation) => {
          return validations;
        })
      );
  }
  /**
   * Read Validation by id of local Observable
   */
  readValidationByIdLocal(id: string): Observable<Validation> {
    return this._validations.pipe(
      take(1),
      map((validations) => {
        /**
         * Find
         */
        const validation =
          validations.find((item) => item.id_validation == id) || null;
        /**
         * Update
         */
        this._validation.next(validation!);
        /**
         * Return
         */
        return validation;
      }),
      switchMap((validation) => {
        if (!validation) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(validation);
      })
    );
  }
  /**
   * Update validation
   * @param id_user_ that will be updated
   * @param validation
   */
  updateValidation(validation: Validation): Observable<any> {
    return this.validations$.pipe(
      take(1),
      switchMap((validations) =>
        this._httpClient
          .patch(this._url + '/update', validation, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _validation: Validation = response.body;
              /**
               * Find the index of the updated validation
               */
              const index = validations.findIndex(
                (item) => item.id_validation == validation.id_validation
              );
              /**
               * Update the validation
               */
              validations[index] = _validation;
              /**
               * Update the validations
               */
              this._validations.next(validations);

              /**
               * Update the validation
               */
              this._validation.next(_validation);

              if (!validation.status_validation) {
                this.resetValidationActive();
              }

              return of(_validation);
            })
          )
      )
    );
  }
  /**
   * Delete the validation
   * @param id
   */
  deleteValidation(id_user_: string, id_validation: string): Observable<any> {
    return this.validations$.pipe(
      take(1),
      switchMap((validations) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_validation },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated validation
                 */
                const index = validations.findIndex(
                  (item) => item.id_validation == id_validation
                );
                /**
                 * Delete the object of array
                 */
                validations.splice(index, 1);
                /**
                 * Update the validations
                 */
                this._validations.next(validations);
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
   * resetValidationActive
   */
  resetValidationActive() {
    this._validationsActive.next([]);
  }
}
