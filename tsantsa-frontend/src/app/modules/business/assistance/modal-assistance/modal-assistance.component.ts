import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutService } from 'app/layout/layout.service';
import { ModalAssistanceDetailsComponent } from './modal-assistance-details/modal-assistance-details.component';

@Component({
  selector: 'app-modal-assistance',
  templateUrl: './modal-assistance.component.html',
})
export class ModalAssistanceComponent implements OnInit {
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _matDialog: MatDialog,
    private _router: Router,
    private _layoutService: LayoutService
  ) {}

  ngOnInit(): void {
    // Launch the modal
    this._layoutService.setOpenModal(true);

    this._matDialog
      .open(ModalAssistanceDetailsComponent, {
        minHeight: 'inherit',
        maxHeight: '90vh',
        height: 'auto',
        width: '40rem',
        maxWidth: '',
        panelClass: ['mat-dialog-cont'],
        disableClose: true,
      })
      .afterClosed()
      .subscribe(() => {
        // Go up twice because card routes are setup like this; "card/CARD_ID"
        this._router.navigate(['../'], {
          relativeTo: this._activatedRoute,
        });
      });
  }
}
