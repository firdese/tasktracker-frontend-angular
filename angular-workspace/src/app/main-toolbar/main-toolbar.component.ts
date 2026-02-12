import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SoftwareMetadataService } from '../software-metadata.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { keycloak } from '../keycloak-init';

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

  constructor(private _softwareMetadataService: SoftwareMetadataService) {}
  ngOnInit(): void {
    this._softwareMetadataService.softwareVersion$.subscribe(
      (softwareVersion) => {
        this.softwareVersion = softwareVersion;
      },
    );

    const token = (keycloak.tokenParsed ?? {}) as Record<string, string>;
    this.displayName =
      token['name'] ?? token['preferred_username'] ?? token['given_name'] ?? 'Account';
    this.displayEmail = token['email'] ?? '';

    const initialsSource = this.displayName.trim();
    this.userInitials = initialsSource
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  onUserAccountClicked() {
    keycloak.logout();
  }
}
