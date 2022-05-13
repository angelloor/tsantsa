import { Route } from '@angular/router';
import { CanDeactivateEnrollmentDetails } from './enrollment.guards';
import { EnrollmentResolver } from './enrollment.resolvers';
import { EnrollmentListComponent } from './list/list.component';
import { ModalEnrollmentComponent } from './modal-enrollment/modal-enrollment.component';

export const enrollmentRoutes: Route[] = [
  {
    path: '',
    component: EnrollmentListComponent,
  },
  {
    path: ':id',
    component: ModalEnrollmentComponent,
    resolve: {
      task: EnrollmentResolver,
    },
    canDeactivate: [CanDeactivateEnrollmentDetails],
  },
];
