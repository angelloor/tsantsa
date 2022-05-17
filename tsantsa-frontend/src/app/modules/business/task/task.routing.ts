import { Route } from '@angular/router';
import { TaskListComponent } from './list/list.component';
import { ModalTaskComponent } from './modal-task/modal-task.component';
import { CanDeactivateTaskDetails } from './task.guards';
import { TaskResolver } from './task.resolvers';

export const taskRoutes: Route[] = [
  {
    path: '',
    component: TaskListComponent,
  },
  {
    path: ':id',
    component: ModalTaskComponent,
    resolve: {
      task: TaskResolver,
    },
    canDeactivate: [CanDeactivateTaskDetails],
  },
];
