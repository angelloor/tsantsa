import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppInitialData, MessageAPI } from 'app/core/app/app.type';
import { AssistanceService } from 'app/modules/business/assistance/assistance.service';
import { CareerService } from 'app/modules/business/career/career.service';
import { CourseService } from 'app/modules/business/course/course.service';
import { EnrollmentService } from 'app/modules/business/enrollment/enrollment.service';
import { PeriodService } from 'app/modules/business/period/period.service';
import { ModalSelectCourseService } from 'app/modules/business/shared/modal-select-course/modal-select-course.service';
import { ModalSelectPeriodService } from 'app/modules/business/shared/modal-select-period/modal-select-period.service';
import { ModalSelectReportUserTaskService } from 'app/modules/business/shared/modal-select-report-user-task/modal-select-report-user-task.service';
import { ModalSelectUserCourseService } from 'app/modules/business/shared/modal-select-user-course/modal-select-user-course.service';
import { TaskService } from 'app/modules/business/task/task.service';
import { UserTaskService } from 'app/modules/business/user-task/user-task.service';
import { ModalSelectUserService } from 'app/modules/core/shared/modal-select-user/modal-select-user.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { PreviewReportComponent } from 'app/shared/preview-report/preview-report.component';
import { GlobalUtils } from 'app/utils/GlobalUtils';
import { Subject, takeUntil } from 'rxjs';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  pdfSource: string = '';
  private data!: AppInitialData;

  constructor(
    private _store: Store<{ global: AppInitialData }>,
    private _globalUtils: GlobalUtils,
    private _matDialog: MatDialog,
    private _reportService: ReportService,
    private _modalSelectCourseService: ModalSelectCourseService,
    private _modalSelectPeriodService: ModalSelectPeriodService,
    private _modalSelectUserCourseService: ModalSelectUserCourseService,
    private _modalSelectUserService: ModalSelectUserService,
    private _periodService: PeriodService,
    private _careerService: CareerService,
    private _courseService: CourseService,
    private _enrollmentService: EnrollmentService,
    private _taskService: TaskService,
    private _userTaskService: UserTaskService,
    private _assistanceService: AssistanceService,
    private _notificationService: NotificationService,
    private _modalSelectReportUserTaskService: ModalSelectReportUserTaskService
  ) {}

  ngOnInit(): void {
    /**
     * Subscribe to user changes of state
     */
    this._store.pipe(takeUntil(this._unsubscribeAll)).subscribe((state) => {
      this.data = state.global;
    });
  }
  /**
   * reportPeriod
   */
  reportPeriod() {
    const id_user_: string = this.data.user.id_user;

    this._periodService
      .reportPeriod()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: async (response: any) => {
          let name_report: string = response.headers.get('name_report');
          if (name_report) {
            this.pdfSource = await this._globalUtils.blobToBase64(
              response.body
            );

            let dialogRef = this._matDialog.open(PreviewReportComponent, {
              height: ' 90vh',
              width: '90vw',
              data: {
                source: this.pdfSource,
                nameFile: name_report,
              },
            });
            /**
             * subscribe to afterClosed
             */
            dialogRef.afterClosed().subscribe(() => {
              this._reportService
                .deleteReport(id_user_, name_report)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe();
            });
          } else {
            let message: MessageAPI = JSON.parse(
              response.headers.get('message')
            );
            if (message.codigo == '06-010') {
              this._notificationService.error(
                !message.descripcion
                  ? '¡Error interno!, consulte al administrador.'
                  : message.descripcion
              );
            }
          }
        },
        error: () => {
          this._notificationService.error(
            '¡Error interno!, consulte al administrador.'
          );
        },
      });
  }
  /**
   * reportCareer
   */
  reportCareer() {
    const id_user_: string = this.data.user.id_user;

    this._careerService
      .reportCareer()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: async (response: any) => {
          let name_report: string = response.headers.get('name_report');
          if (name_report) {
            this.pdfSource = await this._globalUtils.blobToBase64(
              response.body
            );

            let dialogRef = this._matDialog.open(PreviewReportComponent, {
              height: ' 90vh',
              width: '90vw',
              data: {
                source: this.pdfSource,
                nameFile: name_report,
              },
            });
            /**
             * subscribe to afterClosed
             */
            dialogRef.afterClosed().subscribe(() => {
              this._reportService
                .deleteReport(id_user_, name_report)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe();
            });
          } else {
            let message: MessageAPI = JSON.parse(
              response.headers.get('message')
            );
            if (message.codigo == '06-010') {
              this._notificationService.error(
                !message.descripcion
                  ? '¡Error interno!, consulte al administrador.'
                  : message.descripcion
              );
            }
          }
        },
        error: () => {
          this._notificationService.error(
            '¡Error interno!, consulte al administrador.'
          );
        },
      });
  }
  /**
   * reportCourseByPeriod
   */
  reportCourseByPeriod() {
    const id_user_: string = this.data.user.id_user;

    this._modalSelectPeriodService
      .openModalSelectPeriod()
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((id_period: string) => {
        if (id_period) {
          this._courseService
            .reportCourseByPeriod(id_period)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: async (response: any) => {
                let name_report: string = response.headers.get('name_report');
                if (name_report) {
                  this.pdfSource = await this._globalUtils.blobToBase64(
                    response.body
                  );

                  let dialogRef = this._matDialog.open(PreviewReportComponent, {
                    height: ' 90vh',
                    width: '90vw',
                    data: {
                      source: this.pdfSource,
                      nameFile: name_report,
                    },
                  });
                  /**
                   * subscribe to afterClosed
                   */
                  dialogRef.afterClosed().subscribe(() => {
                    this._reportService
                      .deleteReport(id_user_, name_report)
                      .pipe(takeUntil(this._unsubscribeAll))
                      .subscribe();
                  });
                } else {
                  let message: MessageAPI = JSON.parse(
                    response.headers.get('message')
                  );
                  if (message.codigo == '06-010') {
                    this._notificationService.error(
                      !message.descripcion
                        ? '¡Error interno!, consulte al administrador.'
                        : message.descripcion
                    );
                  }
                }
              },
              error: () => {
                this._notificationService.error(
                  '¡Error interno!, consulte al administrador.'
                );
              },
            });
        }
      });
  }
  /**
   * reportEnrollmentByCourse
   */
  reportEnrollmentByCourse() {
    const id_user_: string = this.data.user.id_user;

    this._modalSelectCourseService
      .openModalSelectCourse()
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((id_course: string) => {
        if (id_course) {
          this._enrollmentService
            .reportEnrollmentByCourse(id_course)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: async (response: any) => {
                let name_report: string = response.headers.get('name_report');
                if (name_report) {
                  this.pdfSource = await this._globalUtils.blobToBase64(
                    response.body
                  );

                  let dialogRef = this._matDialog.open(PreviewReportComponent, {
                    height: ' 90vh',
                    width: '90vw',
                    data: {
                      source: this.pdfSource,
                      nameFile: name_report,
                    },
                  });
                  /**
                   * subscribe to afterClosed
                   */
                  dialogRef.afterClosed().subscribe(() => {
                    this._reportService
                      .deleteReport(id_user_, name_report)
                      .pipe(takeUntil(this._unsubscribeAll))
                      .subscribe();
                  });
                } else {
                  let message: MessageAPI = JSON.parse(
                    response.headers.get('message')
                  );
                  if (message.codigo == '06-010') {
                    this._notificationService.error(
                      !message.descripcion
                        ? '¡Error interno!, consulte al administrador.'
                        : message.descripcion
                    );
                  }
                }
              },
              error: () => {
                this._notificationService.error(
                  '¡Error interno!, consulte al administrador.'
                );
              },
            });
        }
      });
  }
  /**
   * reportTaskByCourse
   */
  reportTaskByCourse() {
    const id_user_: string = this.data.user.id_user;

    this._modalSelectCourseService
      .openModalSelectCourse()
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((id_course: string) => {
        if (id_course) {
          this._taskService
            .reportTaskByCourse(id_course)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: async (response: any) => {
                let name_report: string = response.headers.get('name_report');
                if (name_report) {
                  this.pdfSource = await this._globalUtils.blobToBase64(
                    response.body
                  );

                  let dialogRef = this._matDialog.open(PreviewReportComponent, {
                    height: ' 90vh',
                    width: '90vw',
                    data: {
                      source: this.pdfSource,
                      nameFile: name_report,
                    },
                  });
                  /**
                   * subscribe to afterClosed
                   */
                  dialogRef.afterClosed().subscribe(() => {
                    this._reportService
                      .deleteReport(id_user_, name_report)
                      .pipe(takeUntil(this._unsubscribeAll))
                      .subscribe();
                  });
                } else {
                  let message: MessageAPI = JSON.parse(
                    response.headers.get('message')
                  );
                  if (message.codigo == '06-010') {
                    this._notificationService.error(
                      !message.descripcion
                        ? '¡Error interno!, consulte al administrador.'
                        : message.descripcion
                    );
                  }
                }
              },
              error: () => {
                this._notificationService.error(
                  '¡Error interno!, consulte al administrador.'
                );
              },
            });
        }
      });
  }
  /**
   * reportUserTaskByUser
   */
  reportUserTaskByUser() {
    const id_user_: string = this.data.user.id_user;

    this._modalSelectReportUserTaskService
      .openModalSelectReportUserTask()
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        if (data) {
          this._userTaskService
            .reportUserTaskByUser(data.id_user, data.id_course, data.id_partial)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: async (response: any) => {
                let name_report: string = response.headers.get('name_report');
                if (name_report) {
                  this.pdfSource = await this._globalUtils.blobToBase64(
                    response.body
                  );

                  let dialogRef = this._matDialog.open(PreviewReportComponent, {
                    height: ' 90vh',
                    width: '90vw',
                    data: {
                      source: this.pdfSource,
                      nameFile: name_report,
                    },
                  });
                  /**
                   * subscribe to afterClosed
                   */
                  dialogRef.afterClosed().subscribe(() => {
                    this._reportService
                      .deleteReport(id_user_, name_report)
                      .pipe(takeUntil(this._unsubscribeAll))
                      .subscribe();
                  });
                } else {
                  let message: MessageAPI = JSON.parse(
                    response.headers.get('message')
                  );
                  if (message.codigo == '06-010') {
                    this._notificationService.error(
                      !message.descripcion
                        ? '¡Error interno!, consulte al administrador.'
                        : message.descripcion
                    );
                  }
                }
              },
              error: () => {
                this._notificationService.error(
                  '¡Error interno!, consulte al administrador.'
                );
              },
            });
        }
      });
  }
  /**
   * reportAssistanceByUserAndCourse
   */
  reportAssistanceByUserAndCourse() {
    const id_user_: string = this.data.user.id_user;

    this._modalSelectUserCourseService
      .openModalSelectUserCourse()
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        if (data) {
          if (data.id_user || data.id_course) {
            this._assistanceService
              .reportAssistanceByUserAndCourse(data.id_user, data.id_course)
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe({
                next: async (response: any) => {
                  let name_report: string = response.headers.get('name_report');
                  if (name_report) {
                    this.pdfSource = await this._globalUtils.blobToBase64(
                      response.body
                    );

                    let dialogRef = this._matDialog.open(
                      PreviewReportComponent,
                      {
                        height: ' 90vh',
                        width: '90vw',
                        data: {
                          source: this.pdfSource,
                          nameFile: name_report,
                        },
                      }
                    );
                    /**
                     * subscribe to afterClosed
                     */
                    dialogRef.afterClosed().subscribe(() => {
                      this._reportService
                        .deleteReport(id_user_, name_report)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe();
                    });
                  } else {
                    let message: MessageAPI = JSON.parse(
                      response.headers.get('message')
                    );
                    if (message.codigo == '06-010') {
                      this._notificationService.error(
                        !message.descripcion
                          ? '¡Error interno!, consulte al administrador.'
                          : message.descripcion
                      );
                    }
                  }
                },
                error: () => {
                  this._notificationService.error(
                    '¡Error interno!, consulte al administrador.'
                  );
                },
              });
          }
        }
      });
  }
}
