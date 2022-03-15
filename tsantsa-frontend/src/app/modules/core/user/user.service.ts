import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppInitialData } from 'app/core/app/app.type';
import { updateAvatar } from 'app/store/global/global.actions';
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
import { user, users } from './user.data';
import { User } from './user.types';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _user: BehaviorSubject<User> = new BehaviorSubject(user);
  private _users: BehaviorSubject<User[]> = new BehaviorSubject(users);

  constructor(
    private _httpClient: HttpClient,
    private _store: Store<{ global: AppInitialData }>
  ) {
    this._url = environment.urlBackend + '/app/core/user';
  }

  /**
   * Getter
   */
  get user$(): Observable<User> {
    return this._user.asObservable();
  }
  /**
   * Getter for _users
   */
  get users$(): Observable<User[]> {
    return this._users.asObservable();
  }
  /**
   * Create function
   */
  createUser(id_user_: string): Observable<any> {
    return this._users.pipe(
      take(1),
      switchMap((users) =>
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
              const _user: User = response.body;
              /**
               * Update the user in the store
               */
              this._users.next([_user, ...users]);

              return of(_user);
            })
          )
      )
    );
  }
  /**
   * Read All User
   */
  readAllUser(): Observable<User[]> {
    return this._httpClient.get<User[]>(this._url + '/read/query-all').pipe(
      tap((users: User[]) => {
        this._users.next(users);
      })
    );
  }
  /**
   * Read User by query
   * @param query
   */
  readUserByQuery(query: string): Observable<User[]> {
    return this._httpClient
      .get<User[]>(this._url + `/read/${query != '' ? query : 'query-all'}`)
      .pipe(
        tap((users: User[]) => {
          this._users.next(users);
        })
      );
  }
  /**
   * Read User by id
   * @param idUser
   */
  readUserById(idUser: string): Observable<User> {
    return this._httpClient
      .get<User>(this._url + `/specificRead/${idUser}`)
      .pipe(
        tap((users: User) => {
          return users;
        })
      );
  }
  /**
   * Read User by id of local Observable
   */
  readUserByIdLocal(id: string): Observable<User> {
    return this._users.pipe(
      take(1),
      map((users) => {
        /**
         * Find
         */
        const user = users.find((item) => item.id_user == id) || null;
        /**
         * Update
         */
        this._user.next(user!);
        /**
         * Return
         */
        return user;
      }),
      switchMap((user) => {
        if (!user) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(user);
      })
    );
  }
  /**
   * Update user
   * @param id_user_ that will be updated
   * @param user
   */
  updateUser(user: User): Observable<any> {
    return this.users$.pipe(
      take(1),
      switchMap((users) =>
        this._httpClient
          .patch(this._url + '/update', user, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _user: User = response.body;
              /**
               * Find the index of the updated user
               */
              const index = users.findIndex(
                (item) => item.id_user == user.id_user
              );
              /**
               * Update the user
               */
              users[index] = _user;
              /**
               * Update the users
               */
              this._users.next(users);

              /**
               * Update the user
               */
              this._user.next(_user);

              return of(_user);
            })
          )
      )
    );
  }
  /**
   * Delete the user
   * @param id
   */
  deleteUser(id_user_: string, id_user: string): Observable<any> {
    return this.users$.pipe(
      take(1),
      switchMap((users) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_user },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated user
                 */
                const index = users.findIndex(
                  (item) => item.id_user == id_user
                );
                /**
                 * Delete the object of array
                 */
                users.splice(index, 1);
                /**
                 * Update the users
                 */
                this._users.next(users);
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
   * Update avatar
   */
  uploadAvatar(
    user: User,
    avatar: File,
    UserLoggedIn: User
  ): Observable<boolean> {
    var formData = new FormData();

    formData.append('avatar', avatar);
    formData.append('id_user', user.id_user);

    return this.users$.pipe(
      take(1),
      switchMap((users) =>
        this._httpClient.post(this._url + '/uploadAvatar', formData).pipe(
          switchMap((response: any) => {
            const avatar_user: string = response.body.new_path;

            const index = users.findIndex(
              (item) => item.id_user === user.id_user
            );

            users[index] = {
              ...users[index],
              avatar_user,
            };

            this._users.next(users);
            this._user.next({
              ...users[index],
              avatar_user,
            });

            if (user.id_user == UserLoggedIn.id_user) {
              // Update the avatar in the store
              this._store.dispatch(
                updateAvatar({
                  ...user,
                  avatar_user,
                })
              );
            }

            return of(true);
          })
        )
      )
    );
  }
  /**
   * removeAvatar
   */
  removeAvatar(user: User, UserLoggedIn: User): Observable<boolean> {
    return this.users$.pipe(
      take(1),
      switchMap((users) =>
        this._httpClient
          .post(this._url + '/removeAvatar', { id_user: user.id_user })
          .pipe(
            switchMap(() => {
              const index = users.findIndex(
                (item) => item.id_user === user.id_user
              );

              users[index] = {
                ...users[index],
                avatar_user: 'default.svg',
              };

              this._users.next(users);
              this._user.next({
                ...users[index],
                avatar_user: 'default.svg',
              });

              if (user.id_user == UserLoggedIn.id_user) {
                // Update the avatar in the store
                this._store.dispatch(
                  updateAvatar({
                    ...users[index],
                    avatar_user: 'default.svg',
                  })
                );
              }

              return of(true);
            })
          )
      )
    );
  }
}
