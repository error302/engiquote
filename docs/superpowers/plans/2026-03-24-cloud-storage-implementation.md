# Cloud Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement AWS S3 file storage for quotes, invoices, and project attachments

**Architecture:** AWS S3 for storage, Multer for uploads, Prisma for metadata, Express backend

**Tech Stack:** AWS SDK v3 (@aws-sdk/client-s3, @aws-sdk/s3-request-presigner), Multer, Prisma

---

## Task 1: Add AWS SDK and Configure

**Files:**
- Modify: `server/package.json`
- Create: `server/src/services/s3.js`

- [ ] **Step 1: Add AWS SDK to package.json**

Run: `cd server && npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer`

- [ ] **Step 2: Create s3.js service**

```javascript
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'engiquote-attachments';

export const uploadToS3 = async (file, entityType, entityId) => {
  const key = `${entityType}s/${entityId}/${uuidv4()}-${file.originalname}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });
  
  await s3Client.send(command);
  
  return {
    key,
    url: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
  };
};

export const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  
  await s3Client.send(command);
};

export const getPresignedUrl = async (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  
  return getSignedUrl(s3Client, command, { expiresIn });
};

export const getPublicUrl = (key) => {
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
};
```

- [ ] **Step 3: Add env variables to .env**

```
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=engiquote-attachments
```

---

## Task 2: Update Prisma Schema

**Files:**
- Modify: `server/prisma/schema.prisma`

- [ ] **Step 1: Add Attachment model**

```prisma
model Attachment {
  id          String   @id @default(uuid())
  filename    String
  s3Key       String   @unique
  s3Url       String
  mimeType    String
  size        Int
  entityType  String
  entityId    String
  uploadedBy  String?
  createdAt   DateTime @default(now())
}
```

- [ ] **Step 2: Run migration**

Run: `cd server && npx prisma migrate dev --name add_attachments`

---

## Task 3: Create Attachments API

**Files:**
- Create: `server/src/controllers/attachments.js`
- Create: `server/src/routes/attachments.js`
- Modify: `server/src/index.js`

- [ ] **Step 1: Create attachments controller**

```javascript
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { uploadToS3, deleteFromS3, getPresignedUrl, getPublicUrl } from '../services/s3.js';

const prisma = new PrismaClient();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

export const uploadMiddleware = upload.single('file');

export const uploadAttachment = async (req, res) => {
  try {
    const { entityType, entityId } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { key, url } = await uploadToS3(file, entityType, entityId);
    
    const attachment = await prisma.attachment.create({
      data: {
        filename: file.originalname,
        s3Key: key,
        s3Url: url,
        mimeType: file.mimetype,
        size: file.size,
        entityType,
        entityId,
        uploadedBy: req.user?.id,
      },
    });
    
    res.status(201).json(attachment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAttachments = async (req, res) => {
  try {
    const { entityType, entityId } = req.query;
    
    const where = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    
    const attachments = await prisma.attachment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(attachments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAttachment = async (req, res) => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
    });
    
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    const signedUrl = await getPresignedUrl(attachment.s3Key);
    
    res.json({ ...attachment, signedUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
    });
    
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    await deleteFromS3(attachment.s3Key);
    await prisma.attachment.delete({ where: { id: req.params.id } });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

- [ ] **Step 2: Create attachments routes**

```javascript
import express from 'express';
import * as attachmentsController from '../controllers/attachments.js';

const router = express.Router();

router.post('/upload', attachmentsController.uploadMiddleware, attachmentsController.uploadAttachment);
router.get('/', attachmentsController.getAttachments);
router.get('/:id', attachmentsController.getAttachment);
router.delete('/:id', attachmentsController.deleteAttachment);

export default router;
```

- [ ] **Step 3: Add route to index.js**

```javascript
import attachmentRoutes from './routes/attachments.js';
app.use('/api/attachments', attachmentRoutes);
```

---

## Task 4: Add Frontend File Upload

**Files:**
- Modify: `client/src/services/api.js`
- Create: `client/src/components/FileUpload.jsx`

- [ ] **Step 1: Add attachments API**

```javascript
export const attachmentsApi = {
  upload: (file, entityType, entityId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    return api.post('/attachments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getByEntity: (entityType, entityId) => 
    api.get('/attachments', { params: { entityType, entityId } }),
  getById: (id) => api.get(`/attachments/${id}`),
  delete: (id) => api.delete(`/attachments/${id}`),
};
```

- [ ] **Step 2: Create FileUpload component**

```jsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Paper, IconButton } from 'react-native-paper';
import { attachmentsApi } from '../services/api';

export function FileUpload({ entityType, entityId, onUpload }) {
  const [uploading, setUploading] = useState(false);
  
  const handleFilePick = async () => {
    const result = await documentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*', 'application/msword'],
    });
    
    if (!result.canceled) {
      setUploading(true);
      try {
        const file = result.assets[0];
        const response = await attachmentsApi.upload(file, entityType, entityId);
        onUpload?.(response.data);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploading(false);
      }
    }
  };
  
  return (
    <TouchableOpacity onPress={handleFilePick} style={styles.upload}>
      <IconButton icon="upload" size={24} />
      <Text>{uploading ? 'Uploading...' : 'Upload File'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  upload: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#94A3B8',
    borderRadius: 8,
  },
});
```

---

## Task 5: Integrate with Quote Details

**Files:**
- Modify: `client/src/pages/Quotes.jsx`

- [ ] **Step 1: Add file upload section to quote view**

Add attachment list and upload button to quote details modal.

---

## Task 6: Commit

- [ ] **Step 1: Commit changes**

```bash
git add server/ client/
git commit -m "feat: add AWS S3 cloud storage for attachments"
git push origin main
```
