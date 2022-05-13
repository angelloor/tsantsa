import fs from 'fs';
import path from 'path';
import { utils_get_columns_backend, utils_table_exists } from './dev.store';
import { AttributeList, BodyFrontendGenerate } from './utils/dev.types';
import {
	entityReplaceUnderscore,
	entityToLowerCase,
	entityToUpperCase,
	entityToUpperCaseOutInitial,
} from './utils/dev.utils';

const entityFrontendGenerate = (body: BodyFrontendGenerate) => {
	return new Promise<string>((resolve, reject) => {
		utils_table_exists(body.scheme, body.entity)
			.then(async (count) => {
				if (count == 1) {
					const basePath = path.join(__dirname, body.pathToCreate);
					let columns: [];
					/**
					 * Generate folder for the entity
					 */
					generateFolder(basePath);
					/**
					 * Get columns of the entity
					 */
					await utils_get_columns_backend(body.scheme, body.entity)
						.then((columnsEntity) => {
							columns = columnsEntity;

							generateType(basePath, body.entity, columns);
							generateData(basePath, body.entity, columns);
							generateService(
								basePath,
								body.scheme,
								body.entity,
								columns,
								body.attributeList
							);
							generateResolver(basePath, body.entity);
							generateHtml(basePath, body.entity);
							generateComponent(basePath, body.entity);
							/**
							 * Child components
							 */
							generateListHtml(
								basePath,
								body.entity,
								body.nameVisibility,
								body.attributeList,
								columns
							);
							generateListComponent(
								basePath,
								body.entity,
								body.nameVisibility,
								columns
							);
							generateDetailsHtml(basePath, body.entity, columns);
							generateDetailsComponent(
								basePath,
								body.entity,
								body.nameVisibility,
								columns
							);
							/**
							 *
							 */
							generateGuard(basePath, body.entity);
							generateRouting(basePath, body.entity);
							generateModule(basePath, body.entity);
						})
						.catch((error) => {
							reject(error);
						});
					resolve('ok');
				} else {
					reject('La entidad no existe en la base de datos');
				}
			})
			.catch((error) => {
				reject(error);
			});
	});
};

const generateFolder = (basePath: string) => {
	if (!fs.existsSync(basePath)) {
		fs.mkdirSync(`${basePath}`);
	}

	if (
		fs.existsSync(basePath) &&
		!fs.existsSync(`${basePath}details`) &&
		!fs.existsSync(`${basePath}list`)
	) {
		fs.mkdirSync(`${basePath}details`);
		fs.mkdirSync(`${basePath}list`);
	}
};

const generateHtml = (basePath: string, entity: string) => {
	const pathToCreate: string = `${basePath}${entityReplaceUnderscore(
		entity
	)}.component.html`;

	const contentHtml: string = `
	<router-outlet></router-outlet>
	`;
	/**
	 * Generate
	 */
	if (fs.existsSync(basePath) && !fs.existsSync(pathToCreate)) {
		fs.writeFileSync(`${pathToCreate}`, contentHtml);
	}
};

const generateComponent = (basePath: string, entity: string) => {
	const pathToCreate: string = `${basePath}${entityReplaceUnderscore(
		entity
	)}.component.ts`;

	const contentComponent: string = `
	import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-${entityReplaceUnderscore(entity)}',
  templateUrl: './${entityReplaceUnderscore(entity)}.component.html',
})
export class ${entityToUpperCase(entity)}Component implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
	`;
	/**
	 * Generate
	 */
	if (fs.existsSync(basePath) && !fs.existsSync(pathToCreate)) {
		fs.writeFileSync(`${pathToCreate}`, contentComponent);
	}
};

const generateType = (basePath: string, entity: string, columns: []) => {
	const pathToCreate: string = `${basePath}${entityReplaceUnderscore(
		entity
	)}.types.ts`;
	let attributes: string = '';

	columns.map((item: any) => {
		attributes += `${item.column_name_}:${
			item.column_name_ == `id_${entity}`
				? 'string'
				: item.column_type_ == 'numeric'
				? 'number'
				: item.column_type_ == 'boolean'
				? 'boolean'
				: 'string'
		};`;
	});

	const contentType: string = `export interface ${entityToUpperCase(entity)} {
		${attributes}
	  }
	`;
	/**
	 * Generate
	 */
	if (fs.existsSync(basePath) && !fs.existsSync(pathToCreate)) {
		fs.writeFileSync(`${pathToCreate}`, contentType);
	}
};

const generateData = (basePath: string, entity: string, columns: []) => {
	const pathToCreate: string = `${basePath}${entityReplaceUnderscore(
		entity
	)}.data.ts`;
	let attributes: string = '';

	columns.map((item: any) => {
		attributes += `${item.column_name_}:${
			item.column_name_ == `id_${entity}`
				? "''"
				: item.column_type_ == 'numeric'
				? '1'
				: item.column_type_ == 'boolean'
				? 'false'
				: "''"
		},`;
	});

	const contentData: string = `import { ${entityToUpperCase(
		entity
	)} } from './${entityReplaceUnderscore(entity)}.types';
	
	export const ${entityToUpperCaseOutInitial(entity)}s: ${entityToUpperCase(
		entity
	)}[] = [];
	export const ${entityToUpperCaseOutInitial(entity)}: ${entityToUpperCase(
		entity
	)} = {
	  ${attributes}
	};
	`;
	/**
	 * Generate
	 */
	if (fs.existsSync(basePath) && !fs.existsSync(pathToCreate)) {
		fs.writeFileSync(`${pathToCreate}`, contentData);
	}
};

