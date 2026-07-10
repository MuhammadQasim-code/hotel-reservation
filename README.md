# Hotel Reservation System (Lumina Hotels)

A responsive, production-ready, full-stack Hotel Reservation System styled with the **Luxe Reserve** premium design guidelines. Built with React.js, Node.js/Express, MySQL (Amazon RDS), and AWS integration (S3, KMS, CloudWatch, ALB, ASG) orchestrated by Terraform and HashiCorp Packer.

## Technology Stack
* **Frontend:** React.js, React Router DOM, Axios, Tailwind CSS, React Hook Form
* **Backend:** Node.js, Express.js
* **Database:** MySQL (Amazon RDS)
* **Auth:** JWT Authentication, bcrypt Password Hashing
* **Storage:** Amazon S3 (Hotel Images)
* **Infrastructure:** HashiCorp Packer (Ubuntu 22.04, Nginx, PM2), Terraform (VPC, ASG, ALB, RDS, S3, KMS, CloudWatch)
* **CI/CD:** GitHub Actions

---

## Clean Architecture Directory Structure

```
├── .github/workflows/
│   └── deploy.yml              # CI/CD automation pipeline
├── backend/
│   ├── config/
│   │   ├── db.js               # Database pool connection
│   │   └── s3.js               # S3 Client instantiation
│   ├── controllers/            # Controller endpoints handlers
│   ├── middleware/             # Auth checks and error boundary middleware
│   ├── models/                 # DB queries using parameterized SQL
│   ├── routes/                 # REST endpoints routing
│   ├── scripts/
│   │   └── db-seed.js          # Database seeding script
│   ├── services/
│   │   └── s3Service.js        # File upload adapter (S3 / Local storage fallback)
│   ├── utils/
│   │   └── appError.js         # Custom HTTP error class
│   ├── app.js                  # Express app and middle-tier bindings
│   ├── server.js               # App entrypoint (port listener)
│   └── .env.example            # Backend environmental variables template
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authorization context provider
│   │   ├── hooks/
│   │   ├── layouts/
│   │   │   ├── Navbar.jsx      # Top responsive navigation
│   │   │   └── Sidebar.jsx     # Side admin/guest navigation
│   │   ├── pages/              # Portal pages (Auth, Browse, Bookings, Dashboards)
│   │   ├── services/
│   │   │   └── api.js          # Axios configured with interceptors
│   │   ├── utils/
│   │   ├── App.jsx             # Main Router structure
│   │   ├── index.css           # Styling inputs and tailwind directives
│   │   └── main.jsx            # React root mount
│   ├── index.html              # Main HTML entrypoint
│   ├── postcss.config.js       # PostCSS options
│   ├── tailwind.config.js      # Custom theme colors (Luxe Reserve tokens)
│   └── vite.config.js          # Vite config (proxy to backend port 5000)
├── packer/
│   ├── packer.pkr.hcl          # AMI build configurations
│   └── setup.sh                # VM installation and systemd shell script
├── terraform/
│   ├── main.tf                 # AWS resource definitions
│   ├── variables.tf            # IaC inputs
│   └── outputs.tf              # IaC outputs
└── schema.sql                  # Main MySQL SQL Schema
```

---

## API Endpoints Documentation

### 1. Authentication
* `POST /api/auth/signup` - Register user. Body: `fullName`, `email`, `phoneNumber`, `password`, `confirmPassword`.
* `POST /api/auth/login` - Authenticate user. Body: `email`, `password`.
* `GET /api/auth/profile` - Retrieve current user details (JWT required).
* `PUT /api/auth/profile` - Update current user contact details (JWT required). Body: `fullName`, `email`, `phoneNumber`.

### 2. Hotels Catalog
* `GET /api/hotels` - Retrieve all hotels. Query params: `search`, `city`.
* `GET /api/hotels/:id` - Retrieve specific hotel by ID.
* `POST /api/hotels` - Create hotel (Admin only). Multipart Form: `hotelName`, `city`, `address`, `description`, `pricePerNight`, `maximumCapacity`, `amenities`, and file `image`.
* `PUT /api/hotels/:id` - Update hotel (Admin only). Multipart Form (Optional fields).
* `DELETE /api/hotels/:id` - Delete hotel from database (Admin only).

