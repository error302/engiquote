// api/index.js - Vercel Serverless Function
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'EngiQuote API is running' });
});

// Basic auth routes
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

app.get('/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token' });
    }

    const jwt = await import('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true }
    });

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Clients
app.get('/clients', async (req, res) => {
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

app.post('/clients', async (req, res) => {
  try {
    const client = await prisma.client.create({ data: req.body });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Projects
app.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { client: true, quotes: true, tasks: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/projects', async (req, res) => {
  try {
    const project = await prisma.project.create({ data: req.body });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quotes
app.get('/quotes', async (req, res) => {
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

app.post('/quotes', async (req, res) => {
  try {
    const quote = await prisma.quote.create({
      data: req.body,
      include: { items: true }
    });
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard stats
app.get('/dashboard/stats', async (req, res) => {
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

// Materials
app.get('/materials', async (req, res) => {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { category: 'asc' }
    });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invoices
app.get('/invoices', async (req, res) => {
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

// Tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { project: { include: { client: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Settings
app.get('/settings', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;