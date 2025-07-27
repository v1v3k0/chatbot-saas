# P2P Lending Platform

A production-ready, full-stack Peer-to-Peer (P2P) lending platform built with Next.js, Supabase, and TypeScript. This platform enables users to register as borrowers or lenders, create loan requests, fund loans, and manage repayments with comprehensive financial calculations and security features.

## 🚀 Features

### Core Functionalities
- **Authentication & Authorization**: Secure email/password signup/login with Supabase Auth
- **Role-based Access**: Borrower or Lender roles with appropriate permissions
- **Loan Management**: Create, fund, and track loans with real-time status updates
- **Repayment System**: Automated interest calculations and payment tracking
- **Credit Scoring**: Dynamic credit score calculation based on repayment history
- **Notifications**: Real-time alerts for payments, funding, and important events
- **Mobile Responsive**: Optimized for all device sizes

### Advanced Features
- **Interest Calculations**: Dynamic interest calculation with early/late payment handling
- **Risk Assessment**: Automated risk level calculation for loan requests
- **Portfolio Management**: Comprehensive dashboard for lenders and borrowers
- **Transaction History**: Complete audit trail of all financial transactions
- **PDF Generation**: Download loan summaries and statements
- **Real-time Updates**: Live updates using Supabase real-time subscriptions

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Functions, Storage)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **PDF Generation**: jsPDF, html2canvas
- **Deployment**: Vercel (Frontend), Supabase (Backend)

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account and project
- Git installed

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd p2p-lending-platform
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

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

# Optional: Stripe Configuration (for future payment integration)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret

# Security
JWT_SECRET=your_jwt_secret_key_here
ENCRYPTION_KEY=your_encryption_key_here
```

### 4. Set Up Supabase Database

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from the API settings
3. Update your `.env.local` file with these values

#### Run Database Migrations
Execute the following SQL in your Supabase SQL editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('borrower', 'lender')) NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    credit_score INTEGER DEFAULT 650,
    total_borrowed DECIMAL(12,2) DEFAULT 0,
    total_lent DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loan_requests table
CREATE TABLE loan_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    borrower_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    principal_amount DECIMAL(12,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT CHECK (status IN ('open', 'partially_funded', 'fully_funded', 'settled', 'overdue', 'cancelled')) DEFAULT 'open',
    funded_amount DECIMAL(12,2) DEFAULT 0,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT NOT NULL,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loan_fundings table
CREATE TABLE loan_fundings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    loan_request_id UUID REFERENCES loan_requests(id) ON DELETE CASCADE NOT NULL,
    lender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create repayments table
CREATE TABLE repayments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    loan_request_id UUID REFERENCES loan_requests(id) ON DELETE CASCADE NOT NULL,
    borrower_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    principal_amount DECIMAL(12,2) NOT NULL,
    interest_amount DECIMAL(12,2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'overdue')) DEFAULT 'pending',
    installment_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('funding', 'repayment', 'interest_payment', 'fee')) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    reference_id UUID NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_scores table
CREATE TABLE credit_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    factors JSONB NOT NULL,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_loan_requests_borrower_id ON loan_requests(borrower_id);
CREATE INDEX idx_loan_requests_status ON loan_requests(status);
CREATE INDEX idx_loan_fundings_loan_request_id ON loan_fundings(loan_request_id);
CREATE INDEX idx_loan_fundings_lender_id ON loan_fundings(lender_id);
CREATE INDEX idx_repayments_loan_request_id ON repayments(loan_request_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_credit_scores_user_id ON credit_scores(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_fundings ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Loan requests policies
CREATE POLICY "Anyone can view open loan requests" ON loan_requests
    FOR SELECT USING (status IN ('open', 'partially_funded'));

CREATE POLICY "Borrowers can view own loan requests" ON loan_requests
    FOR SELECT USING (borrower_id = auth.uid());

CREATE POLICY "Borrowers can create loan requests" ON loan_requests
    FOR INSERT WITH CHECK (borrower_id = auth.uid());

CREATE POLICY "Borrowers can update own loan requests" ON loan_requests
    FOR UPDATE USING (borrower_id = auth.uid());

-- Add more policies as needed...
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🏗️ Project Structure

```
p2p-lending-platform/
├── app/                    # Next.js app directory
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
│   ├── store.ts          # Zustand store
│   └── validations.ts    # Zod schemas
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**: Push your code to a GitHub repository

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Environment Variables in Vercel**:
   - Add all variables from your `.env.local` file
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel domain

### Deploy to Supabase

1. **Database**: Your Supabase database is already deployed
2. **Edge Functions**: Deploy any edge functions to Supabase
3. **Storage**: Configure storage buckets if needed

### Production Checklist

- [ ] Set up custom domain
- [ ] Configure SSL certificates
- [ ] Set up monitoring and analytics
- [ ] Configure backup strategies
- [ ] Set up CI/CD pipelines
- [ ] Test all features thoroughly
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure email service for notifications

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level security policies
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive form validation with Zod
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: Built-in Next.js protection
- **Rate Limiting**: API rate limiting (implement as needed)

## 📊 Monitoring & Analytics

### Recommended Tools
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics, Mixpanel
- **Performance**: Vercel Analytics
- **Uptime**: UptimeRobot, Pingdom
- **Logs**: Supabase Logs, Vercel Logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact support at support@p2plending.com

## 🔮 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered risk assessment
- [ ] Integration with traditional banks
- [ ] Cryptocurrency support
- [ ] International expansion
- [ ] Advanced portfolio management tools
- [ ] Social lending features

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Note**: This is a production-ready application but should be thoroughly tested and customized for your specific use case before deploying to production. Always follow security best practices and comply with local financial regulations.