import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private _url: string;

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/business/home';
  }
  /**
   * readBox
   */
  readBox(): Observable<any> {
    return this._httpClient.get<any>(this._url + '/readBox').pipe(
      tap((periods: any) => {
        return periods;
      })
    );
  }
  /**
   * readDetails
   */
  readDetails(): Observable<any> {
    return this._httpClient.get<any>(this._url + '/readDetails').pipe(
      tap((details: any) => {
        return details;
      })
    );
  }
}
