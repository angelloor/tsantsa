import { Route } from '@angular/router';
import { PeriodDetailsComponent } from './details/details.component';
import { PeriodListComponent } from './list/list.component';
import { PeriodComponent } from './period.component';
import { CanDeactivatePeriodDetails } from './period.guards';
import { PeriodResolver } from './period.resolvers';

export const periodRoutes: Route[] = [
  {
    path: '',
    component: PeriodComponent,
    children: [
      {
        path: '',
        component: PeriodListComponent,
        children: [
          {
            path: ':id',
            component: PeriodDetailsComponent,
            resolve: {
              task: PeriodResolver,
            },
            canDeactivate: [CanDeactivatePeriodDetails],
          },
        ],
      },
    ],
  },
];
