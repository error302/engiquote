import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { uploadToS3, deleteFromS3, getPresignedUrl } from '../services/s3.js';

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
