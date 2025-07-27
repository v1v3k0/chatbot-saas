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
    description TEXT,
    principal_amount DECIMAL(12,2) NOT NULL CHECK (principal_amount > 0),
    interest_rate DECIMAL(5,2) NOT NULL CHECK (interest_rate >= 0 AND interest_rate <= 100),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    purpose TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'partially_funded', 'fully_funded', 'settled', 'overdue', 'cancelled')),
    funded_amount DECIMAL(12,2) DEFAULT 0,
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loan_fundings table
CREATE TABLE loan_fundings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    loan_request_id UUID REFERENCES loan_requests(id) ON DELETE CASCADE NOT NULL,
    lender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(loan_request_id, lender_id)
);

-- Create repayments table
CREATE TABLE repayments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    loan_request_id UUID REFERENCES loan_requests(id) ON DELETE CASCADE NOT NULL,
    borrower_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    principal_amount DECIMAL(12,2) NOT NULL CHECK (principal_amount > 0),
    interest_amount DECIMAL(12,2) NOT NULL CHECK (interest_amount >= 0),
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    installment_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('funding', 'repayment', 'withdrawal', 'deposit')),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    reference_id UUID,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_scores table
CREATE TABLE credit_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    score INTEGER NOT NULL CHECK (score >= 300 AND score <= 850),
    factors JSONB DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_loan_requests_borrower_id ON loan_requests(borrower_id);
CREATE INDEX idx_loan_requests_status ON loan_requests(status);
CREATE INDEX idx_loan_requests_category ON loan_requests(category);
CREATE INDEX idx_loan_requests_risk_level ON loan_requests(risk_level);
CREATE INDEX idx_loan_requests_created_at ON loan_requests(created_at DESC);
CREATE INDEX idx_loan_requests_due_date ON loan_requests(due_date);

CREATE INDEX idx_loan_fundings_loan_request_id ON loan_fundings(loan_request_id);
CREATE INDEX idx_loan_fundings_lender_id ON loan_fundings(lender_id);
CREATE INDEX idx_loan_fundings_status ON loan_fundings(status);

CREATE INDEX idx_repayments_loan_request_id ON repayments(loan_request_id);
CREATE INDEX idx_repayments_borrower_id ON repayments(borrower_id);
CREATE INDEX idx_repayments_status ON repayments(status);
CREATE INDEX idx_repayments_payment_date ON repayments(payment_date);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_credit_scores_user_id ON credit_scores(user_id);
CREATE INDEX idx_credit_scores_score ON credit_scores(score);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_fundings ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for loan_requests table
CREATE POLICY "Anyone can view open loan requests" ON loan_requests FOR SELECT USING (status IN ('open', 'partially_funded'));
CREATE POLICY "Borrowers can view own loan requests" ON loan_requests FOR SELECT USING (borrower_id = auth.uid());
CREATE POLICY "Borrowers can create loan requests" ON loan_requests FOR INSERT WITH CHECK (borrower_id = auth.uid());
CREATE POLICY "Borrowers can update own loan requests" ON loan_requests FOR UPDATE USING (borrower_id = auth.uid());
CREATE POLICY "Borrowers can delete own loan requests" ON loan_requests FOR DELETE USING (borrower_id = auth.uid() AND status = 'open');

-- Create RLS policies for loan_fundings table
CREATE POLICY "Lenders can view own fundings" ON loan_fundings FOR SELECT USING (lender_id = auth.uid());
CREATE POLICY "Borrowers can view fundings for their loans" ON loan_fundings FOR SELECT USING (
    loan_request_id IN (SELECT id FROM loan_requests WHERE borrower_id = auth.uid())
);
CREATE POLICY "Lenders can create fundings" ON loan_fundings FOR INSERT WITH CHECK (lender_id = auth.uid());

-- Create RLS policies for repayments table
CREATE POLICY "Borrowers can view own repayments" ON repayments FOR SELECT USING (borrower_id = auth.uid());
CREATE POLICY "Lenders can view repayments for funded loans" ON repayments FOR SELECT USING (
    loan_request_id IN (
        SELECT loan_request_id FROM loan_fundings WHERE lender_id = auth.uid()
    )
);
CREATE POLICY "Borrowers can create repayments" ON repayments FOR INSERT WITH CHECK (borrower_id = auth.uid());

