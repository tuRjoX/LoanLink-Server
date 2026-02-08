# LoanLink Server

Backend server for **LoanLink** - A comprehensive Microloan Request & Approval Tracker System.

## 🚀 Live API

**Live Server URL:** `https://loanlink-api.vercel.app/`

## 📋 Purpose

LoanLink Server provides RESTful API endpoints for managing microloans, user authentication, loan applications, and payment processing. It handles role-based access control for Admin, Manager, and Borrower roles.

## ✨ Key Features

- **Authentication & Authorization**
  - JWT-based authentication with HTTP-only cookies
  - Firebase Admin SDK integration
  - Role-based access control (Admin, Manager, Borrower)
- **User Management**
  - User registration with role selection
  - Profile management
  - User suspension with reason tracking
  - Admin-controlled role updates

- **Loan Management**
  - CRUD operations for loan products
  - Search and filter functionality
  - Show/hide loans on homepage
  - Manager-specific loan tracking

- **Application Processing**
  - Loan application submission
  - Status tracking (Pending, Approved, Rejected)
  - Application fee management
  - Manager approval workflow

- **Payment Integration**
  - Stripe payment gateway integration
  - Application fee payment ($10 fixed)
  - Payment history tracking
  - Transaction details storage

- **Dashboard Analytics**
  - Admin statistics
  - Manager performance metrics
  - Real-time data aggregation

## 🛠️ Tech Stack & NPM Packages

### Core Dependencies

- **express** (^4.18.2) - Fast, unopinionated web framework
- **mongodb** (^6.3.0) - MongoDB driver for Node.js
- **dotenv** (^16.3.1) - Environment variable management
- **cors** (^2.8.5) - Cross-Origin Resource Sharing middleware
- **jsonwebtoken** (^9.0.2) - JWT token generation and verification
- **cookie-parser** (^1.4.6) - HTTP cookie parsing middleware
- **stripe** (^14.10.0) - Payment processing integration
- **firebase-admin** (^12.0.0) - Firebase Admin SDK for authentication

### Dev Dependencies

- **nodemon** (^3.0.2) - Auto-restart during development

## 📁 Project Structure

```
LoanLink-Server/
├── index.js              # Main server file with all routes
├── package.json          # Project dependencies
├── .env                  # Environment variables (not in repo)
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Stripe account for payment processing
- Firebase project for authentication

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd LoanLink-Server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your credentials:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   DB_NAME=loanlink
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   CLIENT_URL=http://localhost:5173
   STRIPE_SECRET_KEY=your_stripe_secret_key
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_client_email
   ```

4. **Run the server**

   Development mode:

   ```bash
   npm run dev
   ```

   Production mode:

   ```bash
   npm start
   ```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/jwt` - Generate JWT token
- `POST /api/auth/logout` - Clear authentication cookie

### Users

- `POST /api/users` - Create new user
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:email` - Get user by email
- `PATCH /api/users/:id` - Update user role/status (Admin only)

### Loans

- `GET /api/loans` - Get all loans (with pagination)
- `GET /api/loans/:id` - Get single loan
- `POST /api/loans` - Create loan (Manager/Admin)
- `PATCH /api/loans/:id` - Update loan (Manager/Admin)
- `DELETE /api/loans/:id` - Delete loan (Manager/Admin)
- `GET /api/loans/manager/:email` - Get loans by creator

### Applications

- `POST /api/applications` - Submit loan application
- `GET /api/applications` - Get all applications (Admin)
- `GET /api/applications/pending` - Get pending applications (Manager)
- `GET /api/applications/approved` - Get approved applications (Manager)
- `GET /api/applications/user/:email` - Get user's applications
- `PATCH /api/applications/:id` - Update application status (Manager)
- `DELETE /api/applications/:id` - Cancel application (User)

### Payments

- `POST /api/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments` - Save payment record
- `GET /api/payments/application/:id` - Get payment by application ID

### Statistics

- `GET /api/stats/admin` - Admin dashboard stats
- `GET /api/stats/manager/:email` - Manager dashboard stats

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Role-Based Access Control**: Granular permission system
- **Environment Variables**: Sensitive data protection
- **CORS Configuration**: Restricted cross-origin access

## 🚀 Deployment

### Vercel Deployment (Recommended)

The server is configured for Vercel serverless deployment.

#### Steps to Deploy:

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:

   ```bash
   vercel
   ```

   Follow the prompts to link your project.

4. **Set Environment Variables in Vercel Dashboard**:
   - Go to your project settings → Environment Variables
   - Add all required variables:
     - `MONGODB_URI`
     - `DB_NAME`
     - `JWT_SECRET`
     - `CLIENT_URL` (your production frontend URL)
     - `STRIPE_SECRET_KEY`
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_PRIVATE_KEY`
     - `FIREBASE_CLIENT_EMAIL`
     - `NODE_ENV=production`

5. **Redeploy** after adding environment variables:
   ```bash
   vercel --prod
   ```

#### Vercel Configuration:

- The `vercel.json` file is already configured
- MongoDB connection is cached for serverless performance
- Server automatically detects Vercel environment

### Deployment Checklist

- [ ] Set `NODE_ENV=production` in environment variables
- [ ] Configure production MongoDB URI
- [ ] Add production client URL to CORS whitelist
- [ ] Set secure Stripe API keys
- [ ] Configure Firebase Admin SDK
- [ ] Enable HTTPS for production (automatic on Vercel)

### Other Recommended Platforms

- **Heroku** - Container-based hosting
- **Railway** - Modern deployment platform
- **Render** - Fully managed cloud

## 📝 Environment Variables

| Variable                | Description                | Required |
| ----------------------- | -------------------------- | -------- |
| `MONGODB_URI`           | MongoDB connection string  | ✅       |
| `DB_NAME`               | Database name              | ✅       |
| `JWT_SECRET`            | Secret key for JWT signing | ✅       |
| `PORT`                  | Server port number         | ✅       |
| `CLIENT_URL`            | Frontend application URL   | ✅       |
| `STRIPE_SECRET_KEY`     | Stripe API secret key      | ✅       |
| `FIREBASE_PROJECT_ID`   | Firebase project ID        | ✅       |
| `FIREBASE_PRIVATE_KEY`  | Firebase private key       | ✅       |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email      | ✅       |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For issues or questions, please open an issue on GitHub.

---
