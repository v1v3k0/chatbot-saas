# P2P Lending Platform

A production-ready, full-stack Peer-to-Peer (P2P) Lending Platform built with Next.js 14, Supabase, and TypeScript. This platform enables users to register as Borrowers or Lenders and facilitates secure loan transactions with automated interest calculations, credit scoring, and comprehensive dashboards.

## 🚀 Features

### Core Functionality
- **🔐 Authentication & Authorization**: Secure email/password authentication with role-based access (Borrower/Lender)
- **💰 Loan Management**: Create, fund, and track loans with automated status updates
- **📊 Interest Calculations**: Dynamic interest calculation with early/late payment handling
- **🎯 Credit Scoring**: Automated credit score calculation based on repayment history
- **📱 Real-time Updates**: Live notifications and status updates using Supabase real-time
- **📈 Comprehensive Dashboards**: Role-specific dashboards with financial overviews
- **🔒 Security**: Row Level Security (RLS), input validation, and secure API endpoints

### Advanced Features
- **📧 Notifications System**: Email and in-app notifications for important events
- **📄 PDF Generation**: Download loan summaries and statements
- **🎨 Mobile Responsive**: Beautiful, responsive design that works on all devices
- **⚡ Performance Optimized**: Optimized queries, caching, and lazy loading
- **🔄 Automated Workflows**: Edge Functions for overdue loan processing and payment reminders

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for data fetching
- **React Hook Form** with Zod validation

### Backend
- **Supabase** (PostgreSQL, Auth, Real-time, Storage)
- **Supabase Edge Functions** for serverless functions
- **Row Level Security (RLS)** for data protection
- **PostgreSQL Triggers** for automated updates

### Development & Deployment
- **TypeScript** for type safety
- **ESLint** for code quality
- **Jest** for testing
- **GitHub Actions** for CI/CD
- **Vercel** for frontend hosting
- **Supabase** for backend hosting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Supabase CLI** (for local development)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/p2p-lending-platform.git
cd p2p-lending-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=P2P Lending Platform

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Security
JWT_SECRET=your_jwt_secret_key_here
ENCRYPTION_KEY=your_encryption_key_here
```

### 4. Set Up Supabase Database

#### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Initialize Supabase**:
   ```bash
   supabase init
   ```

3. **Start local Supabase**:
   ```bash
   supabase start
   ```

4. **Run database migrations**:
   ```bash
   supabase db push
   ```

#### Option B: Using Supabase Dashboard

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Execute the SQL to create all tables, indexes, and policies

### 5. Deploy Edge Functions

```bash
supabase functions deploy
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗄️ Database Schema

The application uses the following main tables:

### Core Tables
- **`users`**: User profiles with roles (borrower/lender)
- **`loan_requests`**: Loan applications with status tracking
- **`loan_fundings`**: Funding records for loans
- **`repayments`**: Payment records with interest calculations
- **`transactions`**: Financial transaction history
- **`notifications`**: User notifications
- **`credit_scores`**: Credit score tracking

### Key Features
- **Row Level Security (RLS)**: Ensures users can only access their own data
- **Automated Triggers**: Updates loan status and user totals automatically
- **Optimized Indexes**: Fast queries for large datasets
- **Views**: Pre-built queries for common operations

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual component and function tests
- **Integration Tests**: API route and database interaction tests
- **E2E Tests**: Full user workflow tests

## 🚀 Deployment

### Automated Deployment (Recommended)

The project includes GitHub Actions for automated deployment:

1. **Set up GitHub Secrets**:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ACCESS_TOKEN`
   - `SUPABASE_PROJECT_REF`

2. **Push to main branch**:
   ```bash
   git push origin main
   ```

The GitHub Actions workflow will automatically:
- Run tests
- Build the application
- Deploy to Vercel (frontend)
- Deploy to Supabase (backend)

### Manual Deployment

#### Deploy Frontend to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

#### Deploy Backend to Supabase

1. **Deploy database**:
   ```bash
   supabase db push
   ```

2. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy
   ```

### Using Deployment Script

The project includes a comprehensive deployment script:

```bash
# Deploy everything
npm run deploy

# Deploy only backend
npm run deploy:backend

# Deploy only frontend
npm run deploy:frontend

# Build only
npm run deploy:build
```

## 🔧 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Testing
```bash
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Database
```bash
npm run db:migrate   # Deploy database migrations
npm run db:reset     # Reset database
npm run studio       # Open Supabase Studio
```

### Supabase
```bash
npm run supabase:start  # Start local Supabase
npm run supabase:stop   # Stop local Supabase
npm run functions:deploy # Deploy Edge Functions
```

## 📁 Project Structure

```
p2p-lending-platform/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── landing/          # Landing page components
│   └── loans/            # Loan-related components
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client
│   ├── store.ts          # Zustand stores
│   └── validations.ts    # Zod schemas
├── supabase/             # Supabase configuration
│   ├── functions/        # Edge Functions
│   ├── migrations/       # Database migrations
│   └── config.toml       # Supabase config
├── types/                # TypeScript types
├── utils/                # Utility functions
├── scripts/              # Deployment scripts
└── tests/                # Test files
```

## 🔒 Security Features

### Authentication & Authorization
- **JWT-based authentication** with Supabase Auth
- **Role-based access control** (Borrower/Lender)
- **Session management** with automatic token refresh
- **Password validation** and secure storage

### Data Protection
- **Row Level Security (RLS)** policies on all tables
- **Input validation** with Zod schemas
- **SQL injection prevention** with parameterized queries
- **CORS protection** and security headers

### API Security
- **Rate limiting** on API endpoints
- **Request validation** and sanitization
- **Error handling** without sensitive data exposure
- **HTTPS enforcement** in production

## 📊 Monitoring & Analytics

### Built-in Monitoring
- **Error tracking** with detailed logging
- **Performance monitoring** for API endpoints
- **Database query optimization** with indexes
- **Real-time user activity** tracking

### Analytics Integration
- **User behavior tracking** (optional)
- **Financial metrics** and reporting
- **Loan performance** analytics
- **Credit score trends** analysis

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

### Common Issues

#### Database Connection Issues
```bash
# Check Supabase status
supabase status

# Restart Supabase
supabase stop && supabase start
```

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules && npm install
```

#### Environment Variables
Make sure all required environment variables are set in `.env.local` and your deployment platform.

## 🚀 Production Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured
- [ ] Database migrations are applied
- [ ] Edge Functions are deployed
- [ ] SSL certificates are configured
- [ ] Monitoring is set up
- [ ] Backup strategy is in place
- [ ] Security policies are reviewed
- [ ] Performance testing is completed

## 🔮 Future Roadmap

### Planned Features
- **Mobile App**: React Native application
- **Advanced Analytics**: Machine learning for risk assessment
- **Payment Integration**: Stripe/Razorpay integration
- **Multi-language Support**: Internationalization
- **Advanced Notifications**: Push notifications and SMS
- **API Documentation**: OpenAPI/Swagger documentation

### Performance Improvements
- **Caching Strategy**: Redis integration for better performance
- **CDN Integration**: Global content delivery
- **Database Optimization**: Advanced indexing and query optimization
- **Image Optimization**: Automatic image compression and optimization

---

**Built with ❤️ using Next.js, Supabase, and TypeScript**