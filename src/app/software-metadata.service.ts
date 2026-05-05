import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SoftwareMetadataService {
  private _softwareVersion = new BehaviorSubject<string>('v0.0.1');

  // Observable getter
  get softwareVersion$(): Observable<string> {
    return this._softwareVersion.asObservable();
  }
  constructor() {}
}
