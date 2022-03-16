import { Route } from '@angular/router';
import { AssistanceComponent } from './assistance.component';
import { CanDeactivateAssistanceDetails } from './assistance.guards';
import { AssistanceResolver } from './assistance.resolvers';
import { AssistanceListComponent } from './list/list.component';
import { ModalAssistanceComponent } from './modal-assistance/modal-assistance.component';

export const assistanceRoutes: Route[] = [
  {
    path: '',
    component: AssistanceComponent,
    children: [
      {
        path: '',
        component: AssistanceListComponent,
        children: [
          {
            path: ':id',
            component: ModalAssistanceComponent,
            resolve: {
              task: AssistanceResolver,
            },
            canDeactivate: [CanDeactivateAssistanceDetails],
          },
        ],
      },
    ],
  },
];