const generateService = (
	basePath: string,
	scheme: string,
	entity: string,
	columns: [],
	attributeList: AttributeList
) => {
	const pathToCreate: string = `${basePath}${entityReplaceUnderscore(
		entity
	)}.service.ts`;

	let attributesCreate: string = '';

	columns.map((item: any) => {
		attributesCreate += `${item.column_name_}:${
			item.column_name_ == `id_${entity}`
				? "''"
				: item.column_type_ == 'numeric'
				? '1'
				: item.column_type_ == 'boolean'
				? 'false'
				: item.column_type_ == 'character varying' &&
				  item.column_name_ == attributeList.first
				? "'Nuevo registro'"
				: "''"
		},`;
	});

	const contentService: string = `
	import { HttpClient, HttpHeaders } from '@angular/common/http';
	import { Injectable } from '@angular/core';
	import {
	  BehaviorSubject,
	  catchError,
	  filter,
	  map,
	  Observable,
	  of,
	  switchMap,
	  take,
	  tap,
	  throwError,
	} from 'rxjs';
	import { environment } from 'environments/environment';
	import { ${entityToUpperCaseOutInitial(entity)}, ${entityToUpperCaseOutInitial(
		entity
	)}s } from './${entityReplaceUnderscore(entity)}.data';
	import { ${entityToUpperCase(entity)} } from './${entityReplaceUnderscore(
		entity
	)}.types';
	
	@Injectable({
		providedIn: 'root',
	  })
	  
	  export class ${entityToUpperCase(entity)}Service {
		private _url: string;
		private _headers: HttpHeaders = new HttpHeaders({
		  'Content-Type': 'application/json',
		});
	  
		private _${entityToUpperCaseOutInitial(
			entity
		)}: BehaviorSubject<${entityToUpperCase(entity)}> = new BehaviorSubject(
			${entityToUpperCaseOutInitial(entity)}
		);
		private _${entityToUpperCaseOutInitial(
			entity
		)}s: BehaviorSubject<${entityToUpperCase(entity)}[]> = new BehaviorSubject(
			${entityToUpperCaseOutInitial(entity)}s
		);
	  
		constructor(private _httpClient: HttpClient) {
		  this._url = environment.urlBackend + '/app/${scheme}/${entity}';
		}
		/**
		 * Getter
		 */
		get ${entityToUpperCaseOutInitial(entity)}$(): Observable<${entityToUpperCase(
		entity
	)}> {
		  return this._${entityToUpperCaseOutInitial(entity)}.asObservable();
		}
		/**
		 * Getter for _${entityToUpperCaseOutInitial(entity)}s
		 */
		get ${entityToUpperCaseOutInitial(entity)}s$(): Observable<${entityToUpperCase(
		entity
	)}[]> {
		  return this._${entityToUpperCaseOutInitial(entity)}s.asObservable();
		}
		/**
   * Create function
   */
  create${entityToUpperCase(entity)}(id_user_: string): Observable<any> {
    return this._${entityToUpperCaseOutInitial(entity)}s.pipe(
      take(1),
      switchMap((${entityToUpperCaseOutInitial(entity)}s) =>
        this._httpClient
          .post(this._url + '/create', {
			id_user_: parseInt(id_user_),
		  }, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
				/**
				 * check the response body to match with the type
				 */
				const _${entityToUpperCaseOutInitial(entity)}: ${entityToUpperCase(
		entity
	)} = response.body;
				console.log(_${entityToUpperCaseOutInitial(entity)});
				/**
				 * Update the ${entityToUpperCaseOutInitial(entity)} in the store
				 */
              this._${entityToUpperCaseOutInitial(
								entity
							)}s.next([_${entityToUpperCaseOutInitial(
		entity
	)}, ...${entityToUpperCaseOutInitial(entity)}s]);

              return of(_${entityToUpperCaseOutInitial(entity)});
            })
          )
      )
    );
  }
  /**
   * Read All ${entityToUpperCase(entity)}
   */
  readAll${entityToUpperCase(entity)}(): Observable<${entityToUpperCase(
		entity
	)}[]> {
    return this._httpClient
      .get<${entityToUpperCase(entity)}[]>(this._url + '/read/query-all')
      .pipe(
        tap((${entityToUpperCaseOutInitial(entity)}s: ${entityToUpperCase(
		entity
	)}[]) => {
          this._${entityToUpperCaseOutInitial(
						entity
					)}s.next(${entityToUpperCaseOutInitial(entity)}s);
        })
      );
  }
  /**
   * Read ${entityToUpperCase(entity)} by query
   * @param query
   */
   read${entityToUpperCase(
			entity
		)}ByQuery(query: string): Observable<${entityToUpperCase(entity)}[]> {
    return this._httpClient
      .get<${entityToUpperCase(entity)}[]>(
        this._url + \`/read/\${query != '' ? query : 'query-all'}\`
      )
      .pipe(
        tap((${entityToUpperCaseOutInitial(entity)}s: ${entityToUpperCase(
		entity
	)}[]) => {
          this._${entityToUpperCaseOutInitial(
						entity
					)}s.next(${entityToUpperCaseOutInitial(entity)}s);
        })
      );
  }
  /**
   * Read ${entityToUpperCase(entity)} by id
   * @param id${entityToUpperCase(entity)}
   */
   read${entityToUpperCase(entity)}ById(id${entityToUpperCase(
		entity
	)}: string): Observable<${entityToUpperCase(entity)}> {
    return this._httpClient
      .get<${entityToUpperCase(entity)}>(
        this._url + \`/specificRead/\${id${entityToUpperCase(entity)}}\`
      )
      .pipe(
        tap((${entityToUpperCaseOutInitial(entity)}s: ${entityToUpperCase(
		entity
	)}) => {
			return ${entityToUpperCaseOutInitial(entity)}s;
        })
      );
  }
  /**
   * Read ${entityToUpperCase(entity)} by id of local Observable
   */
  read${entityToUpperCase(
		entity
	)}ByIdLocal(id: string): Observable<${entityToUpperCase(entity)}> {
    return this._${entityToUpperCaseOutInitial(entity)}s.pipe(
      take(1),
      map((${entityToUpperCaseOutInitial(entity)}s) => {
		/**
		 * Find
		 */
        const ${entityToUpperCaseOutInitial(entity)} =
          ${entityToUpperCaseOutInitial(
						entity
					)}s.find((item) => item.id_${entity} == id) || null;
					/**
					 * Update
					 */
        this._${entityToUpperCaseOutInitial(
					entity
				)}.next(${entityToUpperCaseOutInitial(entity)}!);
				/**
				 * Return
				 */
        return ${entityToUpperCaseOutInitial(entity)};
      }),
      switchMap((${entityToUpperCaseOutInitial(entity)}) => {
        if (!${entityToUpperCaseOutInitial(entity)}) {
          return throwError(
            () => 'No se encontro el elemento con el id ' + id + '!'
          );
        }
        return of(${entityToUpperCaseOutInitial(entity)});
      })
    );
  }
  /**
   * Update ${entityToUpperCaseOutInitial(entity)}
   * @param id_user_ that will be updated
   * @param ${entityToUpperCaseOutInitial(entity)}
   */
  update${entityToUpperCase(entity)}(${entityToUpperCaseOutInitial(
		entity
	)}: ${entityToUpperCase(entity)}): Observable<any> {
    return this.${entityToUpperCaseOutInitial(entity)}s$.pipe(
      take(1),
      switchMap((${entityToUpperCaseOutInitial(entity)}s) =>
        this._httpClient
          .patch(this._url + '/update',${entityToUpperCaseOutInitial(entity)}, {
            headers: this._headers,
          })
          .pipe(
            switchMap((response: any) => {
				/**
				 * check the response body to match with the type
				 */
				const _${entityToUpperCaseOutInitial(entity)}: ${entityToUpperCase(
		entity
	)} = response.body;
				console.log(_${entityToUpperCaseOutInitial(entity)});
				/**
				 * Find the index of the updated ${entityToUpperCaseOutInitial(entity)}
				 */
              const index = ${entityToUpperCaseOutInitial(entity)}s.findIndex(
                (item) => item.id_${entity} == ${entityToUpperCaseOutInitial(
		entity
	)}.id_${entity}
              );
			  console.log(index);
			  /**
				 * Update the ${entityToUpperCaseOutInitial(entity)}
				 */
              ${entityToUpperCaseOutInitial(
								entity
							)}s[index] = _${entityToUpperCaseOutInitial(entity)};
				/**
				 * Update the ${entityToUpperCaseOutInitial(entity)}s
				 */
              this._${entityToUpperCaseOutInitial(
								entity
							)}s.next(${entityToUpperCaseOutInitial(entity)}s);

							/**
							 * Update the ${entityToUpperCaseOutInitial(entity)}
							 */
						  this._${entityToUpperCaseOutInitial(
								entity
							)}.next(_${entityToUpperCaseOutInitial(entity)});

				return of(_${entityToUpperCaseOutInitial(entity)})							
            })
          )
      )
    );
  }
  /**
   * Delete the ${entityToUpperCaseOutInitial(entity)}
   * @param id
   */
  delete${entityToUpperCase(entity)}(
    id_user_: string,
    id_${entity}: string
  ): Observable<any> {
    return this.${entityToUpperCaseOutInitial(entity)}s$.pipe(
      take(1),
      switchMap((${entityToUpperCaseOutInitial(entity)}s) =>
        this._httpClient
          .delete(this._url + \`/delete\`, {
            params: { id_user_, id_${entity} },
          })
          .pipe(
            switchMap((response: any) => {
				if (response && response.body) {
					/**
					 * Find the index of the updated ${entityToUpperCaseOutInitial(entity)}
					 */
						const index = ${entityToUpperCaseOutInitial(entity)}s.findIndex(
							(item) => item.id_${entity} == id_${entity}
						);
						console.log(index);
						/**
						 * Delete the object of array
						 */
						${entityToUpperCaseOutInitial(entity)}s.splice(index, 1);
						/**
						 * Update the ${entityToUpperCaseOutInitial(entity)}s
						 */
						this._${entityToUpperCaseOutInitial(
							entity
						)}s.next(${entityToUpperCaseOutInitial(entity)}s);
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
	`;
	/**
	 * Generate
	 */
	if (fs.existsSync(basePath) && !fs.existsSync(pathToCreate)) {
		fs.writeFileSync(`${pathToCreate}`, contentService);
	}
};

