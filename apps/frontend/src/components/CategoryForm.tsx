import { useState, type FormEvent } from "react";
import { Plus, Save } from "lucide-react";
import { Modal } from "./ui/Modal";

interface CategoryFormProps {
  onSubmit: (data: {
    name: string;
    type: "income" | "expense";
  }) => Promise<void>;
  onClose: () => void;
  initialData?: {
    name: string;
    type: "income" | "expense";
  };
  isEdit?: boolean;
}

export function CategoryForm({
  onSubmit,
  onClose,
  initialData,
  isEdit = false,
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<"income" | "expense">(
    initialData?.type || "expense"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a category name");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        type,
      });
      onClose();
    } catch (err) {
      setError("Failed to save category");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? "Edit Category" : "New Category"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="label">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="e.g., Groceries"
            autoFocus
            required
          />
        </div>

        <div>
          <label className="label">Type *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("income")}
              className={`py-2 px-4 rounded-lg border font-medium transition-all ${
                type === "income"
                  ? "border-[var(--color-income)] bg-[var(--color-income)]/10 text-[var(--color-income)]"
                  : "border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`py-2 px-4 rounded-lg border font-medium transition-all ${
                type === "expense"
                  ? "border-[var(--color-expense)] bg-[var(--color-expense)]/10 text-[var(--color-expense)]"
                  : "border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]"
              }`}
            >
              Expense
            </button>
          </div>
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
