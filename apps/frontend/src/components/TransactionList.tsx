/**
 * Transaction List component with delete functionality.
 */
import { Trash2, Edit2, TrendingUp, TrendingDown } from "lucide-react";
import type { Transaction } from "../hooks/useTransactions";
import { useCurrency } from "../context/CurrencyContext";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  isLoading,
}: TransactionListProps) {
  const { formatAmount } = useCurrency();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-hover)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[var(--color-bg-hover)] rounded w-1/3" />
                <div className="h-3 bg-[var(--color-bg-hover)] rounded w-1/4" />
              </div>
              <div className="h-5 bg-[var(--color-bg-hover)] rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--color-text-muted)]">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => {
        const isIncome = transaction.category?.type === "income";
        return (
          <div
            key={transaction.id}
            className="card p-4 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isIncome
                    ? "bg-[var(--color-income)]/20"
                    : "bg-[var(--color-expense)]/20"
                }`}
              >
                {isIncome ? (
                  <TrendingUp className="w-5 h-5 text-[var(--color-income)]" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-[var(--color-expense)]" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {transaction.description ||
                    transaction.category?.name ||
                    "Transaction"}
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {transaction.category?.name} •{" "}
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>

              {/* Amount */}
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    isIncome
                      ? "text-[var(--color-income)]"
                      : "text-[var(--color-expense)]"
                  }`}
                >
                  {isIncome ? "+" : "-"}
                  {formatAmount(transaction.amount)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(transaction)}
                  className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(transaction.id)}
                  className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
