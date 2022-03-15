import { Route } from '@angular/router';
import { UserTaskListComponent } from './list/list.component';
import { ModalUserTaskComponent } from './modal-user-task/modal-user-task.component';
import { UserTaskComponent } from './user-task.component';
import { CanDeactivateUserTaskDetails } from './user-task.guards';
import { UserTaskResolver } from './user-task.resolvers';

export const userTaskRoutes: Route[] = [
  {
    path: '',
    component: UserTaskComponent,
    children: [
      {
        path: '',
        component: UserTaskListComponent,
        children: [
          {
            path: ':id',
            component: ModalUserTaskComponent,
            resolve: {
              task: UserTaskResolver,
            },
            canDeactivate: [CanDeactivateUserTaskDetails],
          },
        ],
      },
    ],
  },
];
