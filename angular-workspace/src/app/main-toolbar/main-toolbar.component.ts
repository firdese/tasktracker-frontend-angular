import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SoftwareMetadataService } from '../software-metadata.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { keycloak } from '../keycloak-init';

@Component({
  selector: 'app-main-toolbar',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './main-toolbar.component.html',
  styleUrl: './main-toolbar.component.scss',
})
export class MainToolbarComponent implements OnInit {
  softwareVersion: string = '';

  constructor(private _softwareMetadataService: SoftwareMetadataService) {}
  ngOnInit(): void {
    this._softwareMetadataService.softwareVersion$.subscribe(
      (softwareVersion) => {
        this.softwareVersion = softwareVersion;
      },
    );
  }

  onUserAccountClicked() {
    keycloak.logout();
  }
}
