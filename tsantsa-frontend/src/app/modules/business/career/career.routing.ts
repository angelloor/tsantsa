import { Route } from '@angular/router';
import { CareerComponent } from './career.component';
import { CanDeactivateCareerDetails } from './career.guards';
import { CareerResolver } from './career.resolvers';
import { CareerDetailsComponent } from './details/details.component';
import { CareerListComponent } from './list/list.component';

export const careerRoutes: Route[] = [
  {
    path: '',
    component: CareerComponent,
    children: [
      {
        path: '',
        component: CareerListComponent,
        children: [
          {
            path: ':id',
            component: CareerDetailsComponent,
            resolve: {
              task: CareerResolver,
            },
            canDeactivate: [CanDeactivateCareerDetails],
          },
        ],
      },
    ],
  },
];
