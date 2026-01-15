/**
 * Settings Page - Category management with full CRUD.
 * Shows expense and income categories in separate boxes.
 */
import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Coins,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useCategories, type Category } from "../hooks/useCategories";
import { CategoryForm } from "../components/CategoryForm";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import {
  useCurrency,
  CURRENCIES,
  type CurrencyCode,
} from "../context/CurrencyContext";

export function SettingsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );

  const { currency, setCurrency, formatAmount } = useCurrency();

  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    isLoading,
  } = useCategories();

  const handleAddClick = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
  };

  const handleConfirmDelete = async () => {
    if (deletingCategory) {
      await deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  const handleSubmit = async (data: {
    name: string;
    type: "income" | "expense";
  }) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data.name, data.type);
    } else {
      await createCategory(data.name, data.type);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Reusable category card component
  const CategoryCard = ({ category }: { category: Category }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-dark)] hover:bg-[var(--color-bg-hover)] transition-colors group">
      <div className="flex items-center gap-3">
        <Tag className="w-4 h-4 text-[var(--color-text-muted)]" />
        <span className="font-medium">{category.name}</span>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => handleEditClick(category)}
          className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          title="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleDeleteClick(category)}
          className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            Manage your categories and preferences
          </p>
        </div>
        <button onClick={handleAddClick} className="btn btn-primary">
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Currency Selector */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
            <Coins className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Display Currency</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Choose how amounts are displayed (display only, no conversion)
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
            const config = CURRENCIES[code];
            const isSelected = currency === code;
            return (
              <button
                key={code}
                onClick={() => setCurrency(code)}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-bg-hover)]"
                }`}
              >
                <span className="text-2xl font-bold">{config.symbol}</span>
                <div className="text-left">
                  <div className="font-semibold">{code}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {code === "USD" ? "US Dollar" : "Vietnamese Dong"}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] ml-2" />
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-bg-dark)] text-sm">
          <span className="text-[var(--color-text-muted)]">Preview: </span>
          <span className="font-medium">{formatAmount(1234567.89)}</span>
        </div>
      </div>

      {/* Categories Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories Box */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-expense)]/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-[var(--color-expense)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Expense Categories</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                {expenseCategories.length} categories
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-[var(--color-bg-hover)] rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : expenseCategories.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-muted)]">
              <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No expense categories yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {expenseCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>

        {/* Income Categories Box */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-income)]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[var(--color-income)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Income Categories</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                {incomeCategories.length} categories
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-[var(--color-bg-hover)] rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : incomeCategories.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-muted)]">
              <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No income categories yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {incomeCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
          initialData={
            editingCategory
              ? {
                  name: editingCategory.name,
                  type: editingCategory.type,
                }
              : undefined
          }
          isEdit={!!editingCategory}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? Transactions in this category will have their category removed.`}
        isDestructive
      />
    </div>
  );
}
