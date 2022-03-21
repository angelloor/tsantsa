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
import { enrollment, enrollments } from './enrollment.data';
import { Enrollment } from './enrollment.types';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _enrollment: BehaviorSubject<Enrollment> = new BehaviorSubject(
    enrollment
  );
  private _enrollments: BehaviorSubject<Enrollment[]> = new BehaviorSubject(
    enrollments
  );

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/enrollment';
  }
  /**
   * Getter
   */
  get enrollment$(): Observable<Enrollment> {
    return this._enrollment.asObservable();
  }
  /**
   * Getter for _enrollments
   */
  get enrollments$(): Observable<Enrollment[]> {
    return this._enrollments.asObservable();
  }
  /**
   * Create function
   */
  createEnrollment(
    id_user_: string,
    id_course: string,
    id_user: string
  ): Observable<any> {
    return this._enrollments.pipe(
      take(1),
      switchMap((enrollments) =>
        this._httpClient
          .post(
            this._url + '/create',
            {
              id_user_: parseInt(id_user_),
              course: {
                id_course: parseInt(id_course),
              },
              user: {
                id_user: parseInt(id_user),
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
              const _enrollment: Enrollment = response.body;
              /**
               * Update the enrollment in the store
               */
              this._enrollments.next([_enrollment, ...enrollments]);

              return of(_enrollment);
            })
          )
      )
    );
  }
  /**
   * Read All Enrollment
   */
  readAllEnrollment(): Observable<Enrollment[]> {
    return this._httpClient
      .get<Enrollment[]>(this._url + '/read/query-all')
      .pipe(
        tap((enrollments: Enrollment[]) => {
          this._enrollments.next(enrollments);
        })
      );
  }
  /**
   * Read Enrollment by query
   * @param query
   */
  readEnrollmentByQuery(query: string): Observable<Enrollment[]> {
    return this._httpClient
      .get<Enrollment[]>(
        this._url + `/read/${query != '' ? query : 'query-all'}`
      )
      .pipe(
        tap((enrollments: Enrollment[]) => {
          this._enrollments.next(enrollments);
        })
      );
  }
  /**
   * Read Enrollment by id
   * @param idEnrollment
   */
  readEnrollmentById(idEnrollment: string): Observable<Enrollment> {
    return this._httpClient
      .get<Enrollment>(this._url + `/specificRead/${idEnrollment}`)
      .pipe(
        tap((enrollments: Enrollment) => {
          return enrollments;
        })
      );
  }
  /**
   * byCourseRead
   * @param id_course
   */
  byCourseRead(id_course: string): Observable<Enrollment[]> {
    return this._httpClient
      .get<Enrollment[]>(this._url + `/byCourseRead/${id_course}`)
      .pipe(
        tap((enrollments: Enrollment[]) => {
          if (!enrollments) {
            this._enrollments.next([]);
            return [];
          } else {
            this._enrollments.next(enrollments);
            return enrollments;
          }
        })
      );
  }
  /**
   * byUserRead
   * @param id_user
   */
  byUserRead(id_user: string): Observable<Enrollment[]> {
    return this._httpClient
      .get<Enrollment[]>(this._url + `/byUserRead/${id_user}`)
      .pipe(
        tap((enrollments: Enrollment[]) => {
          if (!enrollments) {
            this._enrollments.next([]);
            return [];
          } else {
            this._enrollments.next(enrollments);
            return enrollments;
          }
        })
      );
  }
  /**
   * Read Enrollment by id of local Observable
   */
  readEnrollmentByIdLocal(id: string): Observable<Enrollment> {
    return this._enrollments.pipe(
      take(1),
      map((enrollments) => {
        /**
         * Find
         */
        const enrollment =
          enrollments.find((item) => item.id_enrollment == id) || null;
        /**
         * Update
         */
        this._enrollment.next(enrollment!);
        /**
         * Return
         */
        return enrollment;
      }),
      switchMap((enrollment) => {
        if (!enrollment) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(enrollment);
      })
    );
  }
  /**
   * Update enrollment
   * @param id_user_ that will be updated
   * @param enrollment
   */
  updateEnrollment(enrollment: Enrollment): Observable<any> {
    return this.enrollments$.pipe(
      take(1),
      switchMap((enrollments) =>
        this._httpClient
          .patch(this._url + '/update', enrollment, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _enrollment: Enrollment = response.body;
              /**
               * Find the index of the updated enrollment
               */
              const index = enrollments.findIndex(
                (item) => item.id_enrollment == enrollment.id_enrollment
              );
              /**
               * Update the enrollment
               */
              enrollments[index] = _enrollment;
              /**
               * Update the enrollments
               */
              this._enrollments.next(enrollments);

              /**
               * Update the enrollment
               */
              this._enrollment.next(_enrollment);

              return of(_enrollment);
            })
          )
      )
    );
  }
  /**
   * Delete the enrollment
   * @param id
   */
  deleteEnrollment(id_user_: string, id_enrollment: string): Observable<any> {
    return this.enrollments$.pipe(
      take(1),
      switchMap((enrollments) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_enrollment },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated enrollment
                 */
                const index = enrollments.findIndex(
                  (item) => item.id_enrollment == id_enrollment
                );
                /**
                 * Delete the object of array
                 */
                enrollments.splice(index, 1);
                /**
                 * Update the enrollments
                 */
                this._enrollments.next(enrollments);
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
   * reportEnrollmentByCourse
   */
  reportEnrollmentByCourse(id_course: string): Observable<any> {
    return this._httpClient
      .post(
        this._url + `/reportEnrollmentByCourse`,
        {
          course: id_course,
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
