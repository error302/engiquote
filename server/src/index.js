import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import projectRoutes from './routes/projects.js';
import quoteRoutes from './routes/quotes.js';
import materialRoutes from './routes/materials.js';
import laborRateRoutes from './routes/laborRates.js';
import dashboardRoutes from './routes/dashboard.js';
import settingsRoutes from './routes/settings.js';
import emailRoutes from './routes/email.js';
import templatesRoutes from './routes/templates.js';
import invoicesRoutes from './routes/invoices.js';
import tasksRoutes from './routes/tasks.js';
import attachmentRoutes from './routes/attachments.js';
import paymentRoutes from './routes/payments.js';
import integrationRoutes from './routes/integrations.js';
import marketplaceRoutes from './routes/marketplace.js';
import recurringRoutes from './routes/recurring.js';
import approvalRoutes from './routes/approvals.js';
import auditRoutes from './routes/audit.js';
import companyRoutes from './routes/companies.js';
import cashflowRoutes from './routes/cashflow.js';
import portalshareRoutes from './routes/portalshare.js';
import planUploadRoutes from './routes/planUpload.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/labor-rates', laborRateRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/cashflow', cashflowRoutes);
app.use('/api/portal', portalshareRoutes);
app.use('/api/plan-upload', planUploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
