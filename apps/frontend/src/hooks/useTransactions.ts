/**
 * Custom hook for transactions data management.
 * Handles fetching, creating, updating, and deleting transactions.
 */
import { useState, useEffect, useCallback } from "react";
import { transactionsAPI } from "../api/client";

export interface Transaction {
  id: number;
  amount: number;
  description: string | null;
  date: string;
  category_id: number;
  user_id: number;
  created_at: string;
  category?: {
    id: number;
    name: string;
    type: "income" | "expense";
  };
}

interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

interface UseTransactionsOptions {
  page?: number;
  perPage?: number;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  type?: "income" | "expense";
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await transactionsAPI.list({
        page: options.page,
        per_page: options.perPage,
        category_id: options.categoryId,
        start_date: options.startDate,
        end_date: options.endDate,
        type: options.type,
      });
      const data: TransactionListResponse = response.data;
      setTransactions(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setError("Failed to fetch transactions");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [
    options.page,
    options.perPage,
    options.categoryId,
    options.startDate,
    options.endDate,
    options.type,
  ]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const createTransaction = async (data: {
    amount: number;
    description?: string;
    date: string;
    category_id: number;
  }) => {
    const response = await transactionsAPI.create(data);
    await fetchTransactions();
    return response.data;
  };

  const updateTransaction = async (
    id: number,
    data: {
      amount?: number;
      description?: string;
      date?: string;
      category_id?: number;
    }
  ) => {
    const response = await transactionsAPI.update(id, data);
    await fetchTransactions();
    return response.data;
  };

  const deleteTransaction = async (id: number) => {
    await transactionsAPI.delete(id);
    await fetchTransactions();
  };

  return {
    transactions,
    total,
    pages,
    isLoading,
    error,
    refetch: fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
