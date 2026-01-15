/**
 * Custom hook for reports data.
 */
import { useState, useEffect, useCallback } from "react";
import { reportsAPI } from "../api/client";

export interface ReportSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  period_start?: string;
  period_end?: string;
}

export interface CategorySummary {
  category_id: number;
  category_name: string;
  category_type: "income" | "expense";
  total: number;
  percentage: number;
  transaction_count: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export function useReports(startDate?: string, endDate?: string) {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [incomeCategories, setIncomeCategories] = useState<CategorySummary[]>(
    []
  );
  const [expenseCategories, setExpenseCategories] = useState<CategorySummary[]>(
    []
  );
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryRes, categoryRes, trendsRes] = await Promise.all([
        reportsAPI.getSummary(startDate, endDate),
        reportsAPI.getByCategory(startDate, endDate),
        reportsAPI.getMonthlyTrends(12),
      ]);

      setSummary(summaryRes.data);
      setIncomeCategories(categoryRes.data.income_categories);
      setExpenseCategories(categoryRes.data.expense_categories);
      setMonthlyTrends(trendsRes.data.trends);
    } catch (err) {
      setError("Failed to fetch reports");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    summary,
    incomeCategories,
    expenseCategories,
    monthlyTrends,
    isLoading,
    error,
    refetch: fetchReports,
  };
}
