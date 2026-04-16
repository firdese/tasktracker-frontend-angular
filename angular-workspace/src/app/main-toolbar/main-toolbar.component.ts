import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SoftwareMetadataService } from '../software-metadata.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { getUserProfile, signOut } from '../auth-session';

@Component({
  selector: 'app-main-toolbar',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './main-toolbar.component.html',
  styleUrl: './main-toolbar.component.scss',
})
export class MainToolbarComponent implements OnInit {
  softwareVersion: string = '';
  displayName: string = 'Account';
  displayEmail: string = '';
  userInitials: string = 'U';

  constructor(
    private _softwareMetadataService: SoftwareMetadataService,
    private _router: Router,
  ) {}
  ngOnInit(): void {
    this._softwareMetadataService.softwareVersion$.subscribe(
      (softwareVersion) => {
        this.softwareVersion = softwareVersion;
      },
    );

    const userProfile = getUserProfile();
    this.displayName = userProfile.name;
    this.displayEmail = userProfile.email;

    const initialsSource = this.displayName.trim();
    this.userInitials = initialsSource
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  onUserAccountClicked() {
    signOut();
    void this._router.navigateByUrl('/login');
  }
}
