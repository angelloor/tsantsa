import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Route, RouterModule } from '@angular/router';
import { NotfoundComponent } from './not-found/not-found.component';

const publicRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'not-found',
  },
  {
    path: 'not-found',
    component: NotfoundComponent,
  },
];

@NgModule({
  declarations: [NotfoundComponent],
  imports: [
    RouterModule.forChild(publicRoutes),
    FormsModule,
    CommonModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
})
export class PublicModule {}