const generateResolver = (basePath: string, entity: string) => {
	const pathToCreate: string = `${basePath}${entityReplaceUnderscore(
		entity
	)}.resolvers.ts`;

	const contentResolver: string = `
	import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ${entityToUpperCase(
		entity
	)}Service } from './${entityReplaceUnderscore(entity)}.service';
import { ${entityToUpperCase(entity)} } from './${entityReplaceUnderscore(
		entity
	)}.types';

@Injectable({
  providedIn: 'root',
})
export class ${entityToUpperCase(entity)}Resolver implements Resolve<any> {
  /**
   * Constructor
   */
  constructor(
    private _${entityToUpperCaseOutInitial(entity)}Service: ${entityToUpperCase(
		entity
	)}Service,
    private _router: Router
  ) {}

   /** ----------------------------------------------------------------------------------------------------- */
   /** @ Public methods
   /** ----------------------------------------------------------------------------------------------------- */

  /**
   * Resolver
   * @param route
   * @param state
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<${entityToUpperCase(entity)}> {
    return this._${entityToUpperCaseOutInitial(entity)}Service
      .read${entityToUpperCase(entity)}ByIdLocal(route.paramMap.get('id')!)
      .pipe(
		/**
		 * Error here means the requested is not available
		 */
        catchError((error) => {
			/**
				 * Log the error
				 */
          // console.error(error);
		  /**
		   * Get the parent url
		   */
          const parentUrl = state.url.split('/').slice(0, -1).join('/');
		  /**
				 * Navigate to there
				 */
          this._router.navigateByUrl(parentUrl);
		  /**
		   * Throw an error
		   */
          return throwError(() => error);
        })
      );
  }
}
	`;
	/**
	 * Generate
	 */
	if (fs.existsSync(basePath) && !fs.existsSync(pathToCreate)) {
		fs.writeFileSync(`${pathToCreate}`, contentResolver);
	}
};

const generateListHtml = (
	basePath: string,
	entity: string,
	nameVisibility: string,
	attributeList: AttributeList,
	columns: []
) => {
	const pathToCreate: string = `${basePath}list/list.component.html`;

	const contentListHtml: string = `
	<div class="absolute inset-0 flex flex-col min-w-0 overflow-hidden">

    <mat-drawer-container class="flex-auto h-full bg-card dark:bg-transparent" (backdropClick)="onBackdropClicked()">

        <!-- Drawer -->
        <mat-drawer class="w-full md:w-160 dark:bg-gray-900" [mode]="drawerMode" [opened]="false" [position]="'end'"
            [disableClose]="true" #matDrawer>
            <router-outlet></router-outlet>
        </mat-drawer>

        <mat-drawer-content class="flex flex-col">

            <!-- Main -->
            <div class="flex-auto">

                <!-- Header -->
                <div class="flex flex-col sm:flex-row md:flex-col flex-auto justify-between py-8 px-6 md:px-8 border-b">

                    <!-- Title -->
                    <div>
                        <div class="text-4xl font-extrabold tracking-tight leading-none">${nameVisibility}</div>
                        <div class="ml-0.5 font-medium text-secondary">
                            <ng-container *ngIf="count > 0">
                                {{count}}
                            </ng-container>
                            {{count | i18nPlural: {
                            '=0' : 'No hay ${nameVisibility}',
                            '=1' : '${nameVisibility}',
                            'other': '${nameVisibility}'
                            } }}
                        </div>
                    </div>

                    <!-- Main actions -->
                    <div class="flex items-center mt-4">
                        <!-- Search -->
                        <div class="flex-auto">
                            <mat-form-field class="angel-mat-dense angel-mat-no-subscript w-full min-w-50">
                                <mat-icon class="icon-size-5" matPrefix [svgIcon]="'heroicons_solid:search'"></mat-icon>
                                <input matInput [formControl]="searchInputControl" [autocomplete]="'off'"
                                    [placeholder]="'Buscar por ...'">
                            </mat-form-field>
                        </div>
                        <!-- Add button -->
                        <button class="ml-4" mat-flat-button [color]="'primary'" (click)="create${entityToUpperCase(
													entity
												)}()">
                            <mat-icon [svgIcon]="'heroicons_outline:plus'"></mat-icon>
                            <span class="ml-2 mr-1">Añadir</span>
                        </button>
                    </div>
                </div>
                <!-- list -->
                <div class="relative">
                    <ng-container *ngIf="${entityToUpperCaseOutInitial(
											entity
										)}s$ | async as ${entityToUpperCaseOutInitial(entity)}s">
                        <ng-container *ngIf="${entityToUpperCaseOutInitial(
													entity
												)}s.length; else noResults">
                            <ng-container *ngFor="let ${entityToUpperCaseOutInitial(
															entity
														)} of ${entityToUpperCaseOutInitial(
		entity
	)}s; let i = index; trackBy: trackByFn">
                                <!-- Entity -->
                                <div class="z-20 flex items-center px-6 py-4 md:px-8 cursor-pointer hover:bg-hover border-b"
                                    [ngClass]="{'bg-primary-50 dark:bg-hover': selected${entityToUpperCase(
																			entity
																		)} && selected${entityToUpperCase(
		entity
	)}.id_${entity} === ${entityToUpperCaseOutInitial(entity)}.id_${entity}}"
									[routerLink]="['./', ${entityToUpperCaseOutInitial(entity)}.id_${entity}]">
                                    <div
                                        class="flex flex-0 items-center justify-center w-10 h-10 rounded-full overflow-hidden">
                                        <ng-container *ngIf="true">
                                            <div
                                                class="flex items-center justify-center w-full h-full rounded-full text-lg uppercase bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                                {{${entityToUpperCaseOutInitial(
																									entity
																								)}.${
		attributeList.first
	}.charAt(0)}}
                                            </div>
                                        </ng-container>
                                    </div>
                                    <div class="min-w-0 ml-4">
                                        <div class="font-medium leading-5 truncate">{{${entityToUpperCaseOutInitial(
																					entity
																				)}.${attributeList.first}}}
                                        </div>
                                        <div class="leading-5 truncate text-secondary">
                                            {{${entityToUpperCaseOutInitial(
																							entity
																						)}.${attributeList.second}}}</div>
                                    </div>
                                </div>
                            </ng-container>
                        </ng-container>
                    </ng-container>

                    <!-- No Results -->
                    <ng-template #noResults>
                        <div class="p-8 sm:p-16 border-t text-4xl font-semibold tracking-tight text-center">¡No hay
                            resultados!</div>
                    </ng-template>

                </div>

            </div>

        </mat-drawer-content>

    </mat-drawer-container>

</div>
	`;
	/**
	 * Generate
	 */
	if (fs.existsSync(basePath) && !fs.existsSync(pathToCreate)) {
		fs.writeFileSync(`${pathToCreate}`, contentListHtml);
	}
};

