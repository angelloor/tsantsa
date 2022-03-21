import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private _url: string;

  constructor(private _httpClient: HttpClient) {
    this._url = environment.urlBackend + '/app/report';
  }
  /**
   * Delete the course
   * @param name_report
   */
  deleteReport(id_user_: string, name_report: string): Observable<any> {
    return this._httpClient
      .delete(this._url + `/delete`, {
        params: { id_user_, name_report },
      })
      .pipe(map((response: any) => response));
  }
}
