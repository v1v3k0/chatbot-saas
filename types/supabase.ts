export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'borrower' | 'lender'
          first_name: string
          last_name: string
          phone: string | null
          avatar_url: string | null
          credit_score: number | null
          total_borrowed: number
          total_lent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'borrower' | 'lender'
          first_name: string
          last_name: string
          phone?: string | null
          avatar_url?: string | null
          credit_score?: number | null
          total_borrowed?: number
          total_lent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'borrower' | 'lender'
          first_name?: string
          last_name?: string
          phone?: string | null
          avatar_url?: string | null
          credit_score?: number | null
          total_borrowed?: number
          total_lent?: number
          created_at?: string
          updated_at?: string
        }
      }
      loan_requests: {
        Row: {
          id: string
          borrower_id: string
          title: string
          description: string
          principal_amount: number
          interest_rate: number
          duration_days: number
          purpose: string
          status: 'open' | 'partially_funded' | 'fully_funded' | 'settled' | 'overdue' | 'cancelled'
          funded_amount: number
          created_at: string
          updated_at: string
          due_date: string
          category: string
          risk_level: 'low' | 'medium' | 'high'
        }
        Insert: {
          id?: string
          borrower_id: string
          title: string
          description: string
          principal_amount: number
          interest_rate: number
          duration_days: number
          purpose: string
          status?: 'open' | 'partially_funded' | 'fully_funded' | 'settled' | 'overdue' | 'cancelled'
          funded_amount?: number
          created_at?: string
          updated_at?: string
          due_date: string
          category: string
          risk_level?: 'low' | 'medium' | 'high'
        }
        Update: {
          id?: string
          borrower_id?: string
          title?: string
          description?: string
          principal_amount?: number
          interest_rate?: number
          duration_days?: number
          purpose?: string
          status?: 'open' | 'partially_funded' | 'fully_funded' | 'settled' | 'overdue' | 'cancelled'
          funded_amount?: number
          created_at?: string
          updated_at?: string
          due_date?: string
          category?: string
          risk_level?: 'low' | 'medium' | 'high'
        }
      }
      loan_fundings: {
        Row: {
          id: string
          loan_request_id: string
          lender_id: string
          amount: number
          created_at: string
          status: 'pending' | 'completed' | 'cancelled'
        }
        Insert: {
          id?: string
          loan_request_id: string
          lender_id: string
          amount: number
          created_at?: string
          status?: 'pending' | 'completed' | 'cancelled'
        }
        Update: {
          id?: string
          loan_request_id?: string
          lender_id?: string
          amount?: number
          created_at?: string
          status?: 'pending' | 'completed' | 'cancelled'
        }
      }
      repayments: {
        Row: {
          id: string
          loan_request_id: string
          borrower_id: string
          amount: number
          principal_amount: number
          interest_amount: number
          payment_date: string
          due_date: string
          status: 'pending' | 'completed' | 'overdue'
          created_at: string
          installment_number: number
        }
        Insert: {
          id?: string
          loan_request_id: string
          borrower_id: string
          amount: number
          principal_amount: number
          interest_amount: number
          payment_date: string
          due_date: string
          status?: 'pending' | 'completed' | 'overdue'
          created_at?: string
          installment_number: number
        }
        Update: {
          id?: string
          loan_request_id?: string
          borrower_id?: string
          amount?: number
          principal_amount?: number
          interest_amount?: number
          payment_date?: string
          due_date?: string
          status?: 'pending' | 'completed' | 'overdue'
          created_at?: string
          installment_number?: number
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'funding' | 'repayment' | 'interest_payment' | 'fee'
          amount: number
          description: string
          reference_id: string
          status: 'pending' | 'completed' | 'failed'
          created_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          type: 'funding' | 'repayment' | 'interest_payment' | 'fee'
          amount: number
          description: string
          reference_id: string
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'funding' | 'repayment' | 'interest_payment' | 'fee'
          amount?: number
          description?: string
          reference_id?: string
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
          metadata?: Json
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          read: boolean
          created_at: string
          action_url: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          created_at?: string
          action_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          created_at?: string
          action_url?: string | null
        }
      }
      credit_scores: {
        Row: {
          id: string
          user_id: string
          score: number
          factors: Json
          last_calculated: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          factors: Json
          last_calculated?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          factors?: Json
          last_calculated?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for better developer experience
export type User = Database['public']['Tables']['users']['Row']
export type LoanRequest = Database['public']['Tables']['loan_requests']['Row']
export type LoanFunding = Database['public']['Tables']['loan_fundings']['Row']
export type Repayment = Database['public']['Tables']['repayments']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type CreditScore = Database['public']['Tables']['credit_scores']['Row']

export type UserRole = 'borrower' | 'lender'
export type LoanStatus = 'open' | 'partially_funded' | 'fully_funded' | 'settled' | 'overdue' | 'cancelled'
export type TransactionType = 'funding' | 'repayment' | 'interest_payment' | 'fee'
export type RiskLevel = 'low' | 'medium' | 'high'