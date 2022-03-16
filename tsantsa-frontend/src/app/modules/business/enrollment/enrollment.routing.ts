import { Route } from '@angular/router';
import { EnrollmentComponent } from './enrollment.component';
import { CanDeactivateEnrollmentDetails } from './enrollment.guards';
import { EnrollmentResolver } from './enrollment.resolvers';
import { EnrollmentListComponent } from './list/list.component';
import { ModalEnrollmentComponent } from './modal-enrollment/modal-enrollment.component';

export const enrollmentRoutes: Route[] = [
  {
    path: '',
    component: EnrollmentComponent,
    children: [
      {
        path: '',
        component: EnrollmentListComponent,
        children: [
          {
            path: ':id',
            component: ModalEnrollmentComponent,
            resolve: {
              task: EnrollmentResolver,
            },
            canDeactivate: [CanDeactivateEnrollmentDetails],
          },
        ],
      },
    ],
  },
];