const generateListComponent = (
	basePath: string,
	entity: string,
	nameVisibility: string,
	columns: []
) => {
	const pathToCreate: string = `${basePath}list/list.component.ts`;

	const contentListComponent: string = `
	import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { fromEvent, merge, Observable, Subject, timer } from 'rxjs';
import {
  filter,
  finalize,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs/operators';
import { AngelMediaWatcherService } from '@angel/services/media-watcher';
import { MessageAPI, AppInitialData } from 'app/core/app/app.type';
import { AuthService } from 'app/core/auth/auth.service';
import { LayoutService } from 'app/layout/layout.service';
import { ActionAngelConfirmation, AngelConfirmationService} from '@angel/services/confirmation';
import { NotificationService } from 'app/shared/notification/notification.service';
import { ${entityToUpperCase(
		entity
	)}Service } from '../${entityReplaceUnderscore(entity)}.service';
import { ${entityToUpperCase(entity)} } from '../${entityReplaceUnderscore(
		entity
	)}.types';

@Component({
  selector: '${entityReplaceUnderscore(entity)}-list',
  templateUrl: './list.component.html',
})
export class ${entityToUpperCase(entity)}ListComponent implements OnInit {
  @ViewChild('matDrawer', { static: true }) matDrawer!: MatDrawer;
  count: number = 0;
  ${entityToUpperCaseOutInitial(entity)}s$!: Observable<${entityToUpperCase(
		entity
	)}[]>;

  openMatDrawer: boolean = false;
  
  private data!: AppInitialData;
  /**
   * Shortcut
   */
  private keyControl: boolean = false;
  private keyShift: boolean = false;
  private timeToWaitKey: number = 2; //ms
  /**
   * Shortcut
   */
  drawerMode!: 'side' | 'over';
  searchInputControl: FormControl = new FormControl();
  selected${entityToUpperCase(entity)}!: ${entityToUpperCase(entity)};

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  /**
   * isOpenModal
   */
  isOpenModal: boolean = false;
  /**
   * isOpenModal
   */
  constructor(
    private _store: Store<{ global: AppInitialData }>,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private _document: any,
    private _router: Router,
    private _angelMediaWatcherService: AngelMediaWatcherService,
    private _${entityToUpperCaseOutInitial(entity)}Service: ${entityToUpperCase(
		entity
	)}Service,
    private _notificationService: NotificationService,
    private _angelConfirmationService: AngelConfirmationService,
	private _layoutService: LayoutService,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
	/**
     * checkSession
     */
    this._authService
      .checkSession()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe();
    /**
     * checkSession
     */
	/**
     * isOpenModal
     */
    this._layoutService.isOpenModal$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_isOpenModal: boolean) => {
        this.isOpenModal = _isOpenModal;
      });
    /**
     * isOpenModal
     */
	/**
	 * Subscribe to user changes of state
	 */
    this._store.pipe(takeUntil(this._unsubscribeAll)).subscribe((state) => {
      this.data = state.global;
    });
	/**
	 * Get the ${entityToUpperCaseOutInitial(entity)}s 
	 */
    this.${entityToUpperCaseOutInitial(
			entity
		)}s$ = this._${entityToUpperCaseOutInitial(
		entity
	)}Service.${entityToUpperCaseOutInitial(entity)}s$;
	/**
	 *  Count Subscribe and readAll
	 */
    this._${entityToUpperCaseOutInitial(entity)}Service
      .readAll${entityToUpperCase(entity)}()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((${entityToUpperCaseOutInitial(entity)}s: ${entityToUpperCase(
		entity
	)}[]) => {
		/**
		* Update the counts
		*/
        this.count = ${entityToUpperCaseOutInitial(entity)}s.length;
		/**
		 * Mark for check
		 */
        this._changeDetectorRef.markForCheck();
      });
	  /**
	 *  Count Subscribe
	 */
    this._${entityToUpperCaseOutInitial(entity)}Service
      .${entityToUpperCaseOutInitial(entity)}s$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((${entityToUpperCaseOutInitial(entity)}s: ${entityToUpperCase(
		entity
	)}[]) => {
		/**
		* Update the counts
		*/
        this.count = ${entityToUpperCaseOutInitial(entity)}s.length;
		/**
		 * Mark for check
		 */
        this._changeDetectorRef.markForCheck();
      });
	  /**
	   * Subscribe to search input field value changes  
	   */
    this.searchInputControl.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        switchMap((query) => {
			/**
			 * Search
			 */
          return this._${entityToUpperCaseOutInitial(
						entity
					)}Service.read${entityToUpperCase(entity)}ByQuery(
            query.toLowerCase()
          );
        })
      )
      .subscribe();
	  /**
	   * Subscribe to media changes 
	   */
    this._angelMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
		/**
		 * Set the drawerMode if the given breakpoint is active
		 */
        if (matchingAliases.includes('lg')) {
          this.drawerMode = 'side';
        } else {
          this.drawerMode = 'over';
        }
		/**
		 * Mark for check
		 */
        this._changeDetectorRef.markForCheck();
      });
	  /**
	   * Subscribe to MatDrawer opened change
	   */
    this.matDrawer.openedChange
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((opened) => {
        this.openMatDrawer = opened;
        if (!opened) {
			/**
			 * Remove the selected when drawer closed
			 */
          this.selected${entityToUpperCase(entity)} = null!;
		  /**
		   * Mark for check
		   */
          this._changeDetectorRef.markForCheck();
        }
      });
	  /**
	   * Shortcuts
	   */
    merge(
      fromEvent(this._document, 'keydown').pipe(
        takeUntil(this._unsubscribeAll),
        filter<KeyboardEvent | any>((e) => e.key === 'Control')
      ),
      fromEvent(this._document, 'keydown').pipe(
        takeUntil(this._unsubscribeAll),
        filter<KeyboardEvent | any>((e) => e.key === 'Shift')
      )
    )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((keyUpOrKeyDown) => {
		/**
		 * Shortcut create
		 */
        if (keyUpOrKeyDown.key == 'Control') {
          this.keyControl = true;

          timer(100, 100)
            .pipe(
              finalize(() => {
                this.keyControl = false;
              }),
              takeWhile(() => this.timeToWaitKey > 0),
              takeUntil(this._unsubscribeAll),
              tap(() => this.timeToWaitKey--)
            )
            .subscribe();
        }
        if (keyUpOrKeyDown.key == 'Shift') {
          this.keyShift = true;

          timer(100, 100)
            .pipe(
              finalize(() => {
                this.keyShift = false;
              }),
              takeWhile(() => this.timeToWaitKey > 0),
              takeUntil(this._unsubscribeAll),
              tap(() => this.timeToWaitKey--)
            )
            .subscribe();
        }

        if (!this.isOpenModal && this.keyControl && this.keyShift) {
          this.create${entityToUpperCase(entity)}();
        }
      });
	  /**
       * Shortcuts
       */
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
	/**
	 * Unsubscribe from all subscriptions
	 */
    this._unsubscribeAll.next(0);
    this._unsubscribeAll.complete();
  }

   /** ----------------------------------------------------------------------------------------------------- */
   /** @ Public methods
   /** ----------------------------------------------------------------------------------------------------- */

  /**
   * Go to ${entityToUpperCaseOutInitial(nameVisibility)}
   * @param id
   */
  goToEntity(id: string): void {
	/**
	 * Get the current activated route
	 */
    let route = this._activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
	/**
	 * Go to ${entityToUpperCaseOutInitial(nameVisibility)}
	 */
    this._router.navigate([this.openMatDrawer ? '../' : './', id], { relativeTo: route });
	/**
	 * Mark for check
	 */
    this._changeDetectorRef.markForCheck();
  }
  /**
   * On backdrop clicked
   */
  onBackdropClicked(): void {
	/**
	 * Get the current activated route
	 */
    let route = this._activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
	/**
			 * Go to the parent route
			 */
    this._router.navigate(['../'], { relativeTo: route });
	/**
	 * Mark for check
	 */
    this._changeDetectorRef.markForCheck();
  }
  /**
   * Create ${entityToUpperCaseOutInitial(nameVisibility)}
   */
  create${entityToUpperCase(entity)}(): void {
    this._angelConfirmationService
      .open({
		title: 'Añadir ${entityToLowerCase(nameVisibility)}',
        message: '¿Estás seguro de que deseas añadir una nueva ${entityToLowerCase(
					nameVisibility
				)}? ¡Esta acción no se puede deshacer!',
		})
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((confirm: ActionAngelConfirmation) => {
        if (confirm === 'confirmed') {
          const id_user_ = this.data.user.id_user;
		  /**
			 * Create the ${entityToLowerCase(nameVisibility)}
			 */
          this._${entityToUpperCaseOutInitial(entity)}Service
            .create${entityToUpperCase(entity)}(id_user_)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
				next: (_${entityToUpperCaseOutInitial(entity)}: ${entityToUpperCase(
		entity
	)}) => {
				  console.log(_${entityToUpperCaseOutInitial(entity)});
				  if (_${entityToUpperCaseOutInitial(entity)}) {
					this._notificationService.success(
					  '${nameVisibility} agregada correctamente'
					);
					/**
			 * Go to new ${entityToLowerCase(nameVisibility)}
			 */
					this.goToEntity(_${entityToUpperCaseOutInitial(entity)}.id_${entity});
				  } else {
					this._notificationService.error(
					  '¡Error interno!, consulte al administrador.'
					);
				  }
				},
				error: (error: { error: MessageAPI }) => {
				  console.log(error);
				  this._notificationService.error(
					!error.error
					  ? '¡Error interno!, consulte al administrador.'
					  : !error.error.descripcion
					  ? '¡Error interno!, consulte al administrador.'
					  : error.error.descripcion
				  );
				},
			  });
        }
		this._layoutService.setOpenModal(false);
      });
  }

  /**
   * Track by function for ngFor loops
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}

	`;
	/**
	 * Generate
	 */
	if (fs.existsSync(basePath) && !fs.existsSync(pathToCreate)) {
		fs.writeFileSync(`${pathToCreate}`, contentListComponent);
	}
};

