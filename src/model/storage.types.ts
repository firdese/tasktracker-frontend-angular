export interface StoredObject {
  objectKey: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface TaskAttachment extends StoredObject {
  taskAttachmentId: number;
  taskId: number;
  createdAtUtc: string;
}
