import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LayoutService } from 'app/layout/layout.service';
import { company } from 'app/modules/core/company/company.data';
import { Company } from 'app/modules/core/company/company.types';
import { BehaviorSubject, Observable } from 'rxjs';
import { SettingsCompanyComponent } from './settings-company.component';

@Injectable({
  providedIn: 'root',
})
export class SettingsCompanyService {
  private _myCompany: BehaviorSubject<Company> = new BehaviorSubject(company);

  constructor(
    private _dialog: MatDialog,
    private _layoutService: LayoutService
  ) {}

  /**
   * Getter
   */
  get myCompany$(): Observable<Company> {
    return this._myCompany.asObservable();
  }

  openSettingsCompany(id_company: string) {
    this._layoutService.setOpenModal(true);
    return this._dialog.open(SettingsCompanyComponent, {
      minHeight: 'inherit',
      maxHeight: '90vh',
      height: 'auto',
      width: '40rem',
      maxWidth: '',
      panelClass: ['mat-dialog-cont'],
      data: { id_company },
    });
  }

  closeSettingsCompany() {
    this._dialog.closeAll();
  }
}
