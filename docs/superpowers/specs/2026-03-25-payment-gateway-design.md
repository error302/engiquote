# EngiQuote KE - Payment Gateway Design

## Overview

**Project Name:** EngiQuote KE Payment Gateway  
**Type:** Backend + Frontend integration  
**Core Functionality:** Accept payments via M-Pesa (Kenya) and Stripe (International)  
**Target Users:** Clients paying invoices

---

## Technical Architecture

### Payment Providers
1. **M-Pesa (Kenya)**
   - STK Push (simulate payment)
   - API: Daraja API
   - Currency: KES

2. **Stripe (International)**
   - Card payments
   - API: Stripe Checkout
   - Currency: USD, EUR, GBP

### Database
- New `payments` table extension for payment records

---

## API Endpoints

- `POST /api/payments/mpesa/stkpush` - Initiate M-Pesa payment
- `POST /api/payments/mpesa/callback` - M-Pesa callback
- `POST /api/payments/stripe/create-checkout` - Create Stripe session
- `POST /api/payments/stripe/webhook` - Stripe webhook
- `GET /api/payments/:invoiceId` - Get payments for invoice

---

## Flow

### M-Pesa Flow
1. Client enters phone number
2. Backend sends STK Push
3. Client enters PIN on phone
4. M-Pesa sends callback
5. Backend confirms payment → updates invoice

### Stripe Flow
1. Client selects card payment
2. Backend creates Stripe Checkout session
3. Client enters card details
4. Stripe sends webhook
5. Backend confirms payment → updates invoice

---

## Acceptance Criteria

1. Can initiate M-Pesa STK Push
2. Can handle M-Pesa payment callback
3. Can create Stripe Checkout session
4. Can handle Stripe webhook
5. Invoice status updates automatically on payment
6. Payment history recorded
