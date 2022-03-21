import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-preview-report',
  templateUrl: './preview-report.component.html',
  styleUrls: ['./preview-report.component.scss'],
})
export class PreviewReportComponent implements OnInit {
  pdfSource: string = '';
  theme: string = 'light';
  nameDownload: string = 'report';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  ngOnInit(): void {
    this.pdfSource = this.data.source;
    this.nameDownload = this.data.nameFile;
  }
}
