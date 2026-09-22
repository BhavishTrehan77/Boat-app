# LLD — Low Level Design

### 1. Request Lifecycle & Pipeline
Every incoming API request follows an explicit verification pipeline:
```
Client Request 
  ↳ Route Handler (src/app/api/*)
    ↳ Authentication Check (getServerSession via src/app/lib/session.js)
    ↳ Request Validation (Zod safeParse / safeParse on partial schema)
    ↳ Authorization & Data Ownership Enforcement (role & userId check)
    ↳ Service Layer (Business Logic & Backend Calculations)
    ↳ Prisma Client (ORM operations)
    ↳ MySQL Database
```

### 2. Authentication & Session Handling
- **NextAuth Integration**: Configured in `src/app/lib/auth.js` and mounted at `/api/auth/[...nextauth]`.
- **Credentials Provider**: Authenticates user email and password against MySQL using `bcrypt.compare`.
- **JWT & Session Callbacks**: User `id` and `role` are stored in the JWT token and mapped to `session.user.id` and `session.user.role`.
- **Session Retrieval**: Server Route Handlers use `getAuthSession()` to extract the current authenticated session from HTTP cookies without manual JWT parsing.

### 3. Products Module
- **Validation**: Schema defined in `src/app/validators/product.validator.js`:
  - `productName`: string, min 3, max 100 chars.
  - `serialNumber`: string, min 5, max 50 chars.
  - `purchaseDate`: coerced Date.
  - `warrantyMonths`: positive number > 0.
  - `userId`: optional (automatically injected from session user).
- **Backend Expiry Calculation**: `calculateExpiryDate(purchaseDate, warrantyMonths)` computes the exact expiration date on the server, guaranteeing data integrity.
- **Serial Number Unique Handling**: Catches duplicate serial number conflicts (including Prisma code `P2002`) and returns HTTP 409 Conflict.
- **Data Scoping & Ownership**:
  - `GET /api/products`: Returns only products where `userId === session.user.id` for regular users; returns all products for `ADMIN`.
  - `PATCH /api/products/[id]`: Validated using `Productvalidation.partial().safeParse(body)`. Checks that `product.userId === session.user.id` or `session.user.role === 'ADMIN'`. Recalculates `expiryDate` if `purchaseDate` or `warrantyMonths` is updated.
  - `DELETE /api/products/[id]`: Checks ownership before removal.

### 4. Repair Service & Workflow Module
- **Validation**: Defined in `src/app/validators/repair.validator.js` (`issue`, `description`, `repairDate`, `cost`, `productId`).
- **Product Ownership Check**: When creating a ticket (`POST /api/repair`), the system validates that the referenced `productId` exists and belongs to the authenticated user (or user is `ADMIN`).
- **Data Scoping**: Regular users can only retrieve tickets linked to products they own.
- **Admin Status Workflow**:
  - `PATCH /api/repair/[id]`: Uses `RepairValidation.partial().safeParse(body)`.
  - Status updates (`PENDING` → `IN_PROGRESS` → `COMPLETED`) are strictly restricted to `ADMIN` users. Any attempt by a non-admin to alter status returns HTTP 403 Forbidden.

### 5. Warranty Documents & Storage Module
- **Public Lookup**: `GET /api/products/serial/[serialNumber]` queries product, linked documents, and repair history by serial number without requiring login.
- **Upload Route**: `POST /api/warranty/upload` allows authenticated Users (for their products) and Admins (for any product).
- **Download Route**: `GET /api/warranty/download/[id]` allows Admins and product owners to download warranty documents and images.
- **Validation & Size Limits**:
  - Supports image formats (`image/jpeg`, `image/png`, `image/webp`) and PDF (`application/pdf`).
  - Enforces 5MB maximum file size limit.
  - Verifies that target `productId` exists in the database.
- **Storage Strategy**: Local storage using `multer.diskStorage` writing files to `./public/uploads/`.

### 6. Dashboard Analytics Module
- **Platform Console**: `GET /api/dashboard` requires `session.user.role === 'ADMIN'`. Aggregates platform-wide metrics (`totalUsers`, `totalProducts`, `activeWarranty`, `expiredWarranty`, `pendingRepairs`, `completedRepairs`).
- **User Dashboard**: `GET /api/dashboard/user/[id]` validates that `session.user.id === id` or the session user is `ADMIN`. Returns device counts, warranty status, and service ticket metrics scoped exclusively to that user.