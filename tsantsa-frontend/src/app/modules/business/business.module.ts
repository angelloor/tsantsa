import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Route, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { ModalSelectCourseComponent } from './shared/modal-select-course/modal-select-course.component';

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
];

@NgModule({
  declarations: [HomeComponent, ModalSelectCourseComponent],
  imports: [
    RouterModule.forChild(businessRoutes),
    FormsModule,
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    MatFormFieldModule,

    MatInputModule,
    ReactiveFormsModule,
  ],
})
export class BusinessModule {}
