import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, of, switchMap, take, tap } from 'rxjs';
import {
  profileNavigation,
  profileNavigations,
} from './profile-navigation.data';
import { ProfileNavigation } from './profile-navigation.types';

@Injectable({
  providedIn: 'root',
})
export class ProfileNavigationService {
  private _url: string;
  private _headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _profileNavigation: BehaviorSubject<ProfileNavigation> =
    new BehaviorSubject(profileNavigation);
  private _profileNavigations: BehaviorSubject<ProfileNavigation[]> =
    new BehaviorSubject(profileNavigations);

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/core/profile_navigation';
  }
  /**
   * Getter
   */
  get profileNavigation$(): Observable<ProfileNavigation> {
    return this._profileNavigation.asObservable();
  }
  /**
   * Getter for _profileNavigations
   */
  get profileNavigations$(): Observable<ProfileNavigation[]> {
    return this._profileNavigations.asObservable();
  }
  /**
   * Create function
   */
  createProfileNavigation(
    id_user_: string,
    id_profile: string
  ): Observable<any> {
    return this._profileNavigations.pipe(
      take(1),
      switchMap((profileNavigations) =>
        this._httpClient
          .post(
            this._url + '/create',
            {
              id_user_: parseInt(id_user_),
              profile: {
                id_profile: parseInt(id_profile),
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
              const _profileNavigation: ProfileNavigation = response.body;
              /**
               * Update the profileNavigation in the store
               */
              this._profileNavigations.next([
                ...profileNavigations,
                _profileNavigation,
              ]);

              return of(_profileNavigation);
            })
          )
      )
    );
  }
  /**
   * readProfileNavigationByProfile
   * @param query
   */
  readProfileNavigationByProfile(
    id_profile: string
  ): Observable<ProfileNavigation[]> {
    return this._httpClient
      .get<ProfileNavigation[]>(this._url + `/byProfileRead/${id_profile}`)
      .pipe(
        tap((profileNavigations: ProfileNavigation[]) => {
          this._profileNavigations.next(profileNavigations);
        })
      );
  }
  /**
   * Read ProfileNavigation by id
   * @param idProfileNavigation
   */
  readProfileNavigationById(
    idProfileNavigation: string
  ): Observable<ProfileNavigation> {
    return this._httpClient
      .get<ProfileNavigation>(
        this._url + `/specificRead/${idProfileNavigation}`
      )
      .pipe(
        tap((profileNavigations: ProfileNavigation) => {
          return profileNavigations;
        })
      );
  }
  /**
   * Update profileNavigation
   * @param id_user_ that will be updated
   * @param profileNavigation
   */
  updateProfileNavigation(
    profileNavigation: ProfileNavigation
  ): Observable<any> {
    return this.profileNavigations$.pipe(
      take(1),
      switchMap((profileNavigations) =>
        this._httpClient
          .patch(this._url + '/update', profileNavigation, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
              /**
               * check the response body to match with the type
               */
              const _profileNavigation: ProfileNavigation = response.body;
              /**
               * Find the index of the updated profileNavigation
               */
              const index = profileNavigations.findIndex(
                (item) =>
                  item.id_profile_navigation ==
                  profileNavigation.id_profile_navigation
              );
              /**
               * Update the profileNavigation
               */
              profileNavigations[index] = _profileNavigation;
              /**
               * Update the profileNavigations
               */
              this._profileNavigations.next(profileNavigations);

              /**
               * Update the profileNavigation
               */
              this._profileNavigation.next(_profileNavigation);

              return of(_profileNavigation);
            })
          )
      )
    );
  }
  /**
   * Delete the profileNavigation
   * @param id
   */
  deleteProfileNavigation(
    id_user_: string,
    id_profile_navigation: string
  ): Observable<any> {
    return this.profileNavigations$.pipe(
      take(1),
      switchMap((profileNavigations) =>
        this._httpClient
          .delete(this._url + `/delete`, {
            params: { id_user_, id_profile_navigation },
          })
          .pipe(
            switchMap((response: any) => {
              if (response && response.body) {
                /**
                 * Find the index of the updated profileNavigation
                 */
                const index = profileNavigations.findIndex(
                  (item) => item.id_profile_navigation == id_profile_navigation
                );
                /**
                 * Delete the object of array
                 */
                profileNavigations.splice(index, 1);
                /**
                 * Update the profileNavigations
                 */
                this._profileNavigations.next(profileNavigations);
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
