# ONTRA — Backend Integration Specification & API Checklist
**Target Architecture**: Node.js, Express.js, TypeScript, MySQL 8.0 (InnoDB)  
**Security Model**: JWT Bearer Tokens (short-lived access token + HttpOnly refresh token cookie), Escrow-first state engine, Role-Based Access Control (`buyer`, `seller`, `admin`).

---

## 1. System Architecture Overview

```
                      ┌───────────────────────────────────────────────┐
                      │                ONTRA Frontend                 │
                      │  (React 19 + TypeScript + Tailwind CSS v4)    │
                      └───────────────────────┬───────────────────────┘
                                              │
                         REST API Requests    │  (Bearer JWT + Credentials)
                                              ▼
                      ┌───────────────────────────────────────────────┐
                      │            Express.js API Gateway             │
                      │   - Helmet & CORS Security Headers            │
                      │   - JWT Auth & Role-Based Middleware (RBAC)   │
                      │   - Joi / Zod DTO Payload Validation          │
                      │   - Rate Limiter (express-rate-limit)         │
                      └───────────────┬───────────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────────────┐
              │                       │                               │
              ▼                       ▼                               ▼
    ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
    │  Business Logic   │   │  Escrow State &   │   │  Media Storage    │
    │  Controllers      │   │  Settlement Engine│   │  (S3 / Presigned) │
    └─────────┬─────────┘   └─────────┬─────────┘   └─────────┬─────────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │ (Connection Pool / Prisma / Knex)
                                      ▼
                      ┌───────────────────────────────────────────────┐
                      │         MySQL 8.0 Relational Database         │
                      │      (InnoDB, Strict Foreign Keys, ACID)      │
                      └───────────────────────────────────────────────┘
```

### Key Architectural Tenets
1. **Frontend Parity**: The frontend codebase includes a unified `apiClient.ts` that toggles between local demo simulations and live REST endpoints via `VITE_USE_MOCK_API=false`.
2. **Backend-Authoritative Escrow**: No client or UI state can mutate funds, trigger payouts, release settlements, or finalize inspections without backend validation and database transactions (`START TRANSACTION ... COMMIT`).
3. **Database Engine**: **MySQL 8.0+** with InnoDB storage engine, foreign keys (`ON DELETE RESTRICT`), indexes on frequent lookup fields (`order_id`, `seller_id`, `buyer_id`, `serial_number`), and `DECIMAL(12, 2)` for all monetary amounts to prevent floating-point inaccuracies.

---

## 2. API Endpoint Integration Checklist

### 2.1 Authentication & Profile (`/api/auth`)
| Method | Endpoint | Description | Role / Auth | Status |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Create new user account with initial trust metrics | Public | [x] Client Ready |
| `POST` | `/api/auth/login` | Authenticate email/mobile & password, return JWT token & user | Public | [x] Client Ready |
| `POST` | `/api/auth/logout` | Revoke refresh token and invalidate active session | Authenticated | [x] Client Ready |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile with verified statuses | Authenticated | [x] Client Ready |
| `POST` | `/api/auth/verify-email` | Confirm 6-digit email confirmation token | Authenticated | [x] Client Ready |
| `POST` | `/api/auth/verify-mobile` | Confirm 6-digit SMS OTP for phone verification | Authenticated | [x] Client Ready |
| `POST` | `/api/auth/resend-code` | Resend verification SMS or email token | Authenticated | [x] Client Ready |
| `POST` | `/api/auth/forgot-password`| Dispatch password reset token link | Public | [x] Client Ready |
| `POST` | `/api/auth/reset-password` | Set new password with verified reset token | Public | [x] Client Ready |

### 2.2 Products & Catalog (`/api/products`)
| Method | Endpoint | Description | Role / Auth | Status |
|---|---|---|---|---|
| `GET` | `/api/products` | Query published listings with filters (category, search, condition, price) | Public | [x] Client Ready |
| `GET` | `/api/products/:id` | Get full product manifest (photos, video demo, serial, CLA records) | Public | [x] Client Ready |
| `POST` | `/api/products` | Create a new listing with full 9-point evidence dossier | Seller | [x] Client Ready |
| `PUT` | `/api/products/:id` | Update existing listing metadata or evidence | Seller / Admin | [x] Client Ready |
| `PATCH`| `/api/products/:id/status`| Update listing lifecycle (`active`, `pending_inspection`, `sold`, `archived`) | Seller / Admin | [x] Client Ready |
| `DELETE`| `/api/products/:id` | Remove or soft-delete a product listing | Seller / Admin | [x] Client Ready |
| `POST` | `/api/products/:id/offers` | Submit formal binding price offer | Buyer | [x] Client Ready |
| `GET` | `/api/categories` | Retrieve all active product categories and verification requirements | Public | [x] Client Ready |

