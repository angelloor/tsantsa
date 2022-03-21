import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { LocalDatePipe } from './pipes/local-date.pipe';
import { PreviewReportComponent } from './preview-report/preview-report.component';

@NgModule({
  declarations: [LocalDatePipe, PreviewReportComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxExtendedPdfViewerModule,
    MatIconModule,
    MatDialogModule,
  ],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, LocalDatePipe],
})
export class SharedModule {}
