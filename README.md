# Arizon - Backend API

Welcome to the Arizon Backend API project. This is a robust and scalable backend system built with Next.js, designed to power an e-commerce and inventory management platform.

## Features

- **Modern Tech Stack**: Built with Next.js 15 (App Router) and TypeScript.
- **Database ORM**: Uses Prisma with a PostgreSQL database for type-safe database access.
- **Comprehensive API**: Full CRUD (Create, Read, Update, Delete) endpoints for all core business models:
  - Products & Product Categories
  - Orders & Order Items
  - Warehouses & Stock Management
  - Deliveries & Approvisionnements (Supply Orders)
- **Authentication**: Secure, JWT-based authentication system for managing user sessions.
- **Role-Based Access Control (RBAC)**: Granular permission system with 7 default roles (`ADMIN`, `BUSINESS`, `CLIENT`, `SUPPLIER`, `STOCK_MANAGER`, `COMMAND_MANAGER`, `DELIVERY_DRIVER`).
- **Image Uploads**: Integrated with Cloudinary for handling image uploads for products and user profiles.
- **Database Seeding**: Includes a comprehensive script to seed the database with realistic sample data for easy testing and development.
- **Input Validation**: Uses Zod for validating API request bodies and parameters.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Image Storage**: [Cloudinary](https://cloudinary.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/)

---

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en) (v20.x or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A running [PostgreSQL](https://www.postgresql.org/download/) database instance.

### 2. Clone the Repository

```bash
git clone <your-repository-url>
cd arizon
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

Create a `.env` file in the root of the project by copying the example below. **Do not commit this file to version control.**

```env
# .env

# PostgreSQL Database Connection
# Example: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:admin@localhost:5432/arizon"

# JWT Secret for signing authentication tokens
# Generate a secure, random string (e.g., using `openssl rand -hex 32`)
JWT_SECRET="your-super-secret-jwt-key"

# Cloudinary Credentials for Image Uploads
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Firebase Credentials
# Client-side config (ensure these are prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_auth_domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your_measurement_id"

# Server-side admin config (Service Account JSON)
# Paste the entire content of your Firebase service account JSON file here as a single-line string.
FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", ...}'
```

### 5. Run Database Migrations

Apply the database schema to your PostgreSQL instance using Prisma Migrate.

```bash
npx prisma migrate dev
```

### 6. Seed the Database (Optional)

To populate the database with sample data for testing, run the seed script.

```bash
npm run seed
```

### 7. Run the Development Server

Start the Next.js development server.

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev`: Starts the development server with Turbopack.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run seed`: Seeds the database with sample data.


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