const generateDetailsHtml = (basePath: string, entity: string, columns: []) => {
	const pathToCreate: string = `${basePath}details/details.component.html`;

	let attributesView: string = '';
	let attributesForm: string = '';

	columns.map((item: any) => {
		attributesView += `${
			item.column_name_ != `id_${entity}` &&
			item.column_name_ != `deleted_${entity}`
				? ` <!-- ${item.column_name_} -->
	<ng-container *ngIf="${entityToUpperCaseOutInitial(entity)}.${
						item.column_name_
				  }">
		<div class="flex sm:items-center">
			<mat-icon [svgIcon]="'heroicons_outline:fire'"></mat-icon>
			<div class="ml-6 leading-6">{{${
				item.column_name_.substring(0, 3) == 'id_'
					? `selected${entityToUpperCase(
							item.column_name_.substring(3, item.column_name_.length)
					  )}.name_${item.column_name_.substring(3, item.column_name_.length)}`
					: `${entityToUpperCaseOutInitial(entity)}.${item.column_name_}`
			}}}</div>
		</div>
	</ng-container>`
				: ''
		}`;
	});

	columns.map((item: any) => {
		attributesForm += `${
			item.column_name_ != `id_${entity}` &&
			item.column_name_ != `deleted_${entity}`
				? `<!-- ${item.column_name_} -->
				${
					item.column_name_.substring(0, 3) == 'id_'
						? `<div class="mt-8">
                        <mat-form-field class="angel-mat-no-subscript w-full">
                            <mat-label>${entityToUpperCase(
															item.column_name_.substring(
																3,
																item.column_name_.length
															)
														)}</mat-label>
                            <mat-select [formControlName]="'${
															item.column_name_
														}'"
                                [value]="selected${entityToUpperCase(
																	item.column_name_.substring(
																		3,
																		item.column_name_.length
																	)
																)}.${item.column_name_}">
                                <ng-container *ngFor="let category of categories${entityToUpperCase(
																	item.column_name_.substring(
																		3,
																		item.column_name_.length
																	)
																)}">
                                    <mat-option [value]="category.${
																			item.column_name_
																		}">
                                        {{category.name_${item.column_name_.substring(
																					3,
																					item.column_name_.length
																				)}}}</mat-option>
                                </ng-container>
                            </mat-select>
                        </mat-form-field>
                    </div>`
						: `<div class="mt-8">
					<mat-form-field class="angel-mat-no-subscript w-full">
						<mat-label>${entityToUpperCaseOutInitial(item.column_name_)}</mat-label>
						<mat-icon matPrefix class="hidden sm:flex icon-size-5"
							[svgIcon]="'heroicons_solid:fire'"></mat-icon>
						<input matInput ${
							item.column_type_ == 'numeric'
								? `maxlength="${item.lenght_numeric_}"`
								: `${
										item.column_type_ == 'character varying'
											? `maxlength="${item.length_character_}"`
											: ''
								  }`
						} [formControlName]="'${item.column_name_}'"
							[placeholder]="'${item.column_name_}'" [spellcheck]="false">
					</mat-form-field>
				</div>	`
				}`
				: ''
		}`;
	});

	const contentDetailsHtml: string = `<div class="flex flex-col w-full">
    <!-- View mode -->
    <ng-container *ngIf="!editMode">
        <!-- Header -->
        <div class="relative w-full h-40 flex items-center bg-accent-100 dark:bg-accent-700 place-content-center">
            <!-- Background -->
            <div class="w-full h-40 bg-black z-10 opacity-0">
            </div>
            <h1 class="absolute z-20 text-white text-3xl"absolute z-20 text-white text-3xl>{{nameEntity}}</h1>
            <img class="absolute inset-0 object-cover w-full h-full" src="app/../assets/images/background.jpg">
        </div>
        <!-- Entity -->
        <div class="relative flex flex-col flex-auto items-center p-6 pt-0 sm:p-12 sm:pt-0">
            <div class="w-full max-w-3xl">
                <!-- Actions -->
                <div class="flex items-center -mx-6 sm:-mx-12 py-4 pr-6 pl-6 sm:pr-12 sm:pl-12 border-t bg-gray-100 dark:bg-transparent rounded-t-none rounded-b-2xl">
                    <button mat-stroked-button (click)="toggleEditMode(true)">
                        <mat-icon class="icon-size-5" [svgIcon]="'heroicons_solid:pencil-alt'"></mat-icon>
                        <span class="ml-1">Editar</span>
                    </button>
                    <button mat-stroked-button class="ml-auto" [matTooltip]="'Cerrar'" [routerLink]="['../']">
                        <mat-icon class="icon-size-5" [svgIcon]="'heroicons_outline:x'"></mat-icon>
                        <span class="ml-1">Cerrar</span>
                    </button>
                </div>
                <div class="flex flex-col mt-4 pt-6 space-y-8">
					${attributesView}
                </div>
            </div>
        </div>
    </ng-container>

    <!-- Edit mode -->
    <ng-container *ngIf="editMode">
        <!-- Header -->
        <div class="relative w-full h-40 flex items-center bg-accent-100 dark:bg-accent-700 place-content-center">
            <!-- Background -->
            <div class="w-full h-40 bg-black z-10 opacity-25">
            </div>
            <h1 class="absolute z-20 text-white text-3xl">{{nameEntity}}</h1>
            <img class="absolute inset-0 object-cover w-full h-full" src="app/../assets/images/background.jpg">
        </div>
        <!-- form -->
        <div class="relative flex flex-col flex-auto items-center px-6 sm:px-12">
            <div class="w-full max-w-3xl">
                <!-- Actions -->
                <div class="flex items-center -mx-6 sm:-mx-12 py-4 pr-6 pl-6 sm:pr-12 sm:pl-12 border-t bg-gray-100 dark:bg-transparent rounded-t-none rounded-b-2xl">
                    <!-- Save -->
                    <button mat-flat-button [color]="'primary'" [disabled]="${entityToUpperCaseOutInitial(
											entity
										)}Form.invalid"
                        [matTooltip]="'Guardar'" (click)="update${entityToUpperCase(
													entity
												)}()">
                        Guardar
                    </button>
                    <!-- Delete -->
                    <button mat-stroked-button class="ml-2" [color]="'warn'" [matTooltip]="'Eliminar'"
                        (click)="delete${entityToUpperCase(entity)}()">
                        Eliminar
                    </button>
                    <!-- Cancel -->
                    <button mat-stroked-button class="ml-2 mr-2" [matTooltip]="'Cancelar'"
                        (click)="toggleEditMode(false)">
                        Cancelar
                    </button>

                    <button mat-stroked-button class="ml-auto" [matTooltip]="'Cerrar'" [routerLink]="['../']">
                        <mat-icon class="icon-size-5" [svgIcon]="'heroicons_outline:x'"></mat-icon>
                        <span class="ml-1">Cerrar</span>
                    </button>
                </div>
                <form [formGroup]="${entityToUpperCaseOutInitial(
									entity
								)}Form" class="mb-8">
						<!-- Alert -->
                    <angel-alert class="mt-8" *ngIf="${entityToUpperCaseOutInitial(
											entity
										)}Form.invalid || showAlert"
                        [appearance]="'outline'" [showIcon]="false" [type]="alert.type"
                        [@shake]="alert.type === 'error'">
                        <!-- Message if alert is actived for the component -->
                        {{alert.message}}
                        <!-- name_control -->
                        <mat-error *ngIf="${entityToUpperCaseOutInitial(
													entity
												)}Form.get('name_control')?.hasError('required')">
                            • Ingrese name_control
                        </mat-error>
                        <mat-error *ngIf="${entityToUpperCaseOutInitial(
													entity
												)}Form.get('name_control')?.hasError('maxlength')">
                            • longitud maxima name_control
                        </mat-error>
                        <mat-error *ngIf="${entityToUpperCaseOutInitial(
													entity
												)}Form.get('name_control')?.hasError('minlength')">
                            • longitud minima name_control
                        </mat-error>
                    </angel-alert>
                    <!-- Alert -->
					${attributesForm}
                </form>
            </div>
        </div>
    </ng-container>
</div>
	`;
	/**
	 * Generate
	 */
	if (fs.existsSync(basePath) && !fs.existsSync(pathToCreate)) {
		fs.writeFileSync(`${pathToCreate}`, contentDetailsHtml);
	}
};

