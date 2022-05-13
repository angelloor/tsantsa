import { Route } from '@angular/router';
import { NewsletterDetailsComponent } from './details/details.component';
import { NewsletterListComponent } from './list/list.component';
import { NewsletterComponent } from './newsletter.component';
import { CanDeactivateNewsletterDetails } from './newsletter.guards';
import { NewsletterResolver } from './newsletter.resolvers';

export const newsletterRoutes: Route[] = [
  {
    path: '',
    component: NewsletterComponent,
    children: [
      {
        path: '',
        component: NewsletterListComponent,
        children: [
          {
            path: ':id',
            component: NewsletterDetailsComponent,
            resolve: {
              task: NewsletterResolver,
            },
            canDeactivate: [CanDeactivateNewsletterDetails],
          },
        ],
      },
    ],
  },
];
