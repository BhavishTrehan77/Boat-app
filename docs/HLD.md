# HLD — High Level Design

The application follows a modular, layered full-stack architecture built with **Next.js (App Router)** for both the frontend and backend API route handlers, **Prisma** as the ORM, and **MySQL** as the relational database.

### System Architecture & Layers
1. **Client Layer**: Next.js React client components with server rendering where appropriate, utilizing `next-auth/react` for session state management.
2. **API & Route Handler Layer**: Next.js App Router route handlers (`/api/*`) executing request validation using **Zod**, session verification using NextAuth (`getServerSession`), and role/ownership authorization before invoking services.
3. **Service Layer**: Pure business logic layer encapsulating product lifecycle management, backend warranty expiry calculations, repair workflows, file validation and cloud storage uploads (Google Cloud Storage with local disk fallback).
4. **Data Access Layer**: Prisma Client handling type-safe database queries against MySQL.

### Core Entities & Relationships
- **User**: Stores registered user accounts with encrypted passwords (via bcrypt) and roles (`USER`, `ADMIN`). One User has many Products.
- **Product**: Hardware device records identified by unique `serialNumber`, purchase date, warranty duration in months, and backend-calculated expiry date. Associated with an owner User, multiple `WarrantyDocument` records, and multiple `RepairHistory` records.
- **WarrantyDocument**: Metadata for uploaded warranty documents and invoices (`fileName`, `fileUrl`, `productId`), restricted to Admin uploads.
- **RepairHistory**: Service tickets documenting hardware issues, repair costs, filed dates, and status lifecycle (`PENDING`, `IN_PROGRESS`, `COMPLETED`).

### Security & Role-Based Access Control (RBAC)
- **Authentication**: Powered by **NextAuth** Credentials Provider with JWT session strategy and role injection into sessions.
- **Admin Role**: Unrestricted platform visibility, access to the platform analytics console (`/api/dashboard`), ability to view all products and repairs, ability to advance repair ticket status (`PENDING` → `IN_PROGRESS` → `COMPLETED`), and ability to upload official warranty PDFs.
- **User Role**: Strict data isolation and ownership enforcement. Users can register products, view/edit/delete only products tied to their user ID, raise repair tickets exclusively against their owned products, and access only their own user dashboard (`/api/dashboard/user/[id]`).
- **Public**: Device warranty status verification by serial number (`/api/products/serial/[serialNumber]`) is open so customers can check device warranty anytime.