### 2.3 Orders, Escrow & Payments (`/api/orders`)
| Method | Endpoint | Description | Role / Auth | Status |
|---|---|---|---|---|
| `GET` | `/api/orders` | Fetch orders filtered by user role (`buyer` or `seller`) | Authenticated | [x] Client Ready |
| `GET` | `/api/orders/:id` | Get detailed order status, timeline, escrow vault, and inspection countdown | Order Party / Admin | [x] Client Ready |
| `POST` | `/api/orders` | Initialize new order from product listing or accepted offer | Buyer | [x] Client Ready |
| `POST` | `/api/orders/:id/payment` | Process payment intent / confirm escrow funding hold | Buyer | [x] Client Ready |
| `POST` | `/api/orders/:id/transition` | Enforce server-side stage progression | Order Party / Admin | [x] Client Ready |
| `POST` | `/api/orders/:id/handover/verify` | Verify 6-digit physical handover OTP code | Seller / Buyer | [x] Client Ready |
| `PATCH`| `/api/orders/:id/courier` | Update tracking number, carrier status & proof of dispatch | Seller / Carrier Webhook | [x] Client Ready |

### 2.4 Buyer Inspection & Settlement (`/api/orders/:id/inspection`)
| Method | Endpoint | Description | Role / Auth | Status |
|---|---|---|---|---|
| `POST` | `/api/orders/:id/inspection/approve` | Buyer confirms item matches manifest; releases escrow payout to seller | Buyer | [x] Client Ready |
| `POST` | `/api/orders/:id/inspection/expire` | Server-triggered expiry of 48-hour inspection clock (auto-releases escrow) | Cron / Admin | [x] Client Ready |

### 2.5 Disputes & Arbitration (`/api/disputes`)
| Method | Endpoint | Description | Role / Auth | Status |
|---|---|---|---|---|
| `GET` | `/api/disputes` | Query disputes for current user or admin arbitration queue | Authenticated | [x] Client Ready |
| `GET` | `/api/disputes/:id` | Fetch dispute case, evidence timeline, and statements | Case Party / Admin | [x] Client Ready |
| `POST` | `/api/disputes` | Raise formal dispute, freezing escrow payout immediately | Buyer | [x] Client Ready |
| `POST` | `/api/disputes/:id/seller-response` | Seller uploads formal rebuttal statement and documentation | Seller | [x] Client Ready |
| `POST` | `/api/disputes/:id/admin-decision` | Neutral arbitrator records binding ruling (refund, return, release) | Admin | [x] Client Ready |

### 2.6 Refunds & Reviews (`/api/refunds`, `/api/reviews`)
| Method | Endpoint | Description | Role / Auth | Status |
|---|---|---|---|---|
| `GET` | `/api/refunds` | Query refund ledger records | Authenticated | [x] Client Ready |
| `GET` | `/api/refunds/:id` | Get single refund status and gateway reversal timeline | Authenticated | [x] Client Ready |
| `GET` | `/api/reviews` | Get verified peer reviews for seller | Public | [x] Client Ready |
| `POST` | `/api/reviews` | Submit verified purchase review (only permitted on `completed` orders) | Buyer | [x] Client Ready |

### 2.7 Media Upload (`/api/media`)
| Method | Endpoint | Description | Role / Auth | Status |
|---|---|---|---|---|
| `POST` | `/api/media/upload` | Multipart file upload for photos, videos, and private invoices | Authenticated | [x] Client Ready |
| `POST` | `/api/media/presigned-url` | Generate S3/GCS presigned PUT URL for direct client-to-cloud upload | Authenticated | [x] Client Ready |

