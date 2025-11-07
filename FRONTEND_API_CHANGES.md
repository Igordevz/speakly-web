# Backend API Changes for Media Upload and Processing

This document outlines the changes made to the backend API to support media (audio and video) upload, processing, and deletion. The frontend application will need to be updated to reflect these changes.

## 1. New and Modified API Endpoints

### 1.1. Request Upload URL (Modified)

- **Endpoint:** `POST /media/upload-url`
- **Description:** Generates a pre-signed URL for uploading media files (audio or video) directly to R2 storage.
- **Authentication:** Requires a valid JWT token in the `jwt` header.
- **Request Body:**
  ```json
  {
    "name": "string" (optional, e.g., "My Audio Recording"),
    "contentType": "string" (required, e.g., "audio/mpeg" or "video/mp4"),
    "fileSize": "string" (optional, e.g., "1024000" for 1MB)
  }
  ```
- **Response Body (Success):**
  ```json
  {
    "uploadUrl": "string" (URL to upload the media file to),
    "mediaId": "string" (ID of the newly created media record in the database),
    "reference": "string" (R2 storage reference for the media file)
  }
  ```
- **Response Body (Error):**
  ```json
  {
    "error": "string"
  }
  ```

### 1.2. Process Uploaded Media (Modified)

- **Endpoint:** `GET /media/process-uploaded/:mediaId`
- **Description:** Processes an uploaded media file (transcribes audio/video and summarizes the text). If the media is a video, it will be converted to audio before transcription.
- **Authentication:** Requires a valid JWT token in the `jwt` header.
- **Path Parameters:**
  - `mediaId`: The ID of the media record to process.
- **Response Body (Success):**
  ```json
  {
    "success": true,
    "media": { ... } (The updated media record with `text_brute` and `resume` fields),
    "message": "Media processed successfully."
  }
  ```
- **Response Body (Error):**
  ```json
  {
    "error": "string"
  }
  ```

### 1.3. Delete Media (New)

- **Endpoint:** `DELETE /media/delete/:mediaId`
- **Description:** Deletes a media record from the database and the corresponding file from R2 storage.
- **Authentication:** Requires a valid JWT token in the `jwt` header.
- **Path Parameters:**
  - `mediaId`: The ID of the media record to delete.
- **Response Body (Success):**
  ```json
  {
    "success": true,
    "message": "Media deleted successfully."
  }
  ```
- **Response Body (Error):**
  ```json
  {
    "error": "string"
  }
  ```

## 2. Authentication

All protected endpoints require a JWT token to be sent in the `jwt` header of the request.

## 3. Supported Media Types

The `POST /media/upload-url` endpoint now accepts both `audio/*` and `video/*` content types. The backend will automatically handle the conversion of video files to audio for transcription purposes.

## 4. Example Frontend Workflow

1.  **Request Upload URL:** The frontend sends a `POST` request to `/media/upload-url` with the `contentType` (e.g., `audio/mpeg` or `video/mp4`) and optionally `name` and `fileSize`.
2.  **Upload File to R2:** The frontend receives `uploadUrl` from the backend and uses it to directly upload the media file to R2 storage.
3.  **Process Media:** After a successful upload to R2, the frontend sends a `GET` request to `/media/process-uploaded/:mediaId` to initiate the transcription and summarization process.
4.  **Delete Media:** To delete a media file, the frontend sends a `DELETE` request to `/media/delete/:mediaId`.

---

**Note:** The `audio` model in the database has been renamed to `media`. All references to `audioId` in the API have been updated to `mediaId`.
