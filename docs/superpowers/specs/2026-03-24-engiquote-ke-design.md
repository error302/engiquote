# EngiQuote KE - Design Specification

## Project Overview

**Project Name**: EngiQuote KE  
**Type**: Full-stack Web Application  
**Core Functionality**: Engineering quotation management system for Kenyan engineering firms - handles client management, project tracking, quote generation with auto-calculation, and PDF export.  
**Target Users**: Engineering firms in Kenya (civil, electrical, mechanical, architecture sectors)

---

## Technical Architecture

### Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL with Prisma ORM
- **PDF Generation**: jsPDF + html2canvas

### Project Structure
```
ENGIQUOTE/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service functions
│   │   └── utils/         # Utility functions
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── index.js       # Server entry point
│   └── ...
├── prisma/                 # Database schema
│   └── schema.prisma
└── package.json
```

---

## Database Schema

### Tables

**clients**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Client name |
| email | VARCHAR(255) | Email address |
| phone | VARCHAR(50) | Phone number |
| company | VARCHAR(255) | Company name |
| address | TEXT | Physical address |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

**projects**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| client_id | UUID | Foreign key to clients |
| name | VARCHAR(255) | Project name |
| type | ENUM | civil, electrical, mechanical, architecture |
| status | ENUM | pending, in_progress, completed, cancelled |
| description | TEXT | Project description |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

**quotes**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | Foreign key to projects |
| quote_number | VARCHAR(50) | Auto-generated quote number |
| status | ENUM | draft, sent, accepted, rejected |
| subtotal | DECIMAL(12,2) | Sum of line items |
| profit_margin_percent | DECIMAL(5,2) | Profit margin |
| profit_amount | DECIMAL(12,2) | Calculated profit |
| tax_percent | DECIMAL(5,2) | Tax rate |
| tax_amount | DECIMAL(12,2) | Calculated tax |
| total | DECIMAL(12,2) | Final total |
| valid_until | DATE | Quote validity |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

**quote_items**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| quote_id | UUID | Foreign key to quotes |
| category | VARCHAR(100) | material, labor, equipment, other |
| description | TEXT | Item description |
| quantity | DECIMAL(10,2) | Quantity |
| unit | VARCHAR(20) | unit, hour, piece, etc. |
| unit_price | DECIMAL(12,2) | Price per unit |
| total | DECIMAL(12,2) | quantity * unit_price |

**materials**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Material name |
| category | VARCHAR(100) | Material category |
| unit | VARCHAR(20) | Unit of measurement |
| unit_price | DECIMAL(12,2) | Price per unit |
| description | TEXT | Description |

**labor_rates**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| role | VARCHAR(100) | Job role |
| hourly_rate | DECIMAL(12,2) | Rate per hour |
| description | TEXT | Description |

**settings**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| key | VARCHAR(100) | Setting key |
| value | TEXT | Setting value |

---

## UI/UX Specification

### Layout Structure
- **Sidebar**: Fixed left sidebar (240px width) with navigation
- **Header**: Top bar with page title and user actions
- **Content Area**: Main content with padding (24px)
- **Responsive**: Collapsible sidebar on mobile (<768px)

### Visual Design

#### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Primary | Engineering Blue | #1E40AF |
| Primary Light | Light Blue | #3B82F6 |
| Secondary | Slate Gray | #475569 |
| Accent | Amber | #F59E0B |
| Success | Green | #10B981 |
| Warning | Orange | #F97316 |
| Danger | Red | #EF4444 |
| Background | Light Gray | #F8FAFC |
| Surface | White | #FFFFFF |
| Text Primary | Dark Slate | #1E293B |
| Text Secondary | Gray | #64748B |
| Border | Light Border | #E2E8F0 |

#### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: 
  - H1: 28px, font-weight 700
  - H2: 24px, font-weight 600
  - H3: 20px, font-weight 600
  - H4: 16px, font-weight 600
- **Body**: 14px, font-weight 400
- **Small**: 12px, font-weight 400

#### Spacing System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px

