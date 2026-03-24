# EngiQuote KE - Cloud Storage Design

## Overview

**Project Name:** EngiQuote KE Cloud Storage  
**Type:** Backend feature + Frontend integration  
**Core Functionality:** Upload, store, and manage files (PDFs, images, contracts) in AWS S3  
**Target Users:** Engineers, sales team, admin

---

## Technical Architecture

### Tech Stack
- **Storage:** AWS S3 (Simple Storage Service)
- **Backend:** Multer + AWS SDK v3
- **Frontend:** React + Axios
- **Database:** New `attachments` table in PostgreSQL

### S3 Configuration
- Bucket: `engiquote-attachments`
- Region: `eu-west-1` (Kenya - Africa)
- Folders: `/quotes/`, `/invoices/`, `/contracts/`, `/projects/`

---

## Database Schema

### New Table: `attachments`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| filename | VARCHAR(255) | Original filename |
| s3Key | VARCHAR(500) | S3 object key |
| s3Url | VARCHAR(500) | Public/presigned URL |
| mimeType | VARCHAR(100) | File MIME type |
| size | INTEGER | File size in bytes |
| entityType | VARCHAR(50) | quote, invoice, project, client |
| entityId | UUID | Associated entity ID |
| uploadedBy | UUID | User ID |
| createdAt | TIMESTAMP | Upload date |

---

## API Endpoints

- `POST /api/attachments/upload` - Upload file to S3
- `GET /api/attachments/:id` - Get attachment details
- `GET /api/attachments?entityType=quote&entityId=xxx` - List attachments for entity
- `DELETE /api/attachments/:id` - Delete from S3 + DB

---

## Features

1. **File Upload:** Drag-drop or file picker, max 10MB
2. **File Types:** PDF, PNG, JPG, JPEG, DOC, DOCX
3. **Organization:** Files linked to quotes, invoices, projects
4. **Preview:** View PDFs/images in browser
5. **Download:** Presigned URLs for secure download
6. **Delete:** Remove files from S3

---

## Acceptance Criteria

1. User can upload files to S3
2. Files are linked to quotes/invoices/projects
3. Files can be viewed and downloaded
4. Files can be deleted
5. Backend validates file type and size