### 2.8 Platform Administration (`/api/admin`)
| Method | Endpoint | Description | Role / Auth | Status |
|---|---|---|---|---|
| `GET` | `/api/admin/metrics` | Retrieve platform KPI summary (escrow volume, disputes, approval rate) | Admin | [x] Client Ready |
| `GET` | `/api/admin/users` | List platform users with filter/search and trust metrics | Admin | [x] Client Ready |
| `PATCH`| `/api/admin/users/:id/status` | Suspend, restrict, or reactivate user account with audit trail | Admin | [x] Client Ready |
| `GET` | `/api/admin/verifications` | List pending seller identity and bank verification submissions | Admin | [x] Client Ready |
| `POST` | `/api/admin/verifications/:id/review` | Approve or reject seller identity documentation | Admin | [x] Client Ready |
| `GET` | `/api/admin/moderation` | List flagged listings or new listings requiring review | Admin | [x] Client Ready |
| `POST` | `/api/admin/moderation/:id/action` | Approve, flag, or reject product listing | Admin | [x] Client Ready |
| `GET` | `/api/admin/payments` | View full ledger of escrow deposits and card captures | Admin | [x] Client Ready |
| `GET` | `/api/admin/settlements`| View scheduled and released seller bank disbursements | Admin | [x] Client Ready |
| `GET` | `/api/admin/reports` | View community misconduct and fraudulent listing reports | Admin | [x] Client Ready |
| `POST` | `/api/admin/reports/:id/resolve` | Take action on report and append resolution notes | Admin | [x] Client Ready |
| `GET` | `/api/admin/fees` | Get current platform commission and inspection window settings | Admin | [x] Client Ready |
| `PUT` | `/api/admin/fees` | Update platform fee policy and inspection parameters | Admin | [x] Client Ready |
| `GET` | `/api/admin/audit-logs` | Retrieve immutable administrative security and audit logs | Admin | [x] Client Ready |

---

## 3. Relational MySQL 8.0 Schema DDL

The database must be created with `utf8mb4` encoding and InnoDB engine:

```sql
CREATE DATABASE IF NOT EXISTS ontra_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ontra_db;

-- 1. Users Table
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('buyer', 'seller', 'admin') NOT NULL DEFAULT 'buyer',
  status ENUM('active', 'restricted', 'suspended') NOT NULL DEFAULT 'active',
  identity_status ENUM('unverified', 'pending', 'verified') NOT NULL DEFAULT 'unverified',
  phone_status ENUM('unverified', 'pending', 'verified') NOT NULL DEFAULT 'unverified',
  bank_status ENUM('unverified', 'pending', 'verified') NOT NULL DEFAULT 'unverified',
  trust_score INT NOT NULL DEFAULT 80,
  city VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500) NULL,
  suspension_reason TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role_status (role, status)
) ENGINE=InnoDB;

-- 2. Seller Identity Verifications
CREATE TABLE seller_verifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  business_type ENUM('individual', 'registered_business') NOT NULL,
  id_type ENUM('passport', 'drivers_license', 'national_id') NOT NULL,
  id_doc_number VARCHAR(100) NOT NULL,
  id_document_url VARCHAR(500) NOT NULL,
  selfie_with_id_url VARCHAR(500) NOT NULL,
  bank_proof_url VARCHAR(500) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  verified_by VARCHAR(64) NULL,
  rejection_reason TEXT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP NULL,
  CONSTRAINT fk_verif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 3. Categories
CREATE TABLE categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon_name VARCHAR(50) NOT NULL,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Products Table
CREATE TABLE products (
  id VARCHAR(64) PRIMARY KEY,
  seller_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category_id VARCHAR(64) NOT NULL,
  sub_category VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  asking_price DECIMAL(12, 2) NOT NULL,
  original_retail_price DECIMAL(12, 2) NOT NULL,
  is_negotiable BOOLEAN NOT NULL DEFAULT TRUE,
  min_offer_allowed DECIMAL(12, 2) NULL,
  condition_state ENUM('brand_new', 'like_new', 'excellent', 'good', 'fair') NOT NULL,
  working_status ENUM('functional', 'minor_issue', 'for_parts') NOT NULL DEFAULT 'functional',
  defects_and_scratches TEXT NOT NULL,
  repairs_and_replacements TEXT NULL,
  serial_number VARCHAR(100) NULL,
  serial_verified BOOLEAN NOT NULL DEFAULT FALSE,
  authenticity_guaranteed BOOLEAN NOT NULL DEFAULT TRUE,
  seller_location VARCHAR(100) NOT NULL,
  approximate_location VARCHAR(200) NOT NULL,
  allows_courier BOOLEAN NOT NULL DEFAULT TRUE,
  allows_handover BOOLEAN NOT NULL DEFAULT TRUE,
  insured_shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 299.00,
  inspection_window_hours INT NOT NULL DEFAULT 48,
  primary_image_url VARCHAR(500) NOT NULL,
  video_url VARCHAR(500) NULL,
  status ENUM('active', 'pending_inspection', 'sold', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_prod_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_prod_cat FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_prod_status_cat (status, category_id),
  INDEX idx_prod_price (asking_price)
) ENGINE=InnoDB;

-- 5. Product Evidence Photos (5-Angle Dossier)
CREATE TABLE product_evidence_photos (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL,
  angle_type ENUM('front', 'back', 'left', 'right', 'accessories', 'close_up', 'serial_stamp') NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_photo_prod FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Product Private Invoices & Documents
CREATE TABLE product_documents (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL,
  doc_type ENUM('receipt', 'warranty_card', 'cla_certificate', 'appraisal') NOT NULL,
  document_url VARCHAR(500) NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_doc_prod FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Offers Table
CREATE TABLE offers (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL,
  buyer_id VARCHAR(64) NOT NULL,
  offered_amount DECIMAL(12, 2) NOT NULL,
  message TEXT NULL,
  status ENUM('pending', 'accepted', 'countered', 'rejected', 'expired') NOT NULL DEFAULT 'pending',
  counter_amount DECIMAL(12, 2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_off_prod FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_off_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 8. Orders Table
CREATE TABLE orders (
  id VARCHAR(64) PRIMARY KEY,
  order_reference VARCHAR(64) NOT NULL UNIQUE,
  product_id VARCHAR(64) NOT NULL,
  buyer_id VARCHAR(64) NOT NULL,
  seller_id VARCHAR(64) NOT NULL,
  agreed_price DECIMAL(12, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_payable DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  delivery_method ENUM('courier', 'direct_handover') NOT NULL,
  current_stage ENUM(
    'offer_accepted',
    'payment_pending',
    'held_in_escrow',
    'courier_in_transit',
    'direct_handover_pending',
    'inspection_active',
    'completed',
    'dispute_opened',
    'refund_processing'
  ) NOT NULL DEFAULT 'payment_pending',
  handover_otp_hash VARCHAR(255) NULL,
  handover_verified_at TIMESTAMP NULL,
  delivery_address_json JSON NULL,
  handover_details_json JSON NULL,
  courier_tracking_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ord_prod FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ord_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ord_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_ord_stages (current_stage),
  INDEX idx_ord_buyer (buyer_id),
  INDEX idx_ord_seller (seller_id)
) ENGINE=InnoDB;

-- 9. Escrow Deposits & Settlement Records
CREATE TABLE escrow_deposits (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL UNIQUE,
  payment_gateway_ref VARCHAR(100) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  amount_deposited DECIMAL(12, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  net_seller_payout DECIMAL(12, 2) NOT NULL,
  escrow_status ENUM('pending', 'held', 'settlement_scheduled', 'released', 'refunded', 'frozen_dispute') NOT NULL DEFAULT 'held',
  inspection_window_ends_at TIMESTAMP NULL,
  settlement_released_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_escrow_ord FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 10. Disputes Table
CREATE TABLE disputes (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL UNIQUE,
  buyer_id VARCHAR(64) NOT NULL,
  seller_id VARCHAR(64) NOT NULL,
  reason ENUM(
    'product_not_received',
    'product_damaged',
    'product_not_working',
    'product_significantly_different',
    'missing_accessories',
    'undisclosed_defects',
    'counterfeit_or_misrepresentation',
    'other'
  ) NOT NULL,
  detailed_explanation TEXT NOT NULL,
  status ENUM(
    'open',
    'awaiting_seller_response',
    'under_admin_review',
    'additional_evidence_required',
    'resolved'
  ) NOT NULL DEFAULT 'awaiting_seller_response',
  seller_statement TEXT NULL,
  seller_responded_at TIMESTAMP NULL,
  arbitrator_id VARCHAR(64) NULL,
  admin_decision ENUM(
    'approve_full_refund',
    'approve_partial_refund',
    'approve_seller_settlement',
    'authorize_return_and_refund',
    'request_more_evidence'
  ) NULL,
  admin_reasoning TEXT NULL,
  refund_amount_awarded DECIMAL(12, 2) NULL,
  decided_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_disp_ord FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  CONSTRAINT fk_disp_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_disp_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 11. Dispute Evidence Media
CREATE TABLE dispute_evidence (
  id VARCHAR(64) PRIMARY KEY,
  dispute_id VARCHAR(64) NOT NULL,
  uploaded_by ENUM('buyer', 'seller', 'admin') NOT NULL,
  media_type ENUM('photo', 'video', 'document') NOT NULL,
  media_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evid_disp FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Refunds Table
CREATE TABLE refunds (
  id VARCHAR(64) PRIMARY KEY,
  refund_reference VARCHAR(64) NOT NULL UNIQUE,
  order_id VARCHAR(64) NOT NULL,
  dispute_id VARCHAR(64) NULL,
  buyer_id VARCHAR(64) NOT NULL,
  original_payment DECIMAL(12, 2) NOT NULL,
  refund_amount DECIMAL(12, 2) NOT NULL,
  refund_reason TEXT NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'processing',
  payment_method_used VARCHAR(50) NOT NULL DEFAULT 'card',
  gateway_reversal_id VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  CONSTRAINT fk_ref_ord FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ref_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 13. Reviews Table
CREATE TABLE reviews (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL UNIQUE,
  product_id VARCHAR(64) NOT NULL,
  seller_id VARCHAR(64) NOT NULL,
  buyer_id VARCHAR(64) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT TRUE,
  delivery_rating ENUM('fast', 'on_time', 'delayed') NULL,
  item_accuracy_rating ENUM('exact', 'better_than_expected', 'minor_difference') NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rev_ord FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  CONSTRAINT fk_rev_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_rev_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 14. Notifications Table
CREATE TABLE platform_notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('order', 'offer', 'inspection', 'dispute', 'settlement', 'system') NOT NULL,
  target_url VARCHAR(255) NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- 15. Security & Audit Logs Table
CREATE TABLE audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  admin_id VARCHAR(64) NULL,
  admin_email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  category ENUM('user_management', 'listing_moderation', 'arbitration', 'payout_override', 'fee_configuration') NOT NULL,
  target_id VARCHAR(64) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_category (category),
  INDEX idx_audit_target (target_id)
) ENGINE=InnoDB;
```

