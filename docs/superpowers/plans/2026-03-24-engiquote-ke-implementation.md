# EngiQuote KE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete full-stack engineering quotation management system with client CRM, project tracking, quote generation, and PDF export.

**Architecture:** Monorepo with separate client (React) and server (Express) directories. PostgreSQL database with Prisma ORM. API-first design with REST endpoints.

**Tech Stack:** React 18, Vite, Tailwind CSS, Node.js, Express, Prisma, PostgreSQL, jsPDF, Recharts

---

## File Structure

### Backend (server/)
- `server/package.json` - Node.js dependencies
- `server/src/index.js` - Express server entry point
- `server/src/routes/*.js` - API route handlers
- `server/src/controllers/*.js` - Business logic
- `server/prisma/schema.prisma` - Database schema

### Frontend (client/)
- `client/package.json` - React dependencies
- `client/vite.config.js` - Vite configuration
- `client/tailwind.config.js` - Tailwind configuration
- `client/src/main.jsx` - React entry point
- `client/src/App.jsx` - Main app component
- `client/src/pages/*.jsx` - Page components
- `client/src/components/*.jsx` - Reusable components
- `client/src/services/api.js` - API service functions
- `client/src/utils/*.js` - Utility functions

---

## Phase 1: Project Setup

### Task 1: Initialize Backend

**Files:**
- Create: `server/package.json`
- Create: `server/src/index.js`
- Create: `server/src/routes/clients.js`
- Create: `server/src/routes/projects.js`
- Create: `server/src/routes/quotes.js`
- Create: `server/src/routes/materials.js`
- Create: `server/src/routes/laborRates.js`
- Create: `server/src/routes/dashboard.js`
- Create: `server/src/routes/settings.js`

- [ ] **Step 1: Create server/package.json**

```json
{
  "name": "engiquote-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "prisma": "^5.10.0",
    "@prisma/client": "^5.10.0",
    "dotenv": "^16.4.1",
    "uuid": "^9.0.1"
  }
}
```

- [ ] **Step 2: Create server/src/index.js**

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientRoutes from './routes/clients.js';
import projectRoutes from './routes/projects.js';
import quoteRoutes from './routes/quotes.js';
import materialRoutes from './routes/materials.js';
import laborRateRoutes from './routes/laborRates.js';
import dashboardRoutes from './routes/dashboard.js';
import settingsRoutes from './routes/settings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/labor-rates', laborRateRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [ ] **Step 3: Install backend dependencies**

Run: `cd server && npm install`

- [ ] **Step 4: Create route stubs**

Create all route files with basic express router exports. Each will have placeholder routes initially.

---

### Task 2: Initialize Frontend

**Files:**
- Create: `client/package.json`
- Create: `client/vite.config.js`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `client/index.html`
- Create: `client/src/main.jsx`
- Create: `client/src/App.jsx`
- Create: `client/src/index.css`

- [ ] **Step 1: Create client/package.json**

```json
{
  "name": "engiquote-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.7",
    "recharts": "^2.12.0",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    "lucide-react": "^0.330.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.0",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
```

- [ ] **Step 3: Create tailwind.config.js**

```javascript
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E40AF',
          light: '#3B82F6'
        },
        secondary: '#475569',
        accent: '#F59E0B'
      }
    }
  },
  plugins: []
};
```

