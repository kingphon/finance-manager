// Shared types for Finance Manager

export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
  user_id: number;
}

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  category_id: number;
  category?: Category;
  user_id: number;
  created_at: string;
}

export interface ReportSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  period_start: string;
  period_end: string;
}

export interface CategorySummary {
  category_id: number;
  category_name: string;
  total: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export type TransactionType = "income" | "expense";
