import { Route } from '@angular/router';
import { CourseComponent } from './course.component';
import { CanDeactivateCourseDetails } from './course.guards';
import { CourseResolver } from './course.resolvers';
import { CourseDetailsComponent } from './details/details.component';
import { CourseListComponent } from './list/list.component';

export const courseRoutes: Route[] = [
  {
    path: '',
    component: CourseComponent,
    children: [
      {
        path: '',
        component: CourseListComponent,
        children: [
          {
            path: ':id',
            component: CourseDetailsComponent,
            resolve: {
              task: CourseResolver,
            },
            canDeactivate: [CanDeactivateCourseDetails],
          },
        ],
      },
    ],
  },
];