- [ ] **Step 4: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EngiQuote KE</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create src/main.jsx**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 7: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', system-ui, sans-serif;
}
```

- [ ] **Step 8: Create src/App.jsx with routing**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Quotes from './pages/Quotes';
import Materials from './pages/Materials';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="projects" element={<Projects />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="materials" element={<Materials />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 9: Install frontend dependencies**

Run: `cd client && npm install`

---

## Phase 2: Database Setup

### Task 3: Prisma Schema and Database

**Files:**
- Create: `server/prisma/schema.prisma`

- [ ] **Step 1: Create prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Client {
  id        String    @id @default(uuid())
  name      String
  email     String?
  phone     String?
  company   String?
  address   String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  projects  Project[]
}

model Project {
  id          String    @id @default(uuid())
  clientId    String
  client      Client    @relation(fields: [clientId], references: [id])
  name        String
  type        ProjectType
  status      ProjectStatus @default(PENDING)
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  quotes      Quote[]
}

model Quote {
  id                   String      @id @default(uuid())
  projectId            String
  project              Project     @relation(fields: [projectId], references: [id])
  quoteNumber          String      @unique
  status               QuoteStatus @default(DRAFT)
  subtotal             Decimal     @db.Decimal(12, 2)
  profitMarginPercent  Decimal     @db.Decimal(5, 2) @default(10)
  profitAmount         Decimal     @db.Decimal(12, 2)
  taxPercent           Decimal     @db.Decimal(5, 2) @default(16)
  taxAmount            Decimal     @db.Decimal(12, 2)
  total                Decimal     @db.Decimal(12, 2)
  validUntil           DateTime?
  notes                String?
  createdAt            DateTime    @default(now())
  updatedAt            DateTime    @updatedAt
  items                QuoteItem[]
}

model QuoteItem {
  id          String   @id @default(uuid())
  quoteId     String
  quote       Quote    @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  category    String
  description String
  quantity    Decimal  @db.Decimal(10, 2)
  unit        String
  unitPrice   Decimal  @db.Decimal(12, 2)
  total       Decimal  @db.Decimal(12, 2)
}

model Material {
  id          String   @id @default(uuid())
  name        String
  category    String
  unit        String
  unitPrice   Decimal  @db.Decimal(12, 2)
  description String?
}

model LaborRate {
  id          String   @id @default(uuid())
  role        String
  hourlyRate  Decimal  @db.Decimal(12, 2)
  description String?
}

model Setting {
  id    String @id @default(uuid())
  key   String @unique
  value String
}

enum ProjectType {
  CIVIL
  ELECTRICAL
  MECHANICAL
  ARCHITECTURE
}

enum ProjectStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum QuoteStatus {
  DRAFT
  SENT
  ACCEPTED
  REJECTED
}
```

- [ ] **Step 2: Create .env file**

Create: `server/.env`

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/engiquote?schema=public"
PORT=3001
```

- [ ] **Step 3: Run Prisma migration**

Run: `cd server && npx prisma migrate dev --name init`

---

## Phase 3: Backend API Implementation

### Task 4: Client Routes and Controller

**Files:**
- Modify: `server/src/routes/clients.js`
- Create: `server/src/controllers/clients.js`

- [ ] **Step 1: Create client controller**

```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getClient = async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id }
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createClient = async (req, res) => {
  try {
    const client = await prisma.client.create({
      data: req.body
    });
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    await prisma.client.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

- [ ] **Step 2: Update client routes**

```javascript
import express from 'express';
import * as clientController from '../controllers/clients.js';

const router = express.Router();

router.get('/', clientController.getClients);
router.get('/:id', clientController.getClient);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

export default router;
```

- [ ] **Step 3: Test client endpoints**

Run: `curl http://localhost:3001/api/clients`

---

### Task 5: Project Routes

**Files:**
- Create: `server/src/controllers/projects.js`
- Modify: `server/src/routes/projects.js`

Implement similar CRUD pattern for projects with relations to clients.

- [ ] **Step 1: Create project controller**

```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProjects = async (req, res) => {
  try {
    const { status, type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    
    const projects = await prisma.project.findMany({
      where,
      include: { client: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { client: true, quotes: true }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const project = await prisma.project.create({
      data: req.body,
      include: { client: true }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body,
      include: { client: true }
    });
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

- [ ] **Step 2: Create project routes**

```javascript
import express from 'express';
import * as projectController from '../controllers/projects.js';

const router = express.Router();

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

export default router;
```

---

### Task 6: Quote Routes with Calculations

**Files:**
- Create: `server/src/controllers/quotes.js`
- Modify: `server/src/routes/quotes.js`

- [ ] **Step 1: Create quote controller**

```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const generateQuoteNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `EQ-${dateStr}-${random}`;
};

const calculateQuote = (items, profitPercent, taxPercent) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.quantity) * Number(item.unitPrice));
  }, 0);
  
  const profitAmount = subtotal * (Number(profitPercent) / 100);
  const beforeTax = subtotal + profitAmount;
  const taxAmount = beforeTax * (Number(taxPercent) / 100);
  const total = beforeTax + taxAmount;
  
  return {
    subtotal,
    profitAmount,
    taxAmount,
    total
  };
};

