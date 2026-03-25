import express from 'express';
import { getAuthUrl, saveTokens, getIntegration, uploadToDrive, listFiles, createFolder, setDefaultFolder } from '../services/googleDrive.js';

const router = express.Router();

router.get('/auth', async (req, res) => {
  try {
    const { companyId } = req.query;
    const url = getAuthUrl();
    
    res.json({ url, state: companyId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/callback', async (req, res) => {
  try {
    const { code, companyId } = req.body;
    
    const oauth2Client = new (await import('googleapis')).google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    await saveTokens(companyId, tokens);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/status/:companyId', async (req, res) => {
  try {
    const integration = await getIntegration(req.params.companyId);
    res.json({ connected: !!integration });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upload', async (req, res) => {
  try {
    const { companyId, folderId } = req.body;
    const file = req.file;
    
    const result = await uploadToDrive(companyId, file, folderId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/files/:companyId', async (req, res) => {
  try {
    const { folderId } = req.query;
    const files = await listFiles(req.params.companyId, folderId);
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/folder', async (req, res) => {
  try {
    const { companyId, name } = req.body;
    const folder = await createFolder(companyId, name);
    res.json(folder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/folder/:companyId', async (req, res) => {
  try {
    const { folderId } = req.body;
    const result = await setDefaultFolder(req.params.companyId, folderId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/disconnect/:companyId', async (req, res) => {
  try {
    await prisma.integration.updateMany({
      where: { companyId: req.params.companyId, provider: 'GOOGLE_DRIVE' },
      data: { active: false },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;