---

## 4. Escrow & Order State Transition Invariants

The backend Express application must strictly implement the state machine below with database row-level locking (`SELECT ... FOR UPDATE`):

```
[Offer Accepted / Buy Now]
            │
            ▼
   payment_pending ─────(Payment Failed)────> [Cancelled]
            │
            ▼ (Razorpay / Cashfree / UPI Escrow Hold Captured)
     held_in_escrow
       │          │
       │ (Courier)│ (In-Person Handover)
       ▼          ▼
 courier_in_transit  direct_handover_pending
       │          │
       │ (Delivered Scan / Handover OTP Verified)
       ▼          ▼
    inspection_active (48-Hour Inspection Clock Starts)
       │          │
       │          ├─────(Buyer Discrepancy)─────┐
       │                                        ▼
       │ (Buyer Approves OR 48h Clock Expires)  dispute_opened
       ▼                                        │ (Escrow Frozen)
   completed                                    ▼
       │                           (Arbitrator Decision)
       ▼                                   /          \
  settlement_released                     ▼            ▼
 (Net payout sent to seller)       refund_processing  settlement_released
                                  (Returned to Buyer) (Dismissed to Seller)
```

### Invariants:
1. **Never Bypass Escrow**: No order can move to `courier_in_transit` or `direct_handover_pending` unless `escrow_deposits.escrow_status = 'held'`.
2. **OTP Zero-Knowledge Proof**: The handover OTP is hashed in MySQL. The seller cannot see the buyer's secret 6-digit code until physical meeting.
3. **Dispute Auto-Freeze**: When an order enters `dispute_opened`, the escrow engine sets `escrow_deposits.escrow_status = 'frozen_dispute'`, preventing automatic payout timer expiry.

---

## 5. Environment Variables Configuration

Copy `.env.example` to `.env` when deploying the Node.js backend:

```bash
# Server Port & Mode
PORT=3000
NODE_ENV=production

# Frontend Application Origin (for CORS)
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# MySQL Relational Database Credentials
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=ontra_user
DB_PASSWORD=secret_secure_password
DB_NAME=ontra_db
DB_CONNECTION_LIMIT=20

# JWT Auth Secrets
JWT_SECRET=super_secret_jwt_access_key_minimum_32_characters
JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_minimum_32_characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Payment, Logistics & Cloud Storage Integrations (India - ap-south-1)
PAYMENT_GATEWAY_KEY_ID=rzp_live_...
PAYMENT_GATEWAY_SECRET=...
SHIPROCKET_API_EMAIL=logistics@ontra.in
AWS_S3_BUCKET=ontra-evidence-vault
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
```

---

## 6. Migration Guide from Frontend Mock to Live Express Backend

1. In the frontend environment (`.env`):
   ```env
   VITE_API_BASE_URL="http://localhost:3000/api"
   VITE_USE_MOCK_API="false"
   ```
2. Start the Express server on port 3000 with the provided MySQL DDL imported.
3. Every frontend service (`authService`, `productService`, `transactionService`, `disputeService`, `adminService`, `notificationService`, `mediaService`) will seamlessly switch to executing typed HTTP calls against the Express REST endpoints without modifying a single line of React UI code.