const generateDetailsComponent = (
	basePath: string,
	entity: string,
	nameVisibility: string,
	columns: []
) => {
	const pathToCreate: string = `${basePath}details/details.component.ts`;

	let form: string = '';
	let selected: string = '';
	let selectedServices: string = '';
	let selectedSubscribe: string = '';
	let otherIDs: string = '';

	columns.map((item: any) => {
		otherIDs += `${
			item.column_name_ != `id_${entity}` &&
			item.column_name_.substring(0, 3) == 'id_'
				? `${item.column_name_}: parseInt(${entityToUpperCaseOutInitial(
						entity
				  )}.${item.column_name_}),`
				: ''
		}`;

		form += `${
			item.column_name_ == `deleted_${entity}`
				? ''
				: `${item.column_name_}:${
						item.column_name_ == `id_${entity}`
							? "['']"
							: `['',[Validators.required ${
									item.column_name_ != `id_${entity}` &&
									item.column_name_.substring(0, 3) == 'id_'
										? ''
										: item.column_type_ == 'numeric'
										? `,Validators.maxLength(${item.lenght_numeric_})`
										: `${
												item.column_type_ == 'character varying'
													? `,Validators.maxLength(${item.length_character_})`
													: ''
										  }`
							  }]]`
				  },`
		}`;

		selected += `${
			item.column_name_ != `id_${entity}` &&
			item.column_name_.substring(0, 3) == 'id_'
				? `
				
				 categories${entityToUpperCase(
						item.column_name_.substring(3, item.column_name_.length)
					)}: ${entityToUpperCase(
						item.column_name_.substring(3, item.column_name_.length)
				  )}[] = [];
				 selected${entityToUpperCase(
						item.column_name_.substring(3, item.column_name_.length)
					)}: ${entityToUpperCase(
						item.column_name_.substring(3, item.column_name_.length)
				  )} = ${entityToUpperCaseOutInitial(
						item.column_name_.substring(3, item.column_name_.length)
				  )};
				
				`
				: ''
		}`;

		selectedServices += `${
			item.column_name_ != `id_${entity}` &&
			item.column_name_.substring(0, 3) == 'id_'
				? `private _${entityToUpperCaseOutInitial(
						item.column_name_.substring(3, item.column_name_.length)
				  )}Service: ${entityToUpperCase(
						item.column_name_.substring(3, item.column_name_.length)
				  )}Service,`
				: ''
		}`;

		selectedSubscribe += `${
			item.column_name_ != `id_${entity}` &&
			item.column_name_.substring(0, 3) == 'id_'
				? `
				// ${entityToUpperCase(
					item.column_name_.substring(3, item.column_name_.length)
				)}
				this._${entityToUpperCaseOutInitial(
					item.column_name_.substring(3, item.column_name_.length)
				)}Service
				.readAll${entityToUpperCase(
					item.column_name_.substring(3, item.column_name_.length)
				)}()
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe((${item.column_name_.substring(
					3,
					item.column_name_.length
				)}s: ${entityToUpperCase(
						item.column_name_.substring(3, item.column_name_.length)
				  )}[]) => {
					this.categories${entityToUpperCase(
						item.column_name_.substring(3, item.column_name_.length)
					)} = ${item.column_name_.substring(3, item.column_name_.length)}s;

					this.selected${entityToUpperCase(
						item.column_name_.substring(3, item.column_name_.length)
					)} = this.categories${entityToUpperCase(
						item.column_name_.substring(3, item.column_name_.length)
				  )}.find(
					(item) =>
						item.${item.column_name_} ==
						this.${entityToUpperCaseOutInitial(entity)}.${item.column_name_}.toString()
					)!;
				});
				`
				: ''
		}`;
	});

	const contentDetailsComponent: string = `import { OverlayRef } from '@angular/cdk/overlay';
	import { DOCUMENT } from '@angular/common';
	import { ChangeDetectorRef, Component, OnInit , Inject} from '@angular/core';
	import { FormBuilder, FormGroup, Validators } from '@angular/forms';
	import { MatDrawerToggleResult } from '@angular/material/sidenav';
	import { ActivatedRoute, Router } from '@angular/router';
	import { Store } from '@ngrx/store';
	import { filter, fromEvent, merge,Subject, takeUntil } from 'rxjs';
	import { angelAnimations } from '@angel/animations';
	import { AngelAlertType } from '@angel/components/alert';
	import { MessageAPI, AppInitialData } from 'app/core/app/app.type';
	import { LayoutService } from 'app/layout/layout.service';
	import { ActionAngelConfirmation, AngelConfirmationService} from '@angel/services/confirmation';
	import { NotificationService } from 'app/shared/notification/notification.service';
	import { ${entityToUpperCase(
		entity
	)}Service } from '../${entityReplaceUnderscore(entity)}.service';
	import { ${entityToUpperCase(entity)} } from '../${entityReplaceUnderscore(
		entity
	)}.types';
	import { ${entityToUpperCase(
		entity
	)}ListComponent } from '../list/list.component';
	
	@Component({
	  selector: '${entityReplaceUnderscore(entity)}-details',
	  templateUrl: './details.component.html',
  	  animations: angelAnimations,
	})
	export class ${entityToUpperCase(entity)}DetailsComponent implements OnInit {

	  ${selected}
	
	  nameEntity: string = '${nameVisibility}';
	  private data!: AppInitialData;
	
	  editMode: boolean = false;
	  userId: string = '';
	  /**
	   * Alert
	   */
	  alert: { type: AngelAlertType; message: string } = {
		  type: 'error',
		  message: '',
	  };
	  showAlert: boolean = false;
	  /**
	   * Alert
	   */
	  ${entityToUpperCaseOutInitial(entity)}!: ${entityToUpperCase(entity)};
	  ${entityToUpperCaseOutInitial(entity)}Form!: FormGroup;
	  private ${entityToUpperCaseOutInitial(entity)}s!: ${entityToUpperCase(
		entity
	)}[];
	
	  private _tagsPanelOverlayRef!: OverlayRef;
	  private _unsubscribeAll: Subject<any> = new Subject<any>();
	  /**
   * isOpenModal
   */
  isOpenModal: boolean = false;
  /**
   * isOpenModal
   */
	  /**
	   * Constructor
	   */
	  constructor(
		private _store: Store<{ global: AppInitialData }>,
		private _changeDetectorRef: ChangeDetectorRef,
		private _${entityToUpperCaseOutInitial(
			entity
		)}ListComponent: ${entityToUpperCase(entity)}ListComponent,
		private _${entityToUpperCaseOutInitial(entity)}Service: ${entityToUpperCase(
		entity
	)}Service,
    	@Inject(DOCUMENT) private _document: any,
		private _formBuilder: FormBuilder,
		private _activatedRoute: ActivatedRoute,
		private _router: Router,
		private _notificationService: NotificationService,
		private _angelConfirmationService: AngelConfirmationService,
		private _layoutService: LayoutService,
		${selectedServices}
	  ) {}
	
	  /** ----------------------------------------------------------------------------------------------------- */
	  /** @ Lifecycle hooks
	  /** ----------------------------------------------------------------------------------------------------- */

	  /**
	   * On init
	   */
	  ngOnInit(): void {
		/**
		 * isOpenModal
		 */
		this._layoutService.isOpenModal$
		  .pipe(takeUntil(this._unsubscribeAll))
		  .subscribe((_isOpenModal: boolean) => {
			this.isOpenModal = _isOpenModal;
		  });
		/**
		 * isOpenModal
		 */
		/**
		 * Subscribe to user changes of state
		 */
		this._store.pipe(takeUntil(this._unsubscribeAll)).subscribe((state) => {
		  this.data = state.global;
		});
		/**
			 * Open the drawer
			 */
		this._${entityToUpperCaseOutInitial(entity)}ListComponent.matDrawer.open();
		/**
		 * Create the ${entityToUpperCaseOutInitial(entity)} form
		 */
		this.${entityToUpperCaseOutInitial(entity)}Form = this._formBuilder.group({
			${form}
		});
		/**
		 * Get the ${entityToUpperCaseOutInitial(entity)}s
		 */
		this._${entityToUpperCaseOutInitial(
			entity
		)}Service.${entityToUpperCaseOutInitial(entity)}s$
		  .pipe(takeUntil(this._unsubscribeAll))
		  .subscribe((${entityToUpperCaseOutInitial(entity)}s: ${entityToUpperCase(
		entity
	)}[]) => {
			this.${entityToUpperCaseOutInitial(entity)}s = ${entityToUpperCaseOutInitial(
		entity
	)}s;
			/**
			 * Mark for check
			 */
			this._changeDetectorRef.markForCheck();
		  });
		  /**
		   * Get the ${entityToUpperCaseOutInitial(entity)}
		   */
		this._${entityToUpperCaseOutInitial(
			entity
		)}Service.${entityToUpperCaseOutInitial(entity)}$
		  .pipe(takeUntil(this._unsubscribeAll))
		  .subscribe((${entityToUpperCaseOutInitial(entity)}: ${entityToUpperCase(
		entity
	)}) => {
			/**
			 * Open the drawer in case it is closed
			 */
			this._${entityToUpperCaseOutInitial(entity)}ListComponent.matDrawer.open();
			/**
			 * Get the ${entityToUpperCaseOutInitial(entity)}
			 */
			this.${entityToUpperCaseOutInitial(entity)} = ${entityToUpperCaseOutInitial(
		entity
	)};
				${selectedSubscribe}
				/**
				 * Patch values to the form
				 */
			this.patchForm();
			/**
			 * Toggle the edit mode off
			 */
			this.toggleEditMode(false);
			/**
			 * Mark for check
			 */
			this._changeDetectorRef.markForCheck();
		  });
		  /**
     * Shortcuts
     */
    merge(
      fromEvent(this._document, 'keydown').pipe(
        takeUntil(this._unsubscribeAll),
        filter<KeyboardEvent | any>((e) => e.key === 'Escape')
      )
    )
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((keyUpOrKeyDown) => {
        console.log(keyUpOrKeyDown);
        /**
         * Shortcut Escape
         */
       if (!this.isOpenModal && keyUpOrKeyDown.key == 'Escape') {
          /**
           * Navigate parentUrl
           */
          const parentUrl = this._router.url.split('/').slice(0, -1).join('/');
          this._router.navigate([parentUrl]);
          /**
           * Close Drawer
           */
          this.closeDrawer();
        }
      });
    /**
     * Shortcuts
     */
	  }
	  /**
	   * Pacth the form with the information of the database
	   */
	  patchForm(): void {
		this.${entityToUpperCaseOutInitial(
			entity
		)}Form.patchValue(this.${entityToUpperCaseOutInitial(entity)});
	  }
	  /**
	   * On destroy
	   */
	  ngOnDestroy(): void {
		/**
		 * Unsubscribe from all subscriptions
		 */
		this._unsubscribeAll.next(0);
		this._unsubscribeAll.complete();
		/**
		 * Dispose the overlays if they are still on the DOM
		 */
		if (this._tagsPanelOverlayRef) {
		  this._tagsPanelOverlayRef.dispose();
		}
	  }
	
	  /** ----------------------------------------------------------------------------------------------------- */
	  /** @ Public methods
	  /** ----------------------------------------------------------------------------------------------------- */

	  /**
	   * Close the drawer
	   */
	  closeDrawer(): Promise<MatDrawerToggleResult> {
		return this._${entityToUpperCaseOutInitial(
			entity
		)}ListComponent.matDrawer.close();
	  }
	  /**
	   * Toggle edit mode
	   * @param editMode
	   */
	  toggleEditMode(editMode: boolean | null = null): void {
		this.patchForm();

		if (editMode === null) {
		  this.editMode = !this.editMode;
		} else {
		  this.editMode = editMode;
		}
		/**
		 * Mark for check
		 */
		this._changeDetectorRef.markForCheck();
	  }
	
	  /**
	   * Update the ${entityToUpperCaseOutInitial(entity)}
	   */
	  update${entityToUpperCase(entity)}(): void {
		/**
		 * Get the ${entityToUpperCaseOutInitial(entity)}
		 */
		const id_user_ = this.data.user.id_user;
		let ${entityToUpperCaseOutInitial(entity)} = this.${entityToUpperCaseOutInitial(
		entity
	)}Form.getRawValue();
		/**
		 * Delete whitespace (trim() the atributes type string)
		 */
		 ${entityToUpperCaseOutInitial(entity)} = {...${entityToUpperCaseOutInitial(
		entity
	)},id_user_: parseInt(id_user_),
	id_${entity}: parseInt(${entityToUpperCaseOutInitial(
		entity
	)}.id_${entity}), ${otherIDs}}
		/**
		 * Update
		 */
		this._${entityToUpperCaseOutInitial(entity)}Service
		  .update${entityToUpperCase(entity)}(${entityToUpperCaseOutInitial(entity)})
		  .pipe(takeUntil(this._unsubscribeAll))
		  .subscribe({
			next: (_${entityToUpperCaseOutInitial(entity)}: ${entityToUpperCase(
		entity
	)}) => {
			  console.log(_${entityToUpperCaseOutInitial(entity)});
			  if (_${entityToUpperCaseOutInitial(entity)}) {
				this._notificationService.success(
				  '${nameVisibility} actualizada correctamente'
				);
				/**
				 * Toggle the edit mode off
				 */
				this.toggleEditMode(false);
			  } else {
				this._notificationService.error(
				  '¡Error interno!, consulte al administrador.'
				);
			  }
			},
			error: (error: { error: MessageAPI }) => {
			  console.log(error);
			  this._notificationService.error(
				!error.error
				  ? '¡Error interno!, consulte al administrador.'
				  : !error.error.descripcion
				  ? '¡Error interno!, consulte al administrador.'
				  : error.error.descripcion
			  );
			},
		  });
	  }
	  /**
	   * Delete the ${entityToUpperCaseOutInitial(entity)}
	   */
	  delete${entityToUpperCase(entity)}(): void {
		this._angelConfirmationService
		  .open({
				title: 'Eliminar ${entityToLowerCase(nameVisibility)}',
				message: '¿Estás seguro de que deseas eliminar esta ${entityToLowerCase(
					nameVisibility
				)}? ¡Esta acción no se puede deshacer!',
			})
		  .afterClosed()
		  .pipe(takeUntil(this._unsubscribeAll))
		  .subscribe((confirm: ActionAngelConfirmation) => {
			if (confirm === 'confirmed') {
				/**
				 * Get the current ${entityToUpperCaseOutInitial(entity)}'s id
				 */
			  const id_user_ = this.data.user.id_user;
			  const id_${entity} = this.${entityToUpperCaseOutInitial(entity)}.id_${entity};
			  /**
				* Get the next/previous ${entityToUpperCaseOutInitial(entity)}'s id
				*/
			  const currentIndex = this.${entityToUpperCaseOutInitial(entity)}s.findIndex(
				(item) => item.id_${entity} === id_${entity}
			  );
	
			  const nextIndex =
				currentIndex +
				(currentIndex === this.${entityToUpperCaseOutInitial(
					entity
				)}s.length - 1 ? -1 : 1);
			  const nextId =
				this.${entityToUpperCaseOutInitial(entity)}s.length === 1 &&
				this.${entityToUpperCaseOutInitial(entity)}s[0].id_${entity} === id_${entity}
				  ? null
				  : this.${entityToUpperCaseOutInitial(entity)}s[nextIndex].id_${entity};
				  /**
				   * Delete the ${entityToUpperCaseOutInitial(entity)}
				   */
			  this._${entityToUpperCaseOutInitial(entity)}Service
				.delete${entityToUpperCase(entity)}(id_user_, id_${entity})
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe({
					next: (response: boolean) => {
					  console.log(response);
					  if (response) {
						/**
						 * Return if the ${entityToUpperCaseOutInitial(
								entity
							)} wasn't deleted_newsletter...
						 */
						this._notificationService.success(
						  '${nameVisibility} eliminada correctamente'
						);
						/**
						 * Get the current activated route
						 */
						let route = this._activatedRoute;
						while (route.firstChild) {
						  route = route.firstChild;
						}
						/**
						 * Navigate to the next ${entityToUpperCaseOutInitial(entity)} if available
						 */
						if (nextId) {
						  this._router.navigate(['../', nextId], {
							relativeTo: route,
						  });
						}
						/**
						 * Otherwise, navigate to the parent
						 */
						else {
						  this._router.navigate(['../'], { relativeTo: route });
						}
						/**
						 * Toggle the edit mode off
						 */
						this.toggleEditMode(false);
					  } else {
						this._notificationService.error(
						  '¡Error interno!, consulte al administrador.'
						);
					  }
					},
					error: (error: { error: MessageAPI }) => {
					  console.log(error);
					  this._notificationService.error(
						!error.error
						  ? '¡Error interno!, consulte al administrador.'
						  : !error.error.descripcion
						  ? '¡Error interno!, consulte al administrador.'
						  : error.error.descripcion
					  );
					},
				  });
				  /**
				   * Mark for check
				   */
			  this._changeDetectorRef.markForCheck();
			}
			this._layoutService.setOpenModal(false);
		  });
	  }
	}
	`;
	/**
	 * Generate
	 */
	if (fs.existsSync(basePath) && !fs.existsSync(pathToCreate)) {
		fs.writeFileSync(`${pathToCreate}`, contentDetailsComponent);
	}
};