export const getQuotes = async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      include: { project: { include: { client: true } }, items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuote = async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: { project: { include: { client: true } }, items: true }
    });
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createQuote = async (req, res) => {
  try {
    const { projectId, items, profitMarginPercent, taxPercent, validUntil, notes, status } = req.body;
    
    const calculations = calculateQuote(items || [], profitMarginPercent || 10, taxPercent || 16);
    
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        projectId,
        status: status || 'DRAFT',
        subtotal: calculations.subtotal,
        profitMarginPercent: profitMarginPercent || 10,
        profitAmount: calculations.profitAmount,
        taxPercent: taxPercent || 16,
        taxAmount: calculations.taxAmount,
        total: calculations.total,
        validUntil: validUntil ? new Date(validUntil) : null,
        notes,
        items: {
          create: items?.map(item => ({
            category: item.category,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: Number(item.quantity) * Number(item.unitPrice)
          })) || []
        }
      },
      include: { items: true, project: { include: { client: true } } }
    });
    
    res.status(201).json(quote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateQuote = async (req, res) => {
  try {
    const { items, profitMarginPercent, taxPercent, validUntil, notes, status, projectId } = req.body;
    
    let data = {};
    if (projectId) data.projectId = projectId;
    if (status) data.status = status;
    if (validUntil !== undefined) data.validUntil = validUntil ? new Date(validUntil) : null;
    if (notes !== undefined) data.notes = notes;
    
    if (profitMarginPercent !== undefined) data.profitMarginPercent = profitMarginPercent;
    if (taxPercent !== undefined) data.taxPercent = taxPercent;
    
    const existingQuote = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });
    
    const itemsToUse = items || existingQuote.items;
    const profit = profitMarginPercent ?? Number(existingQuote.profitMarginPercent);
    const tax = taxPercent ?? Number(existingQuote.taxPercent);
    
    const calculations = calculateQuote(itemsToUse, profit, tax);
    data.subtotal = calculations.subtotal;
    data.profitAmount = calculations.profitAmount;
    data.taxAmount = calculations.taxAmount;
    data.total = calculations.total;
    
    const quote = await prisma.quote.update({
      where: { id: req.params.id },
      data,
      include: { items: true, project: { include: { client: true } } }
    });
    
    res.json(quote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addQuoteItem = async (req, res) => {
  try {
    const { category, description, quantity, unit, unitPrice } = req.body;
    const total = Number(quantity) * Number(unitPrice);
    
    const item = await prisma.quoteItem.create({
      data: {
        quoteId: req.params.id,
        category,
        description,
        quantity,
        unit,
        unitPrice,
        total
      }
    });
    
    await recalculateQuoteTotals(req.params.id);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteQuoteItem = async (req, res) => {
  try {
    await prisma.quoteItem.delete({ where: { id: req.params.itemId } });
    await recalculateQuoteTotals(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const recalculateQuoteTotals = async (quoteId) => {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { items: true }
  });
  
  const calculations = calculateQuote(
    quote.items,
    Number(quote.profitMarginPercent),
    Number(quote.taxPercent)
  );
  
  await prisma.quote.update({
    where: { id: quoteId },
    data: {
      subtotal: calculations.subtotal,
      profitAmount: calculations.profitAmount,
      taxAmount: calculations.taxAmount,
      total: calculations.total
    }
  });
};

export const deleteQuote = async (req, res) => {
  try {
    await prisma.quote.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

- [ ] **Step 2: Create quote routes**

```javascript
import express from 'express';
import * as quoteController from '../controllers/quotes.js';

const router = express.Router();

router.get('/', quoteController.getQuotes);
router.get('/:id', quoteController.getQuote);
router.post('/', quoteController.createQuote);
router.put('/:id', quoteController.updateQuote);
router.delete('/:id', quoteController.deleteQuote);
router.post('/:id/items', quoteController.addQuoteItem);
router.delete('/:id/items/:itemId', quoteController.deleteQuoteItem);

export default router;
```

---

### Task 7: Materials and Labor Rates

**Files:**
- Create: `server/src/controllers/materials.js`
- Create: `server/src/controllers/laborRates.js`
- Modify: `server/src/routes/materials.js`
- Modify: `server/src/routes/laborRates.js`

Implement standard CRUD for materials and labor rates.

---

### Task 8: Dashboard and Settings

**Files:**
- Create: `server/src/controllers/dashboard.js`
- Create: `server/src/controllers/settings.js`
- Modify: `server/src/routes/dashboard.js`
- Modify: `server/src/routes/settings.js`

- [ ] **Step 1: Create dashboard controller**

```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const [totalClients, activeProjects, quotesThisMonth, monthlyRevenue] = await Promise.all([
      prisma.client.count(),
      prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.quote.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.quote.aggregate({
        where: { 
          status: 'ACCEPTED',
          createdAt: { gte: startOfMonth }
        },
        _sum: { total: true }
      })
    ]);
    
    const lastMonthRevenue = await prisma.quote.aggregate({
      where: {
        status: 'ACCEPTED',
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      },
      _sum: { total: true }
    });
    
    const recentQuotes = await prisma.quote.findMany({
      take: 5,
      include: { project: { include: { client: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const revenue = await prisma.quote.aggregate({
        where: {
          status: 'ACCEPTED',
          createdAt: { gte: monthStart, lte: monthEnd }
        },
        _sum: { total: true }
      });
      monthlyData.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        revenue: revenue._sum.total || 0
      });
    }
    
    res.json({
      totalClients,
      activeProjects,
      quotesThisMonth,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      lastMonthRevenue: lastMonthRevenue._sum.total || 0,
      recentQuotes,
      monthlyData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

- [ ] **Step 2: Create settings controller**

```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const DEFAULT_SETTINGS = {
  companyName: 'Engineering Company',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  defaultTaxRate: '16',
  defaultProfitMargin: '10',
  quoteValidityDays: '30'
};

export const getSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsObj = { ...DEFAULT_SETTINGS };
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    }
    const settings = await prisma.setting.findMany();
    const settingsObj = { ...DEFAULT_SETTINGS };
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    res.json(settingsObj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

---

## Phase 4: Frontend Implementation

### Task 9: Layout and Navigation Components

**Files:**
- Create: `client/src/components/Layout.jsx`
- Create: `client/src/components/Sidebar.jsx`
- Create: `client/src/components/Header.jsx`

- [ ] **Step 1: Create Sidebar component**

```jsx
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, FileText, Package, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/quotes', icon: FileText, label: 'Quotes' },
  { to: '/materials', icon: Package, label: 'Materials' },
  { to: '/settings', icon: Settings, label: 'Settings' }
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-primary text-white min-h-screen p-4">
      <div className="text-xl font-bold mb-8 px-2">EngiQuote KE</div>
      <nav className="space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-primary-light' : 'hover:bg-primary-light/50'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Create Layout component**

```jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
```

---

### Task 10: Dashboard Page

**Files:**
- Create: `client/src/pages/Dashboard.jsx`
- Create: `client/src/services/api.js`

- [ ] **Step 1: Create API service**

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export const clientsApi = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`)
};

export const projectsApi = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`)
};

export const quotesApi = {
  getAll: () => api.get('/quotes'),
  getById: (id) => api.get(`/quotes/${id}`),
  create: (data) => api.post('/quotes', data),
  update: (id, data) => api.put(`/quotes/${id}`, data),
  delete: (id) => api.delete(`/quotes/${id}`),
  addItem: (quoteId, item) => api.post(`/quotes/${quoteId}/items`, item),
  deleteItem: (quoteId, itemId) => api.delete(`/quotes/${quoteId}/items/${itemId}`)
};

export const materialsApi = {
  getAll: () => api.get('/materials'),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`)
};

export const laborRatesApi = {
  getAll: () => api.get('/labor-rates'),
  create: (data) => api.post('/labor-rates', data),
  update: (id, data) => api.put(`/labor-rates/${id}`, data),
  delete: (id) => api.delete('/labor-rates/${id}')
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats')
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data)
};

export default api;
```

- [ ] **Step 2: Create Dashboard page**

```jsx
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FolderKanban, FileText, DollarSign } from 'lucide-react';
import { dashboardApi } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dashboardApi.getStats().then(res => setStats(res.data));
  }, []);

  if (!stats) return <div>Loading...</div>;

  const cards = [
    { title: 'Total Clients', value: stats.totalClients, icon: Users, color: 'bg-blue-500' },
    { title: 'Active Projects', value: stats.activeProjects, icon: FolderKanban, color: 'bg-green-500' },
    { title: 'Quotes This Month', value: stats.quotesThisMonth, icon: FileText, color: 'bg-amber-500' },
    { title: 'Revenue', value: `KSh ${Number(stats.monthlyRevenue).toLocaleString()}`, icon: DollarSign, color: 'bg-purple-500' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.title} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                <card.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-xl font-bold">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `KSh ${Number(value).toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#1E40AF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Quotes</h2>
          <div className="space-y-3">
            {stats.recentQuotes.map(quote => (
              <div key={quote.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{quote.quoteNumber}</p>
                  <p className="text-sm text-gray-500">{quote.project?.client?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">KSh {Number(quote.total).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                    quote.status === 'SENT' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {quote.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 11: Client Management Page

**Files:**
- Create: `client/src/pages/Clients.jsx`

Implement list view with add/edit/delete functionality using modal forms.

- [ ] **Step 1: Create Clients page**

```jsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { clientsApi } from '../services/api';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', address: '' });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => clientsApi.getAll().then(res => setClients(res.data));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingClient) {
      await clientsApi.update(editingClient.id, formData);
    } else {
      await clientsApi.create(formData);
    }
    setShowModal(false);
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', company: '', address: '' });
    loadClients();
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData(client);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this client?')) {
      await clientsApi.delete(id);
      loadClients();
    }
  };

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} /> Add Client
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg"
            />
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Company</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(client => (
              <tr key={client.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{client.name}</td>
                <td className="px-4 py-3 text-gray-600">{client.company || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{client.email || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{client.phone || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(client)} className="text-primary hover:underline mr-3">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="text-red-500 hover:underline">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingClient ? 'Edit Client' : 'Add Client'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setShowModal(false); setEditingClient(null); }} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Task 12: Projects Page

**Files:**
- Create: `client/src/pages/Projects.jsx`

Similar structure to Clients with project-specific fields (type, status).

---

### Task 13: Quotes Page with Builder

**Files:**
- Create: `client/src/pages/Quotes.jsx`
- Create: `client/src/components/QuoteBuilder.jsx`

- [ ] **Step 1: Create Quotes page**

```jsx
import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, FileDown } from 'lucide-react';
import { quotesApi, projectsApi } from '../services/api';
import QuoteBuilder from '../components/QuoteBuilder';

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = () => quotesApi.getAll().then(res => setQuotes(res.data));

  const handleDelete = async (id) => {
    if (confirm('Delete this quote?')) {
      await quotesApi.delete(id);
      loadQuotes();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-700';
      case 'SENT': return 'bg-blue-100 text-blue-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <button onClick={() => setShowBuilder(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} /> New Quote
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Quote #</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Client</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Project</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map(quote => (
              <tr key={quote.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{quote.quoteNumber}</td>
                <td className="px-4 py-3">{quote.project?.client?.name}</td>
                <td className="px-4 py-3">{quote.project?.name}</td>
                <td className="px-4 py-3 text-right font-semibold">KSh {Number(quote.total).toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(quote.status)}`}>
                    {quote.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditingQuote(quote); setShowBuilder(true); }} className="text-primary hover:underline mr-3">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => handleDelete(quote.id)} className="text-red-500 hover:underline">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showBuilder && (
        <QuoteBuilder
          quote={editingQuote}
          onClose={() => { setShowBuilder(false); setEditingQuote(null); loadQuotes(); }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create QuoteBuilder component**

This is a complex component with project selection, line items management, and calculations. Include:
- Project dropdown
- Line items table with add/remove
- Material/labor quick-add
- Profit margin and tax inputs
- Live calculation display
- Save as draft / send options

---

### Task 14: Materials and Settings Pages

**Files:**
- Create: `client/src/pages/Materials.jsx`
- Create: `client/src/pages/Settings.jsx`

Implement CRUD for materials/labor rates and settings form.

---

### Task 15: PDF Generation

**Files:**
- Create: `client/src/utils/pdfGenerator.js`

```javascript
import jsPDF from 'jspdf';

export const generateQuotePDF = (quote, settings) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(settings.companyName || 'EngiQuote KE', 20, 20);
  
  doc.setFontSize(10);
  doc.text(settings.companyAddress || '', 20, 30);
  doc.text(settings.companyPhone || '', 20, 35);
  doc.text(settings.companyEmail || '', 20, 40);
  
  doc.setFontSize(16);
  doc.text('QUOTE', 150, 20);
  doc.setFontSize(10);
  doc.text(`Quote #: ${quote.quoteNumber}`, 150, 30);
  doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, 150, 35);
  doc.text(`Valid Until: ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}`, 150, 40);
  
  doc.setFontSize(12);
  doc.text('Bill To:', 20, 55);
  doc.setFontSize(10);
  doc.text(quote.project?.client?.name || '', 20, 62);
  doc.text(quote.project?.client?.company || '', 20, 67);
  doc.text(quote.project?.client?.address || '', 20, 72);
  
  let y = 90;
  doc.setFontSize(10);
  doc.text('Description', 20, y);
  doc.text('Qty', 120, y);
  doc.text('Unit', 140, y);
  doc.text('Price', 160, y);
  doc.text('Total', 180, y);
  
  doc.line(20, y + 2, 190, y + 2);
  y += 10;
  
  quote.items?.forEach(item => {
    doc.text(item.description.substring(0, 40), 20, y);
    doc.text(String(item.quantity), 120, y);
    doc.text(item.unit, 140, y);
    doc.text(Number(item.unitPrice).toLocaleString(), 160, y);
    doc.text(Number(item.total).toLocaleString(), 180, y);
    y += 8;
  });
  
  y += 10;
  doc.line(20, y, 190, y);
  y += 10;
  
  doc.text('Subtotal:', 140, y);
  doc.text(`KSh ${Number(quote.subtotal).toLocaleString()}`, 180, y);
  y += 8;
  doc.text(`Profit (${quote.profitMarginPercent}%):`, 140, y);
  doc.text(`KSh ${Number(quote.profitAmount).toLocaleString()}`, 180, y);
  y += 8;
  doc.text(`Tax (${quote.taxPercent}%):`, 140, y);
  doc.text(`KSh ${Number(quote.taxAmount).toLocaleString()}`, 180, y);
  y += 8;
  doc.setFontSize(12);
  doc.text('Total:', 140, y);
  doc.text(`KSh ${Number(quote.total).toLocaleString()}`, 180, y);
  
  if (quote.notes) {
    y += 20;
    doc.setFontSize(10);
    doc.text('Notes:', 20, y);
    doc.text(quote.notes, 20, y + 7);
  }
  
  doc.save(`${quote.quoteNumber}.pdf`);
};
```

---

## Phase 5: Testing and Verification

### Task 16: Verify Full Application

- [ ] **Step 1: Start backend server**

Run: `cd server && npm run dev`

- [ ] **Step 2: Start frontend dev server**

Run: `cd client && npm run dev`

- [ ] **Step 3: Verify all pages load**

Navigate to http://localhost:5173 and verify:
- Dashboard shows stats
- Can add/view/edit/delete clients
- Can add/view/edit/delete projects
- Can create quotes with line items
- Can generate PDF quotes
- Materials library works
- Settings save correctly

- [ ] **Step 4: Test calculations**

Verify quote calculations are correct:
- Subtotal = sum of (quantity × unit_price)
- Profit = subtotal × profit_margin%
- Tax = (subtotal + profit) × tax%
- Total = subtotal + profit + tax
