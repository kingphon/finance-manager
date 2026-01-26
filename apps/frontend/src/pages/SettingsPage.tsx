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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
    <div className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-accent transition-colors group">
      <div className="flex items-center gap-3">
        <Tag className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">{category.name}</span>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => handleEditClick(category)}
          title="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => handleDeleteClick(category)}
          className="hover:text-destructive"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your categories and preferences
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="w-5 h-5" />
          Add Category
        </Button>
      </div>

      {/* Currency Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Display Currency</CardTitle>
              <CardDescription>
                Choose how amounts are displayed (display only, no conversion)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  }`}
                >
                  <span className="text-2xl font-bold">{config.symbol}</span>
                  <div className="text-left">
                    <div className="font-semibold">{code}</div>
                    <div className="text-xs text-muted-foreground">
                      {code === "USD" ? "US Dollar" : "Vietnamese Dong"}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-primary ml-2" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="p-3 rounded-lg bg-background text-sm">
            <span className="text-muted-foreground">Preview: </span>
            <span className="font-medium">{formatAmount(1234567.89)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Categories Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories Box */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>
                  {expenseCategories.length} categories
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : expenseCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
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
          </CardContent>
        </Card>

        {/* Income Categories Box */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle>Income Categories</CardTitle>
                <CardDescription>
                  {incomeCategories.length} categories
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : incomeCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
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
          </CardContent>
        </Card>
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