#### Border Radius
- Small: 4px
- Medium: 8px
- Large: 12px
- Full: 9999px (pills)

### Components

#### Sidebar Navigation
- Logo at top
- Navigation items with icons
- Active state: blue background, white text
- Hover state: light blue background

#### Data Tables
- Striped rows (alternating white/gray)
- Sortable columns
- Action buttons (view, edit, delete)
- Pagination

#### Forms
- Label above input
- Input height: 40px
- Focus state: blue border
- Error state: red border with message

#### Cards
- White background
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Border radius: 8px
- Padding: 16px or 24px

#### Buttons
- Primary: Blue background, white text
- Secondary: White background, gray border
- Danger: Red background, white text
- Height: 36px (small), 40px (default), 48px (large)
- Border radius: 6px

---

## Functionality Specification

### 1. Dashboard
- **Stats Cards**: Total clients, active projects, quotes this month, revenue
- **Recent Quotes**: Last 5 quotes with status
- **Revenue Chart**: Monthly revenue bar chart (last 6 months)
- **Quick Actions**: New Quote, New Client buttons

### 2. Client Management
- **List View**: Table with search and filter
- **Add Client**: Form with validation
- **Edit Client**: Pre-filled form
- **View Client**: Detail view with associated projects/quotes
- **Delete Client**: Confirmation dialog

### 3. Project Management
- **List View**: Table with filters by type and status
- **Create Project**: Select client, enter name, select type
- **Project Details**: View all quotes for project
- **Status Tracking**: pending → in_progress → completed

### 4. Quote Builder
- **Create Quote**: 
  1. Select project
  2. Add line items (material/labor/equipment/other)
  3. Auto-calculate subtotal
  4. Set profit margin (%)
  5. Set tax rate (%)
  6. Calculate total
- **Line Item Features**:
  - Quick add from material/labor library
  - Manual entry
  - Edit/delete
- **Quote Status**: draft → sent → accepted/rejected
- **Quote Number**: Auto-generated (EQ-YYYYMMDD-XXX)

### 5. Material/Library Management
- **Material Library**: CRUD for materials with pricing
- **Labor Rates**: CRUD for labor roles with hourly rates
- **Categories**: Organize by type

### 6. PDF Generation
- **Quote Template**:
  - Company header
  - Client details
  - Quote number and date
  - Line items table
  - Subtotal, profit, tax, total
  - Terms and conditions
  - Validity period

### 7. Settings
- **Company Info**: Name, address, contact
- **Default Tax Rate**: %
- **Default Profit Margin**: %
- **Quote Validity**: Days

---

## API Endpoints

### Clients
- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Quotes
- `GET /api/quotes` - List all quotes
- `GET /api/quotes/:id` - Get quote with items
- `POST /api/quotes` - Create quote
- `PUT /api/quotes/:id` - Update quote
- `DELETE /api/quotes/:id` - Delete quote

### Quote Items
- `POST /api/quotes/:id/items` - Add item to quote
- `PUT /api/quotes/:id/items/:itemId` - Update item
- `DELETE /api/quotes/:id/items/:itemId` - Delete item

### Materials
- `GET /api/materials` - List materials
- `POST /api/materials` - Create material
- `PUT /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material

### Labor Rates
- `GET /api/labor-rates` - List labor rates
- `POST /api/labor-rates` - Create labor rate
- `PUT /api/labor-rates/:id` - Update labor rate
- `DELETE /api/labor-rates/:id` - Delete labor rate

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings

---

## Acceptance Criteria

1. ✓ User can create, view, edit, delete clients
2. ✓ User can create projects and associate with clients
3. ✓ User can create quotes with multiple line items
4. ✓ Quote totals auto-calculate (subtotal, profit, tax, total)
5. ✓ User can generate PDF quotes
6. ✓ Dashboard shows accurate statistics
7. ✓ Material and labor rate libraries are manageable
8. ✓ Application is responsive on desktop and tablet
9. ✓ All forms validate required fields
10. ✓ Application handles errors gracefully
