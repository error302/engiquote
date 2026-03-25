import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const getAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  ];
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
};

export const setCredentials = (tokens) => {
  oauth2Client.setCredentials(tokens);
};

export const saveTokens = async (companyId, tokens) => {
  return prisma.integration.upsert({
    where: {
      companyId_provider: { companyId, provider: 'GOOGLE_DRIVE' },
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      active: true,
    },
    create: {
      companyId,
      provider: 'GOOGLE_DRIVE',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      settings: JSON.stringify({ folderId: null }),
      active: true,
    },
  });
};

export const getIntegration = async (companyId) => {
  return prisma.integration.findFirst({
    where: { companyId, provider: 'GOOGLE_DRIVE', active: true },
  });
};

export const uploadToDrive = async (companyId, file, folderId = null) => {
  const integration = await getIntegration(companyId);
  
  if (!integration) {
    throw new Error('Google Drive not connected');
  }

  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const settings = JSON.parse(integration.settings || '{}');
  const targetFolder = folderId || settings.folderId;

  const fileMetadata = {
    name: file.originalname,
    parents: targetFolder ? [targetFolder] : [],
  };

  const media = {
    mimeType: file.mimetype,
    body: file.buffer,
  };

  const uploadedFile = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id, name, webViewLink',
  });

  await drive.permissions.create({
    fileId: uploadedFile.data.id,
    requestBody: {
      type: 'anyone',
      role: 'reader',
    },
  });

  return {
    id: uploadedFile.data.id,
    name: uploadedFile.data.name,
    url: uploadedFile.data.webViewLink,
  };
};

export const listFiles = async (companyId, folderId = null) => {
  const integration = await getIntegration(companyId);
  
  if (!integration) {
    throw new Error('Google Drive not connected');
  }

  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const query = folderId ? `'${folderId}' in parents` : "'root' in parents";
  
  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name, mimeType, webViewLink, createdTime)',
    pageSize: 50,
  });

  return response.data.files;
};

export const createFolder = async (companyId, folderName) => {
  const integration = await getIntegration(companyId);
  
  if (!integration) {
    throw new Error('Google Drive not connected');
  }

  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const folder = await drive.files.create({
    resource: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id, name',
  });

  return {
    id: folder.data.id,
    name: folder.data.name,
  };
};

export const setDefaultFolder = async (companyId, folderId) => {
  const integration = await getIntegration(companyId);
  
  if (!integration) {
    throw new Error('Google Drive not connected');
  }

  const settings = JSON.parse(integration.settings || '{}');
  settings.folderId = folderId;

  await prisma.integration.update({
    where: { id: integration.id },
    data: { settings: JSON.stringify(settings) },
  });

  return { folderId };
};

export const autoSavePdf = async (companyId, pdfName, pdfBuffer) => {
  try {
    const mockFile = {
      originalname: pdfName,
      mimetype: 'application/pdf',
      buffer: pdfBuffer,
    };

    const result = await uploadToDrive(companyId, mockFile);
    return result;
  } catch (error) {
    console.error('Auto-save to Drive failed:', error);
    return null;
  }
};

export default {
  getAuthUrl,
  saveTokens,
  getIntegration,
  uploadToDrive,
  listFiles,
  createFolder,
  setDefaultFolder,
  autoSavePdf,
};