# EngiQuote KE - Mobile App Design

## Overview

**Project Name:** EngiQuote KE Mobile  
**Type:** Cross-platform Mobile Application (iOS + Android)  
**Core Functionality:** Mobile companion to the web app - manage clients, projects, quotes, and invoices on the go  
**Target Users:** Sales team, engineers, project managers

---

## Technical Architecture

### Tech Stack
- **Framework:** React Native with Expo SDK 52
- **Navigation:** Expo Router (file-based routing)
- **State Management:** React Context + AsyncStorage
- **API:** REST API (existing backend)
- **UI Components:** React Native Paper (Material Design 3)
- **HTTP Client:** Axios

### Project Structure
```
engiquote-mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx      # Dashboard
│   │   ├── clients.tsx
│   │   ├── quotes.tsx
│   │   └── settings.tsx
│   ├── login.tsx
│   ├── clients/
│   │   └── [id].tsx
│   └── quotes/
│       └── [id].tsx
├── components/             # Reusable components
├── services/               # API services
├── context/                # Auth context
└── utils/                  # Helpers
```

---

## UI/UX Specification

### Layout Structure
- **Tab Navigation:** 4 tabs (Dashboard, Clients, Quotes, Settings)
- **Header:** Screen title + action buttons
- **Content:** Scrollable lists with pull-to-refresh

### Color Palette
| Role | Light Mode | Dark Mode |
|------|------------|-----------|
| Primary | #1E40AF | #3B82F6 |
| Secondary | #475569 | #94A3B8 |
| Background | #F8FAFC | #0F172A |
| Surface | #FFFFFF | #1E293B |
| Success | #10B981 | #34D399 |
| Warning | #F97316 | #FB923C |
| Error | #EF4444 | #F87171 |

### Typography
- **Font:** System default (San Francisco iOS, Roboto Android)
- **Headings:** 24px bold
- **Body:** 16px regular
- **Caption:** 12px regular

### Components
- **Cards:** Client/Quote summary cards with status badges
- **Lists:** FlatList with swipe actions
- **Forms:** TextInput with floating labels
- **Buttons:** FAB for primary actions
- **Modals:** Bottom sheets for quick actions

---

## Functionality Specification

### 1. Authentication
- Login with email/password
- JWT token storage (SecureStore)
- Auto-logout on token expiry

### 2. Dashboard
- Quick stats (clients, projects, quotes count)
- Recent quotes list
- Quick action buttons

### 3. Clients
- List all clients (searchable)
- View client details
- Add new client
- Call/Email client (deep links)

### 4. Quotes
- List all quotes with status filter
- View quote details
- Quick status update
- Generate PDF (local)

### 5. Offline Support
- Cache data locally
- Queue actions when offline
- Sync when back online

---

## API Integration

### Endpoints Used
- `GET /api/clients` - List clients
- `GET /api/clients/:id` - Client details
- `POST /api/clients` - Create client
- `GET /api/quotes` - List quotes
- `GET /api/quotes/:id` - Quote details
- `PUT /api/quotes/:id` - Update quote
- `GET /api/dashboard/stats` - Dashboard data

### Authentication
- Bearer token in Authorization header
- Token stored in SecureStore

---

## Acceptance Criteria

1. User can log in and stay logged in
2. Dashboard shows accurate stats
3. Can browse, search clients
4. Can view quote details
5. App works offline (reads cached data)
6. Dark mode support