-- Create RLS policies for transactions table
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own transactions" ON transactions FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for notifications table
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Create RLS policies for credit_scores table
CREATE POLICY "Users can view own credit score" ON credit_scores FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can manage credit scores" ON credit_scores FOR ALL USING (true);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_requests_updated_at BEFORE UPDATE ON loan_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_fundings_updated_at BEFORE UPDATE ON loan_fundings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repayments_updated_at BEFORE UPDATE ON repayments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update loan status when funding changes
CREATE OR REPLACE FUNCTION update_loan_status_on_funding()
RETURNS TRIGGER AS $$
BEGIN
    -- Update loan request funded amount and status
    UPDATE loan_requests 
    SET 
        funded_amount = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM loan_fundings 
            WHERE loan_request_id = NEW.loan_request_id 
            AND status = 'completed'
        ),
        status = CASE 
            WHEN (
                SELECT COALESCE(SUM(amount), 0) 
                FROM loan_fundings 
                WHERE loan_request_id = NEW.loan_request_id 
                AND status = 'completed'
            ) >= principal_amount THEN 'fully_funded'
            WHEN (
                SELECT COALESCE(SUM(amount), 0) 
                FROM loan_fundings 
                WHERE loan_request_id = NEW.loan_request_id 
                AND status = 'completed'
            ) > 0 THEN 'partially_funded'
            ELSE 'open'
        END,
        updated_at = NOW()
    WHERE id = NEW.loan_request_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for loan status updates
CREATE TRIGGER update_loan_status_on_funding_trigger
    AFTER INSERT OR UPDATE OR DELETE ON loan_fundings
    FOR EACH ROW EXECUTE FUNCTION update_loan_status_on_funding();

-- Create function to update user totals
CREATE OR REPLACE FUNCTION update_user_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update borrower's total borrowed
    IF TG_TABLE_NAME = 'loan_requests' THEN
        UPDATE users 
        SET total_borrowed = (
            SELECT COALESCE(SUM(principal_amount), 0)
            FROM loan_requests 
            WHERE borrower_id = NEW.borrower_id
        )
        WHERE id = NEW.borrower_id;
    END IF;
    
    -- Update lender's total lent
    IF TG_TABLE_NAME = 'loan_fundings' THEN
        UPDATE users 
        SET total_lent = (
            SELECT COALESCE(SUM(amount), 0)
            FROM loan_fundings 
            WHERE lender_id = NEW.lender_id
            AND status = 'completed'
        )
        WHERE id = NEW.lender_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for user totals updates
CREATE TRIGGER update_borrower_total_on_loan
    AFTER INSERT OR UPDATE OR DELETE ON loan_requests
    FOR EACH ROW EXECUTE FUNCTION update_user_totals();

CREATE TRIGGER update_lender_total_on_funding
    AFTER INSERT OR UPDATE OR DELETE ON loan_fundings
    FOR EACH ROW EXECUTE FUNCTION update_user_totals();

-- Create views for common queries
CREATE VIEW loan_summary AS
SELECT 
    lr.id,
    lr.title,
    lr.principal_amount,
    lr.interest_rate,
    lr.duration_days,
    lr.status,
    lr.funded_amount,
    lr.risk_level,
    lr.due_date,
    lr.created_at,
    u.first_name,
    u.last_name,
    u.credit_score,
    CASE 
        WHEN lr.funded_amount > 0 THEN (lr.funded_amount / lr.principal_amount) * 100
        ELSE 0
    END as funding_progress,
    CASE 
        WHEN lr.funded_amount >= lr.principal_amount THEN 'Fully Funded'
        WHEN lr.funded_amount > 0 THEN 'Partially Funded'
        ELSE 'Open'
    END as funding_status
FROM loan_requests lr
JOIN users u ON lr.borrower_id = u.id
WHERE lr.status IN ('open', 'partially_funded', 'fully_funded');

-- Create view for lender investments
CREATE VIEW lender_investments AS
SELECT 
    lf.id as funding_id,
    lf.amount as invested_amount,
    lf.created_at as funding_date,
    lr.id as loan_id,
    lr.title as loan_title,
    lr.principal_amount,
    lr.interest_rate,
    lr.duration_days,
    lr.status as loan_status,
    lr.due_date,
    u.first_name as borrower_first_name,
    u.last_name as borrower_last_name,
    u.credit_score as borrower_credit_score,
    (lf.amount * lr.interest_rate * lr.duration_days / 36500) as expected_interest
FROM loan_fundings lf
JOIN loan_requests lr ON lf.loan_request_id = lr.id
JOIN users u ON lr.borrower_id = u.id
WHERE lf.status = 'completed';

-- Create view for borrower loans
CREATE VIEW borrower_loans AS
SELECT 
    lr.id,
    lr.title,
    lr.principal_amount,
    lr.interest_rate,
    lr.duration_days,
    lr.status,
    lr.funded_amount,
    lr.risk_level,
    lr.due_date,
    lr.created_at,
    COALESCE(SUM(r.amount), 0) as total_repaid,
    COALESCE(COUNT(r.id), 0) as repayment_count,
    CASE 
        WHEN lr.funded_amount >= lr.principal_amount THEN 'Fully Funded'
        WHEN lr.funded_amount > 0 THEN 'Partially Funded'
        ELSE 'Open'
    END as funding_status
FROM loan_requests lr
LEFT JOIN repayments r ON lr.id = r.loan_request_id AND r.status = 'completed'
GROUP BY lr.id, lr.title, lr.principal_amount, lr.interest_rate, lr.duration_days, 
         lr.status, lr.funded_amount, lr.risk_level, lr.due_date, lr.created_at;