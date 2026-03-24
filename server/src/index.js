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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});