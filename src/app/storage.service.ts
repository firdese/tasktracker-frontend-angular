import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { StoredObject, TaskAttachment } from '../model/storage.types';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly baseStorageUrl = `${environment.api.baseUrl}/storage`;
  private readonly baseTaskUrl = `${environment.api.baseUrl}/tasks`;

  constructor(private _httpClient: HttpClient) {}

  upload(file: File): Observable<StoredObject> {
    const formData = new FormData();
    formData.append('file', file);

    return this._httpClient.post<StoredObject>(this.baseStorageUrl, formData);
  }

  listTaskAttachments(taskId: number): Observable<TaskAttachment[]> {
    return this._httpClient.get<TaskAttachment[]>(
      `${this.baseTaskUrl}/${taskId}/attachments`,
    );
  }

  uploadTaskAttachment(taskId: number, file: File): Observable<TaskAttachment> {
    const formData = new FormData();
    formData.append('file', file);

    return this._httpClient.post<TaskAttachment>(
      `${this.baseTaskUrl}/${taskId}/attachments`,
      formData,
    );
  }

  download(objectKey: string): Observable<Blob> {
    return this._httpClient.get(`${this.baseStorageUrl}/${encodeURI(objectKey)}`, {
      responseType: 'blob',
    });
  }

  delete(objectKey: string): Observable<void> {
    return this._httpClient.delete<void>(`${this.baseStorageUrl}/${encodeURI(objectKey)}`);
  }

  deleteTaskAttachment(taskId: number, attachmentId: number): Observable<void> {
    return this._httpClient.delete<void>(
      `${this.baseTaskUrl}/${taskId}/attachments/${attachmentId}`,
    );
  }
}
