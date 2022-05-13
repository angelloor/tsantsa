import { AngelAlertModule } from '@angel/components/alert';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Route, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { SharedModule } from 'app/shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { HomeComponent } from './home/home.component';
import { ModalSelectCourseComponent } from './shared/modal-select-course/modal-select-course.component';
import { ModalSelectPartialComponent } from './shared/modal-select-partial/modal-select-partial.component';
import { ModalSelectPeriodComponent } from './shared/modal-select-period/modal-select-period.component';
import { ModalSelectTaskComponent } from './shared/modal-select-task/modal-select-task.component';
import { ModalSelectUserCourseComponent } from './shared/modal-select-user-course/modal-select-user-course.component';
import { ModalViewNewsletterComponent } from './home/modal-view-newsletter/modal-view-newsletter.component';

const businessRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    component: HomeComponent,
  },
  {
    path: 'period',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    loadChildren: () =>
      import('./period/period.module').then((m) => m.PeriodModule),
  },
  {
    path: 'career',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    loadChildren: () =>
      import('./career/career.module').then((m) => m.CareerModule),
  },
  {
    path: 'course',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    loadChildren: () =>
      import('./course/course.module').then((m) => m.CourseModule),
  },
  {
    path: 'task',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    loadChildren: () => import('./task/task.module').then((m) => m.TaskModule),
  },
  {
    path: 'my-courses',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    loadChildren: () =>
      import('./enrollment/enrollment.module').then((m) => m.EnrollmentModule),
  },
  {
    path: 'user-task',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    loadChildren: () =>
      import('./user-task/user-task.module').then((m) => m.UserTaskModule),
  },
  {
    path: 'assistance',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    loadChildren: () =>
      import('./assistance/assistance.module').then((m) => m.AssistanceModule),
  },
];

@NgModule({
  declarations: [
    HomeComponent,
    ModalSelectCourseComponent,
    ModalSelectPeriodComponent,
    ModalSelectTaskComponent,
    ModalSelectUserCourseComponent,
    ModalSelectPartialComponent,
    ModalViewNewsletterComponent,
  ],
  imports: [
    RouterModule.forChild(businessRoutes),
    FormsModule,
    CommonModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    AngelAlertModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressBarModule,
    MatRippleModule,
    MatSidenavModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    NgApexchartsModule,
    SharedModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
})
export class BusinessModule {}