const generateGuard = (basePath: string, entity: string) => {
	const pathToCreate: string = `${basePath}${entityReplaceUnderscore(
		entity
	)}.guards.ts`;

	const contentGuard: string = `
	import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ${entityToUpperCase(
		entity
	)}DetailsComponent } from './details/details.component';

@Injectable({
  providedIn: 'root',
})
export class CanDeactivate${entityToUpperCase(entity)}Details
  implements CanDeactivate<${entityToUpperCase(entity)}DetailsComponent>
{
  canDeactivate(
    component: ${entityToUpperCase(entity)}DetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
	/**
	 * Get the next route
	 */
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) {
      nextRoute = nextRoute.firstChild;
    }
	/**
	 * If the next state doesn't contain '/${entityReplaceUnderscore(entity)}'
	 * it means we are navigating away from the
	 * ${entity} app
	*/
    if (!nextState.url.includes('/${entityReplaceUnderscore(entity)}')) {
	/**
	 * Let it navigate
	 */
      return true;
    }
	/**
	 * If we are navigating to another
	 */
    if (nextRoute.paramMap.get('id')) {
	/**
	 * Just navigate
	 */
      return true;
    }
    else {
	/**
	 * Close the drawer first, and then navigate
	 */
      return component.closeDrawer().then(() => {
        return true;
      });
    }
  }
}
	`;
	/**
	 * Generate
	 */
	if (fs.existsSync(basePath) && !fs.existsSync(pathToCreate)) {
		fs.writeFileSync(`${pathToCreate}`, contentGuard);
	}
};

