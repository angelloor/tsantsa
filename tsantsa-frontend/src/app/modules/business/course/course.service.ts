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
import { course, courses } from './course.data';
import { Course } from './course.types';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _course: BehaviorSubject<Course> = new BehaviorSubject(course);
  private _courses: BehaviorSubject<Course[]> = new BehaviorSubject(courses);

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/course';
  }
  /**
   * Getter
   */
  get course$(): Observable<Course> {
    return this._course.asObservable();
  }
  /**
   * Getter for _courses
   */
  get courses$(): Observable<Course[]> {
    return this._courses.asObservable();
  }
  /**
   * Create function
   */
  createCourse(id_user_: string): Observable<any> {
    return this._courses.pipe(
      take(1),
      switchMap((courses) =>
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
              const _course: Course = response.body;
              /**
               * Update the course in the store
               */
              this._courses.next([_course, ...courses]);

              return of(_course);
            })
          )
      )
    );
  }
  /**
   * Read All Course
   */
  readAllCourse(): Observable<Course[]> {
    return this._httpClient.get<Course[]>(this._url + '/read/query-all').pipe(
      tap((courses: Course[]) => {
        this._courses.next(courses);
      })
    );
  }
  /**
   * Read Course by query
   * @param query
   */
  readCourseByQuery(query: string): Observable<Course[]> {
    return this._httpClient
      .get<Course[]>(this._url + `/read/${query != '' ? query : 'query-all'}`)
      .pipe(
        tap((courses: Course[]) => {
          this._courses.next(courses);
        })
      );
  }
  /**
   * Read Course by id
   * @param idCourse
   */
  readCourseById(idCourse: string): Observable<Course> {
    return this._httpClient
      .get<Course>(this._url + `/specificRead/${idCourse}`)
      .pipe(
        tap((courses: Course) => {
          return courses;
        })
      );
  }
  /**
   * Read Course by id of local Observable
   */
  readCourseByIdLocal(id: string): Observable<Course> {
    return this._courses.pipe(
      take(1),
      map((courses) => {
        /**
         * Find
         */
        const course = courses.find((item) => item.id_course == id) || null;
        /**
         * Update
         */
        this._course.next(course!);
        /**
         * Return
         */
        return course;
      }),
      switchMap((course) => {
        if (!course) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(course);
      })
    );
  }
  /**
   * Update course
   * @param id_user_ that will be updated
   * @param course
   */
  updateCourse(course: Course): Observable<any> {
    return this.courses$.pipe(
      take(1),
      switchMap((courses) =>
        this._httpClient
          .patch(this._url + '/update', course, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _course: Course = response.body;
              /**
               * Find the index of the updated course
               */
              const index = courses.findIndex(
                (item) => item.id_course == course.id_course
              );
              /**
               * Update the course
               */
              courses[index] = _course;
              /**
               * Update the courses
               */
              this._courses.next(courses);

              /**
               * Update the course
               */
              this._course.next(_course);

              return of(_course);
            })
          )
      )
    );
  }
  /**
   * Delete the course
   * @param id
   */
  deleteCourse(id_user_: string, id_course: string): Observable<any> {
    return this.courses$.pipe(
      take(1),
      switchMap((courses) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_course },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated course
                 */
                const index = courses.findIndex(
                  (item) => item.id_course == id_course
                );
                /**
                 * Delete the object of array
                 */
                courses.splice(index, 1);
                /**
                 * Update the courses
                 */
                this._courses.next(courses);
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
   * reportCourseByPeriod
   */
  reportCourseByPeriod(id_period: string): Observable<any> {
    return this._httpClient
      .post(
        this._url + `/reportCourseByPeriod`,
        {
          period: {
            id_period,
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
