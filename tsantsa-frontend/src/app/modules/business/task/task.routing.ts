import { Route } from '@angular/router';
import { TaskDetailsComponent } from './details/details.component';
import { TaskListComponent } from './list/list.component';
import { TaskComponent } from './task.component';
import { CanDeactivateTaskDetails } from './task.guards';
import { TaskResolver } from './task.resolvers';

export const taskRoutes: Route[] = [
  {
    path: '',
    component: TaskComponent,
    children: [
      {
        path: '',
        component: TaskListComponent,
        children: [
          {
            path: ':id',
            component: TaskDetailsComponent,
            resolve: {
              task: TaskResolver,
            },
            canDeactivate: [CanDeactivateTaskDetails],
          },
        ],
      },
    ],
  },
];
