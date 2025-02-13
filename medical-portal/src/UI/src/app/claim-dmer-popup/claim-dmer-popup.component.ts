import { Component, Inject, OnInit } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { DocumentService } from '@app/shared/api/services';
import { Endorsement } from '@app/shared/api/models';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfileManagementService } from '@app/shared/services/profile.service';
import { Role } from '@app/features/auth/enums/role.enum';
import { LicenceStatusCode } from '@app/app.model';

@Component({
  selector: 'app-claim-dmer-popup',
  standalone: true,
  imports: [
    MatIconModule,
    MatDialogModule,
    MatRadioModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './claim-dmer-popup.component.html',
  styleUrl: './claim-dmer-popup.component.scss',
})
export class ClaimDmerPopupComponent implements OnInit {
  public practitioners: Endorsement[] = [];
  public selectedPractitioner?: string;

  constructor(
    private documentService: DocumentService,
    @Inject(MAT_DIALOG_DATA) public documentId: string,
    @Inject(MatDialogRef<ClaimDmerPopupComponent>)
    private dialogRef: MatDialogRef<ClaimDmerPopupComponent>,
    private _snackBar: MatSnackBar,
    private profileManagementService: ProfileManagementService
  ) { }

  ngOnInit(): void {
    var profile = this.profileManagementService.getCachedProfile();
    this.practitioners = profile.endorsements?.filter(e => e.role === Role.Practitioner && e.licences?.some(l => l.statusCode === LicenceStatusCode.Active)) as Endorsement[]
    // check if the current user is a practitioner
    if (profile.roles?.some(r => r == Role.Practitioner)) {
      // get current logged in user
      var loggedInUser: Endorsement = {
        userId: profile.id,
        loginId: profile.loginId as string,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        // TODO move this somewhere the logic can be reused
        role: profile.roles?.some(r => r == Role.Practitioner) ? Role.Practitioner : Role.Moa,
        licences: []
      }
      this.practitioners.unshift(loggedInUser);
    }
 }

 onAssignDmer() {
  this.documentService
    .apiDocumentAssignDmerPost$Json({
      documentId: this.documentId as string,
      loginId: this.selectedPractitioner
    })
    .subscribe(() => {
      this._snackBar.open('Successfully assigned the DMER', 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        duration: 5000,
      });
      this.dialogRef.close();
    });
}

  onClaimDmer() {
    this.documentService
      .apiDocumentClaimDmerPost$Json({
        documentId: this.documentId as string,
      })
      .subscribe(() => {
        this._snackBar.open('Successfully claimed the DMER', 'Close', {
          horizontalPosition: 'center',
          verticalPosition: 'top',
          duration: 5000,
        });
        this.dialogRef.close();
      });
  }

  onUnclaimDmer() {
    console.log('Unclaiming DMER', this.documentId);
    this.documentService
      .apiDocumentUnclaimDmerPost$Json({
        documentId: this.documentId as string,
      })
      .subscribe(() => {
        this._snackBar.open('Successfully Unclaimed the DMER', 'Close', {
          horizontalPosition: 'center',
          verticalPosition: 'top',
          duration: 5000,
        });
        this.dialogRef.close();
      });
  }
}
