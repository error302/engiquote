// api/index.js - Vercel Serverless Function (Expanded)
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token' });
    }
    const jwt = await import('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'EngiQuote API is running' });
});

// ============ AUTH ============
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const bcrypt = await import('bcryptjs');
    const jwt = await import('jsonwebtoken');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const bcrypt = await import('bcryptjs');
    const jwt = await import('jsonwebtoken');

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || 'SALES' }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/auth/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/auth/users', auth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/auth/users/:id/toggle', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { active: !user.active }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CLIENTS ============
app.get('/clients', auth, async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      include: { projects: true, invoices: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/clients/:id', auth, async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: { projects: true, invoices: true }
    });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/clients', auth, async (req, res) => {
  try {
    const client = await prisma.client.create({ data: req.body });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/clients/:id', auth, async (req, res) => {
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/clients/:id', auth, async (req, res) => {
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PROJECTS ============
app.get('/projects', auth, async (req, res) => {
  try {
    const { status, type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    
    const projects = await prisma.project.findMany({
      where,
      include: { client: true, quotes: true, tasks: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/projects/:id', auth, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { client: true, quotes: true, tasks: true }
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/projects', auth, async (req, res) => {
  try {
    const project = await prisma.project.create({ data: req.body });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/projects/:id', auth, async (req, res) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/projects/:id', auth, async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ QUOTES ============
app.get('/quotes', auth, async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      include: { project: { include: { client: true } }, items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/quotes/:id', auth, async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: { project: { include: { client: true } }, items: true }
    });
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/quotes', auth, async (req, res) => {
  try {
    const { items, ...quoteData } = req.body;
    let quote;
    if (items && items.length > 0) {
      quote = await prisma.quote.create({
        data: {
          ...quoteData,
          items: { create: items }
        },
        include: { items: true }
      });
    } else {
      quote = await prisma.quote.create({ data: quoteData });
    }
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/quotes/:id', auth, async (req, res) => {
  try {
    const { items, ...quoteData } = req.body;
    let quote;
    if (items) {
      await prisma.quoteItem.deleteMany({ where: { quoteId: req.params.id } });
      quote = await prisma.quote.update({
        where: { id: req.params.id },
        data: {
          ...quoteData,
          items: { create: items }
        },
        include: { items: true }
      });
    } else {
      quote = await prisma.quote.update({
        where: { id: req.params.id },
        data: quoteData
      });
    }
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/quotes/:id', auth, async (req, res) => {
  try {
    await prisma.quote.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/quotes/:id/duplicate', auth, async (req, res) => {
  try {
    const original = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });
    if (!original) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    const duplicate = await prisma.quote.create({
      data: {
        projectId: original.projectId,
        quoteNumber: `${original.quoteNumber}-COPY`,
        status: 'DRAFT',
        subtotal: original.subtotal,
        profitMarginPercent: original.profitMarginPercent,
        profitAmount: original.profitAmount,
        taxPercent: original.taxPercent,
        taxAmount: original.taxAmount,
        total: original.total,
        items: {
          create: original.items.map(item => ({
            category: item.category,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total
          }))
        }
      },
      include: { items: true }
    });
    res.json(duplicate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ MATERIALS ============
app.get('/materials', auth, async (req, res) => {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { category: 'asc' }
    });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/materials', auth, async (req, res) => {
  try {
    const material = await prisma.material.create({ data: req.body });
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/materials/:id', auth, async (req, res) => {
  try {
    const material = await prisma.material.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/materials/:id', auth, async (req, res) => {
  try {
    await prisma.material.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ LABOR RATES ============
app.get('/labor-rates', auth, async (req, res) => {
  try {
    const rates = await prisma.laborRate.findMany();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/labor-rates', auth, async (req, res) => {
  try {
    const rate = await prisma.laborRate.create({ data: req.body });
    res.json(rate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/labor-rates/:id', auth, async (req, res) => {
  try {
    const rate = await prisma.laborRate.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(rate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/labor-rates/:id', auth, async (req, res) => {
  try {
    await prisma.laborRate.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DASHBOARD ============
app.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const clients = await prisma.client.count();
    const projects = await prisma.project.count();
    const quotes = await prisma.quote.count();
    const invoices = await prisma.invoice.findMany({
      where: { status: 'PAID' }
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

    res.json({
      totalClients: clients,
      totalProjects: projects,
      totalQuotes: quotes,
      totalRevenue,
      paidInvoices: invoices.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ INVOICES ============
app.get('/invoices', auth, async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { client: true, payments: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/invoices/:id', auth, async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { client: true, quote: true, payments: true }
    });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/invoices', auth, async (req, res) => {
  try {
    const invoice = await prisma.invoice.create({ data: req.body });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/invoices/from-quote', auth, async (req, res) => {
  try {
    const { quoteId, dueDate, notes } = req.body;
    const quote = await prisma.quote.findUnique({ 
      where: { id: quoteId },
      include: { project: true }
    });
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;
    
    const invoice = await prisma.invoice.create({
      data: {
        quoteId,
        clientId: quote.project.clientId,
        invoiceNumber,
        amount: quote.total,
        dueDate,
        notes
      }
    });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/invoices/:id', auth, async (req, res) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/invoices/:id/payments', auth, async (req, res) => {
  try {
    const { amount, method, reference, notes } = req.body;
    const payment = await prisma.payment.create({
      data: {
        invoiceId: req.params.id,
        amount,
        method,
        reference,
        notes,
        status: 'COMPLETED'
      }
    });
    
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { payments: true }
    });
    const paidAmount = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    await prisma.invoice.update({
      where: { id: req.params.id },
      data: { 
        paidAmount,
        status: paidAmount >= Number(invoice.amount) ? 'PAID' : 'PARTIAL'
      }
    });
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/invoices/:id', auth, async (req, res) => {
  try {
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TASKS ============
app.get('/tasks', auth, async (req, res) => {
  try {
    const { status, projectId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;
    
    const tasks = await prisma.task.findMany({
      where,
      include: { project: { include: { client: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tasks', auth, async (req, res) => {
  try {
    const task = await prisma.task.create({ data: req.body });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/tasks/:id', auth, async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SETTINGS ============
app.get('/settings', auth, async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/settings', auth, async (req, res) => {
  try {
    for (const { key, value } of req.body) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    }
    const settings = await prisma.setting.findMany();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ COMPANIES ============
app.get('/companies', auth, async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: { users: true }
    });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/companies/:id', auth, async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: { users: true }
    });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/companies', auth, async (req, res) => {
  try {
    const company = await prisma.company.create({ data: req.body });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/companies/:id', auth, async (req, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TEMPLATES ============
app.get('/templates', auth, async (req, res) => {
  try {
    const templates = await prisma.quoteTemplate.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/templates/:id', auth, async (req, res) => {
  try {
    const template = await prisma.quoteTemplate.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/templates', auth, async (req, res) => {
  try {
    const { items, ...templateData } = req.body;
    let template;
    if (items && items.length > 0) {
      template = await prisma.quoteTemplate.create({
        data: {
          ...templateData,
          items: { create: items }
        },
        include: { items: true }
      });
    } else {
      template = await prisma.quoteTemplate.create({ data: templateData });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/templates/:id', auth, async (req, res) => {
  try {
    const { items, ...templateData } = req.body;
    let template;
    if (items) {
      await prisma.quoteTemplateItem.deleteMany({ where: { templateId: req.params.id } });
      template = await prisma.quoteTemplate.update({
        where: { id: req.params.id },
        data: {
          ...templateData,
          items: { create: items }
        },
        include: { items: true }
      });
    } else {
      template = await prisma.quoteTemplate.update({
        where: { id: req.params.id },
        data: templateData
      });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/templates/:id', auth, async (req, res) => {
  try {
    await prisma.quoteTemplate.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CASHFLOW ============
app.post('/cashflow/generate', auth, async (req, res) => {
  try {
    const { projectId, curve } = req.body;
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const startDate = project.startDate || new Date();
    const endDate = project.endDate || new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const cashflow = [];
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      let cumulative;
      if (curve === 'S_CURVE') {
        const t = i / totalDays;
        cumulative = Math.pow(t, 1.5) / (Math.pow(t, 1.5) + Math.pow(1 - t, 1.5));
      } else if (curve === 'FRONT_LOADED') {
        const t = i / totalDays;
        cumulative = 1 - Math.pow(1 - t, 2);
      } else if (curve === 'BACK_LOADED') {
        const t = i / totalDays;
        cumulative = Math.pow(t, 2);
      } else {
        cumulative = i / totalDays;
      }
      cashflow.push({ date: date.toISOString().split('T')[0], cumulative: Math.round(cumulative * 100) / 100 });
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { cashFlow: cashflow, cashFlowCurve: curve }
    });

    res.json({ cashflow, curve });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/cashflow/:projectId', auth, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId }
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ cashflow: project.cashFlow, curve: project.cashFlowCurve });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/cashflow/:projectId/curve', auth, async (req, res) => {
  try {
    const { curve } = req.body;
    await prisma.project.update({
      where: { id: req.params.projectId },
      data: { cashFlowCurve: curve }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ APPROVALS ============
app.get('/approvals', auth, async (req, res) => {
  try {
    const approvals = await prisma.quoteApproval.findMany({
      include: { quote: { include: { project: { include: { client: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/approvals/pending/:userId', auth, async (req, res) => {
  try {
    const approvals = await prisma.quoteApproval.findMany({
      where: { status: 'PENDING' },
      include: { quote: { include: { project: { include: { client: true } } } } }
    });
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/approvals/quote/:quoteId', auth, async (req, res) => {
  try {
    const approval = await prisma.quoteApproval.findUnique({
      where: { quoteId: req.params.quoteId }
    });
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/approvals', auth, async (req, res) => {
  try {
    const approval = await prisma.quoteApproval.create({ data: req.body });
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/approvals/quote/:quoteId/approve', auth, async (req, res) => {
  try {
    const approval = await prisma.quoteApproval.upsert({
      where: { quoteId: req.params.quoteId },
      update: { status: 'APPROVED', approvedBy: req.user.userId, approvedAt: new Date() },
      create: { quoteId: req.params.quoteId, status: 'APPROVED', approvedBy: req.user.userId, approvedAt: new Date() }
    });
    await prisma.quote.update({
      where: { id: req.params.quoteId },
      data: { status: 'ACCEPTED' }
    });
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/approvals/quote/:quoteId/reject', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const approval = await prisma.quoteApproval.upsert({
      where: { quoteId: req.params.quoteId },
      update: { status: 'REJECTED', rejectedBy: req.user.userId, rejectedAt: new Date(), reason },
      create: { quoteId: req.params.quoteId, status: 'REJECTED', rejectedBy: req.user.userId, rejectedAt: new Date(), reason }
    });
    await prisma.quote.update({
      where: { id: req.params.quoteId },
      data: { status: 'REJECTED' }
    });
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PORTAL ============
app.post('/portal/share', auth, async (req, res) => {
  try {
    const { projectId, clientName, clientEmail } = req.body;
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    const share = await prisma.quoteShare.create({
      data: {
        projectId,
        clientName,
        clientEmail,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    res.json({ ...share, url: `/portal/${token}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/portal/token/:token', async (req, res) => {
  try {
    const share = await prisma.quoteShare.findUnique({
      where: { token: req.params.token },
      include: { project: { include: { client: true, quotes: { include: { items: true } } } } }
    });
    if (!share) {
      return res.status(404).json({ error: 'Invalid token' });
    }
    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Token expired' });
    }
    res.json(share);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/portal/token/:token/approve', async (req, res) => {
  try {
    const share = await prisma.quoteShare.update({
      where: { token: req.params.token },
      data: { status: 'APPROVED', respondedAt: new Date() }
    });
    res.json(share);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/portal/token/:token/revision', async (req, res) => {
  try {
    const { comments } = req.body;
    const share = await prisma.quoteShare.update({
      where: { token: req.params.token },
      data: { status: 'REVISION_REQUESTED', respondedAt: new Date(), revisionComments: comments }
    });
    res.json(share);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ MARKETPLACE ============
app.get('/marketplace/templates', auth, async (req, res) => {
  try {
    const templates = await prisma.quoteTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/marketplace/rates', auth, async (req, res) => {
  try {
    const { category, county } = req.query;
    const where = {};
    if (category) where.category = category;
    if (county) where.county = county;
    
    const rates = await prisma.material.findMany({ where });
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/marketplace/rates/categories', auth, async (req, res) => {
  try {
    const categories = await prisma.material.groupBy({
      by: ['category'],
      _count: { category: true }
    });
    res.json(categories.map(c => c.category));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PAYMENTS ============
app.get('/payments/:invoiceId', auth, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { invoiceId: req.params.invoiceId }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe checkout (mock for demo)
app.post('/payments/stripe/create-checkout', auth, async (req, res) => {
  try {
    const { invoiceId } = req.body;
    res.json({ url: `https://checkout.stripe.com/mock?invoice=${invoiceId}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// M-Pesa STK Push (mock for demo)
app.post('/payments/mpesa/stkpush', auth, async (req, res) => {
  try {
    const { invoiceId, phoneNumber } = req.body;
    res.json({ success: true, message: 'STK Push sent', checkoutRequestId: 'mock-' + Date.now() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ EMAIL ============
app.post('/email/send-quote', auth, async (req, res) => {
  try {
    const { to, subject, quoteId } = req.body;
    res.json({ success: true, message: `Quote ${quoteId} sent to ${to}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PLAN EXTRACT ============
app.post('/plan-upload/extract', auth, async (req, res) => {
  try {
    const { projectId, inputType, dimensions } = req.body;
    res.json({ 
      success: true, 
      items: [
        { category: 'Structural', description: 'Concrete Works', quantity: dimensions?.length || 100, unit: 'm³', unitPrice: 15000 },
        { category: 'Structural', description: 'Reinforcement Steel', quantity: (dimensions?.length || 100) * 50, unit: 'kg', unitPrice: 200 }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/plan-upload/:projectId', auth, async (req, res) => {
  try {
    res.json({ items: [], confirmed: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ATTACHMENTS ============
app.get('/attachments', auth, async (req, res) => {
  try {
    const { entityType, entityId } = req.query;
    const where = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    
    const attachments = await prisma.attachment.findMany({ where });
    res.json(attachments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/attachments/:id', auth, async (req, res) => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id }
    });
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    res.json(attachment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/attachments/:id', auth, async (req, res) => {
  try {
    await prisma.attachment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ AUDIT ============
app.get('/audit', auth, async (req, res) => {
  try {
    const { entityType, entityId } = req.query;
    const where = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    
    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ INTEGRATIONS ============
app.get('/integrations/:companyId', auth, async (req, res) => {
  try {
    const integrations = await prisma.integration.findMany({
      where: { companyId: req.params.companyId }
    });
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
