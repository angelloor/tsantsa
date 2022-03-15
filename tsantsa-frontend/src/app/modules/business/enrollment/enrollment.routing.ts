import { Route } from '@angular/router';
import { EnrollmentDetailsComponent } from './details/details.component';
import { EnrollmentComponent } from './enrollment.component';
import { CanDeactivateEnrollmentDetails } from './enrollment.guards';
import { EnrollmentResolver } from './enrollment.resolvers';
import { EnrollmentListComponent } from './list/list.component';

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
            component: EnrollmentDetailsComponent,
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
