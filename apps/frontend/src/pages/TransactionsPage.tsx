import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { useTransactions, type Transaction } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import { TransactionList } from "../components/TransactionList";
import { TransactionForm } from "../components/TransactionForm";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<"income" | "expense" | "">("");

  const {
    transactions,
    total,
    pages,
    isLoading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions({
    page,
    perPage: 10,
    type: typeFilter || undefined,
  });

  const { categories } = useCategories();

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      await deleteTransaction(deletingId);
      setDeletingId(null);
    }
  };

  const handleSubmit = async (data: {
    amount: number;
    description?: string;
    date: string;
    category_id: number;
  }) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await createTransaction(data);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            {total} total transactions
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-5 h-5" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <div className="flex gap-2">
              <Button
                onClick={() => setTypeFilter("")}
                variant={typeFilter === "" ? "default" : "ghost"}
                size="sm"
              >
                All
              </Button>
              <Button
                onClick={() => setTypeFilter("income")}
                variant={typeFilter === "income" ? "default" : "ghost"}
                size="sm"
                className={typeFilter === "income" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
              >
                Income
              </Button>
              <Button
                onClick={() => setTypeFilter("expense")}
                variant={typeFilter === "expense" ? "default" : "ghost"}
                size="sm"
                className={typeFilter === "expense" ? "bg-rose-500 hover:bg-rose-600" : ""}
              >
                Expense
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-muted-foreground px-4">
            Page {page} of {pages}
          </span>
          <Button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          categories={categories}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
          initialData={
            editingTransaction
              ? {
                  amount: editingTransaction.amount,
                  description: editingTransaction.description || undefined,
                  date: editingTransaction.date,
                  category_id: editingTransaction.category_id,
                }
              : undefined
          }
          isEdit={!!editingTransaction}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        isDestructive
      />
    </div>
  );
}
