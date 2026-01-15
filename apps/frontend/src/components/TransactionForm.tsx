/**
 * Transaction Form component for creating/editing transactions.
 */
import { useState, type FormEvent } from "react";
import { Plus, Save } from "lucide-react";
import { Modal } from "./ui/Modal";
import type { Category } from "../hooks/useCategories";

interface TransactionFormProps {
  categories: Category[];
  onSubmit: (data: {
    amount: number;
    description?: string;
    date: string;
    category_id: number;
  }) => Promise<void>;
  onClose: () => void;
  initialData?: {
    amount: number;
    description?: string;
    date: string;
    category_id: number;
  };
  isEdit?: boolean;
}

export function TransactionForm({
  categories,
  onSubmit,
  onClose,
  initialData,
  isEdit = false,
}: TransactionFormProps) {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [date, setDate] = useState(
    initialData?.date?.split("T")[0] || new Date().toISOString().split("T")[0]
  );
  const [categoryId, setCategoryId] = useState(
    initialData?.category_id?.toString() || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!amount || !categoryId || !date) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        amount: parseFloat(amount),
        description: description || undefined,
        date: new Date(date).toISOString(),
        category_id: parseInt(categoryId),
      });
      onClose();
    } catch (err) {
      setError("Failed to save transaction");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? "Edit Transaction" : "New Transaction"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="label">Amount *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input"
            placeholder="0.00"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="label">Category *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input"
            required
          >
            <option value="">Select a category</option>
            {incomeCategories.length > 0 && (
              <optgroup label="Income">
                {incomeCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </optgroup>
            )}
            {expenseCategories.length > 0 && (
              <optgroup label="Expense">
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div>
          <label className="label">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input min-h-[80px] resize-none"
            placeholder="Optional description..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="spinner" />
            ) : isEdit ? (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