### 3. Stays & Reservations
* `POST /api/reservations` - Create booking stay (JWT required). Body: `hotelId`, `customerName`, `phoneNumber`, `reservationDate` (validate: not in past), `reservationDay`, `numberOfPersons` (validate: <= capacity), `mealPreference`, `stayType`, `specialNotes`.
* `GET /api/reservations` - Retrieve bookings (JWT required. Returns personal stays for Guests, and all stays for Admin).
* `GET /api/reservations/:id` - Retrieve detailed reservation status (JWT required. Owner check applies).
* `PUT /api/reservations/:id` - Update booking details (JWT required. Stays can be updated only when status is `Pending`).
* `DELETE /api/reservations/:id` - Cancel booking stay (JWT required. Stays can be cancelled only when status is `Pending`).
* `PATCH /api/reservations/:id/status` - Update reservation status (Admin only). Body: `status` ('Approved', 'Rejected', 'Completed').

### 4. Admin Users Management
* `GET /api/users` - Retrieve list of users (Admin only).
* `DELETE /api/users/:id` - Delete user account (Admin only).
* `GET /api/reservations/admin/stats` - Consolidated metrics count for dashboard panels (Admin only).

### 5. Diagnostics
* `GET /health` - Stateless service health diagnostics (Unprotected).

---

## Local Development Setup Guide

### Prerequisites
1. **Node.js** (v18 or v20).
2. **MySQL Server** installed locally.

### Steps
1. **Initialize Database:**
   * Log into MySQL CLI:
     ```sql
     CREATE DATABASE hotel_reservation;
     ```
   * Import the schema:
     ```bash
     mysql -u root -p hotel_reservation < schema.sql
     ```

2. **Configure Backend:**
   * Go to backend directory and copy env configuration:
     ```bash
     cd backend
     cp .env.example .env
     ```
   * Set your local MySQL password and choose a random `JWT_SECRET` string. Leave S3 variables blank to enable local storage uploads.
   * Install dependencies and run seeding script to insert default users and mock hotels:
     ```bash
     npm install
     npm run seed
     ```
   * Start dev server (defaults to port 5000):
     ```bash
     npm run dev
     ```

3. **Configure Frontend:**
   * Go to frontend directory, install dependencies:
     ```bash
     cd ../frontend
     npm install
     ```
   * Start React Vite dev server (runs on port 3000):
     ```bash
     npm run dev
     ```
   * Log in using seeded default accounts:
     * **Admin User:** `admin@lumina.com` (password: `password123`)
     * **Standard Guest:** `alex@luxury.com` (password: `password123`)

---

## Production Deployment & CI/CD Pipeline

To deploy the application to AWS using the automated pipeline:

1. **AWS & GitHub Setup:**
   * Create an IAM User on AWS with `AdministratorAccess` and generate Access Keys.
   * Add the following **Repository Secrets** to your GitHub repository settings:
     * `AWS_ACCESS_KEY_ID`: AWS Access Key.
     * `AWS_SECRET_ACCESS_KEY`: AWS Secret Access Key.
     * `AWS_REGION`: target region (e.g. `us-east-1`).
     * `DB_PASSWORD`: master database password for Amazon RDS MySQL.
     * `JWT_SECRET`: jwt signature token.

2. **Run Deployment:**
   * Push code changes to the `main` branch:
     ```bash
     git add .
     git commit -m "feat: complete application release"
     git push origin main
     ```
   * GitHub Actions will run automatically, build the frontend React bundle, trigger Packer to compile the AMI containing PM2 and Nginx reverse proxies, and execute Terraform to spin up VPC subnets, RDS instance, S3 bucket, ALB, and Auto Scaling groups referencing the custom AMI.
