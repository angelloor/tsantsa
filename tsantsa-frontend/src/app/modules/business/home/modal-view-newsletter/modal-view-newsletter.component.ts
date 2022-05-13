import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { newsletter } from 'app/modules/core/newsletter/newsletter.data';
import { Newsletter } from 'app/modules/core/newsletter/newsletter.types';
import { ModalViewNewsletterService } from './modal-view-newsletter.service';

@Component({
  selector: 'app-modal-view-newsletter',
  templateUrl: './modal-view-newsletter.component.html',
})
export class ModalViewNewsletterComponent implements OnInit {
  newsletter: Newsletter = newsletter;

  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _modalViewNewsletterService: ModalViewNewsletterService
  ) {}

  ngOnInit(): void {
    this.newsletter = this._data.newsletter;
  }
  /**
   * closeModalViewNewsletter
   */
  closeModalViewNewsletter(): void {
    this._modalViewNewsletterService.closeModalViewNewsletter();
  }
}