const generateRouting = (basePath: string, entity: string) => {
	const pathToCreate: string = `${basePath}${entityReplaceUnderscore(
		entity
	)}.routing.ts`;

	const contentRouting: string = `
	import { Route } from '@angular/router';
import { ${entityToUpperCase(
		entity
	)}DetailsComponent } from './details/details.component';
import { ${entityToUpperCase(
		entity
	)}Component } from './${entityReplaceUnderscore(entity)}.component';
import { CanDeactivate${entityToUpperCase(
		entity
	)}Details } from './${entityReplaceUnderscore(entity)}.guards';
import { ${entityToUpperCase(
		entity
	)}Resolver } from './${entityReplaceUnderscore(entity)}.resolvers';
import { ${entityToUpperCase(
		entity
	)}ListComponent } from './list/list.component';

export const ${entityToUpperCaseOutInitial(entity)}Routes: Route[] = [
  {
    path: '',
    component: ${entityToUpperCase(entity)}Component,
    children: [
      {
        path: '',
        component: ${entityToUpperCase(entity)}ListComponent,
        children: [
          {
            path: ':id',
            component: ${entityToUpperCase(entity)}DetailsComponent,
            resolve: {
              task: ${entityToUpperCase(entity)}Resolver,
            },
            canDeactivate: [CanDeactivate${entityToUpperCase(entity)}Details],
          },
        ],
      },
    ],
  },
];
	`;
	/**
	 * Generate
	 */
	if (fs.existsSync(basePath) && !fs.existsSync(pathToCreate)) {
		fs.writeFileSync(`${pathToCreate}`, contentRouting);
	}
};

const generateModule = (basePath: string, entity: string) => {
	const pathToCreate: string = `${basePath}${entityReplaceUnderscore(
		entity
	)}.module.ts`;

	const contentModule: string = `
	import { NgModule } from '@angular/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import * as moment from 'moment';
import { AngelFindByKeyPipeModule } from '@angel/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { AngelAlertModule } from '@angel/components/alert';
import { ${entityToUpperCase(
		entity
	)}DetailsComponent } from './details/details.component';
import { ${entityToUpperCase(
		entity
	)}Component } from './${entityReplaceUnderscore(entity)}.component';
import { ${entityToUpperCaseOutInitial(
		entity
	)}Routes } from './${entityReplaceUnderscore(entity)}.routing';
import { ${entityToUpperCase(
		entity
	)}ListComponent } from './list/list.component';

@NgModule({
  declarations: [
    ${entityToUpperCase(entity)}ListComponent,
    ${entityToUpperCase(entity)}DetailsComponent,
    ${entityToUpperCase(entity)}Component,
  ],
  imports: [
    RouterModule.forChild(${entityToUpperCaseOutInitial(entity)}Routes),
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatMomentDateModule,
    MatProgressBarModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatTableModule,
    MatTooltipModule,
    AngelFindByKeyPipeModule,
	AngelAlertModule,
    SharedModule,
  ],
  providers: [
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: moment.ISO_8601,
        },
        display: {
          dateInput: 'LL',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
  ],
})
export class ${entityToUpperCase(entity)}Module {}

	`;
	/**
	 * Generate
	 */
	if (fs.existsSync(basePath) && !fs.existsSync(pathToCreate)) {
		fs.writeFileSync(`${pathToCreate}`, contentModule);
	}
};

export { entityFrontendGenerate };
