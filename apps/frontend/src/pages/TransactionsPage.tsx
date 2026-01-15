import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { useTransactions, type Transaction } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import { TransactionList } from "../components/TransactionList";
import { TransactionForm } from "../components/TransactionForm";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

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
          <p className="text-[var(--color-text-muted)] mt-1">
            {total} total transactions
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-[var(--color-text-muted)]" />
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter("")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === ""
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter("income")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === "income"
                  ? "bg-[var(--color-income)] text-white"
                  : "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setTypeFilter("expense")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === "expense"
                  ? "bg-[var(--color-expense)] text-white"
                  : "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Expense
            </button>
          </div>
        </div>
      </div>

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
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="text-[var(--color-text-secondary)] px-4">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="btn btn-secondary"
          >
            Next
          </button>
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
