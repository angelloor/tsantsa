import { AngelAlertModule } from '@angel/components/alert';
import { AngelFindByKeyPipeModule } from '@angel/pipes/find-by-key';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import * as moment from 'moment';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { CourseComponent } from './course.component';
import { courseRoutes } from './course.routing';
import { CourseDetailsComponent } from './details/details.component';
import { CourseListComponent } from './list/list.component';
import { ModalEnrollmentComponent } from './modal-enrollment/modal-enrollment.component';
import { ModalResourceCourseComponent } from './resource_course/modal-resource-course/modal-resource-course.component';
import { ModalResourceCoursesComponent } from './resource_course/modal-resource-courses/modal-resource-courses.component';
import { ModalUploadResourceCourseComponent } from './resource_course/modal-upload-resource-course/modal-upload-resource-course.component';
import { ModalGlossarysComponent } from './glossary/modal-glossarys/modal-glossarys.component';
import { ModalGlossaryComponent } from './glossary/modal-glossary/modal-glossary.component';
import { ModalForumComponent } from './forum/modal-forum/modal-forum.component';
import { ModalForumsComponent } from './forum/modal-forums/modal-forums.component';
import { ModalGlossaryStudentComponent } from './glossary/modal-glossary-student/modal-glossary-student.component';
import { ModalResourceCourseStudentComponent } from './resource_course/modal-resource-course-student/modal-resource-course-student.component';

@NgModule({
  declarations: [
    CourseListComponent,
    CourseDetailsComponent,
    CourseComponent,
    ModalEnrollmentComponent,
    ModalResourceCoursesComponent,
    ModalResourceCourseComponent,
    ModalUploadResourceCourseComponent,
    ModalGlossarysComponent,
    ModalGlossaryComponent,
    ModalForumComponent,
    ModalForumsComponent,
    ModalGlossaryStudentComponent,
    ModalResourceCourseStudentComponent,
  ],
  imports: [
    RouterModule.forChild(courseRoutes),
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MaterialFileInputModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatMenuModule,
    MatMomentDateModule,
    MatProgressBarModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatTableModule,
    MatTooltipModule,
    AngelFindByKeyPipeModule,
    AngelAlertModule,
    SharedModule,
  ],
  providers: [
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: moment.ISO_8601,
        },
        display: {
          dateInput: 'LL',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CourseModule {}
