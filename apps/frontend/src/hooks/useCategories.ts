/**
 * Custom hook for categories data management.
 */
import { useState, useEffect, useCallback } from "react";
import { categoriesAPI } from "../api/client";

export interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
  user_id: number;
  created_at: string;
}

export function useCategories(type?: "income" | "expense") {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await categoriesAPI.list(type);
      setCategories(response.data);
    } catch (err) {
      setError("Failed to fetch categories");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (
    name: string,
    categoryType: "income" | "expense"
  ) => {
    const response = await categoriesAPI.create(name, categoryType);
    await fetchCategories();
    return response.data;
  };

  const deleteCategory = async (id: number) => {
    await categoriesAPI.delete(id);
    await fetchCategories();
  };

  const updateCategory = async (
    id: number,
    name: string,
    categoryType?: "income" | "expense"
  ) => {
    const response = await categoriesAPI.update(id, name, categoryType);
    await fetchCategories();
    return response.data;
  };

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
