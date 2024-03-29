import { angelAnimations } from '@angel/animations';
import { AngelAlertType } from '@angel/components/alert';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppInitialData } from 'app/core/app/app.type';
import { SettingsCompanyService } from 'app/layout/common/settings-company/settings-company.service';
import { LayoutService } from 'app/layout/layout.service';
import { NewsletterService } from 'app/modules/core/newsletter/newsletter.service';
import { Newsletter } from 'app/modules/core/newsletter/newsletter.types';
import { TYPE_PROFILE } from 'app/modules/core/profile/profile.types';
import { UserService } from 'app/modules/core/user/user.service';
import {
  TYPE_USER,
  TYPE_USER_ENUM,
  User,
  _typeUser,
} from 'app/modules/core/user/user.types';
import { environment } from 'environments/environment';
import { Subject, takeUntil } from 'rxjs';
import { HomeService } from './home.service';
import { Box, _box, _details } from './home.type';
import { ModalViewNewsletterService } from './modal-view-newsletter/modal-view-newsletter.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  animations: angelAnimations,
})
export class HomeComponent implements OnInit {
  _urlPathAvatar: string = environment.urlBackend + '/resource/img/avatar/';
  avatar_user: string = '';

  lengthminimumDescription: number = 50;

  /**
   * Alert
   */
  alert: { type: AngelAlertType; message: string } = {
    type: 'info',
    message: '',
  };
  /**
   * Alert
   */

  id_company: string = '';

  private data!: AppInitialData;
  name_person: string = '';
  name_company: string = '';
  type_profile: TYPE_PROFILE = 'commonProfile';

  box: Box = _box;

  users: User[] = [];
  newsletters: Newsletter[] = [];

  typeUser: TYPE_USER_ENUM[] = _typeUser;

  info: any = _details;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _store: Store<{ global: AppInitialData }>,
    private _settingsCompanyService: SettingsCompanyService,
    private _layoutService: LayoutService,
    private _userService: UserService,
    private _homeService: HomeService,
    private _newsletterService: NewsletterService,
    private _modalViewNewsletterService: ModalViewNewsletterService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    /**
     * Subscribe to user changes of state
     */
    this._store.pipe(takeUntil(this._unsubscribeAll)).subscribe((state) => {
      this.data = state.global;
      this.id_company = this.data.user.company.id_company;
      this.avatar_user = this.data.user.avatar_user;
      this.name_person = this.data.user.person.name_person;
      this.name_company = this.data.user.company.name_company;
      this.type_profile = this.data.user.profile.type_profile;
    });
    /**
     * readBox
     */
    this._homeService
      .readBox()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_box: any) => {
        this.box = _box;
      });
    /**
     * readDetails
     */
    this._homeService
      .readDetails()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_details: any) => {
        this.info = _details;
      });
    /**
     * readAllUser
     */
    this._userService
      .readAllUser()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_users: User[]) => {
        this.users = _users;
      });
    /**
     * readAllUser
     */
    this._newsletterService
      .byCompanyRead(this.id_company)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_newsletters: Newsletter[]) => {
        this.newsletters = _newsletters;
      });
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  /**
   * openSettingsCompany
   */
  openSettingsCompany(): void {
    this._settingsCompanyService
      .openSettingsCompany(this.data.user.company.id_company)
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this._layoutService.setOpenModal(false);
      });
  }
  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------
  /**
   * getTypeSelectUser
   */
  getTypeSelectUser(type_validation: TYPE_USER): TYPE_USER_ENUM {
    return this.typeUser.find((user) => user.value_type == type_validation)!;
  }
  /**
   * minimumDescription
   * @param text
   * @returns string
   */
  minimumDescription(text: string): string {
    return `${text.slice(0, this.lengthminimumDescription)}...`;
  }
  /**
   * openModalViewNewsletter
   * @param newsletter
   */
  openModalViewNewsletter(newsletter: Newsletter): void {
    this._modalViewNewsletterService.openModalViewNewsletter(newsletter);
  }
}
