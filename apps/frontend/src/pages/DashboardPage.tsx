/**
 * Dashboard Page - Financial overview with summary cards and charts.
 */
import { TrendingUp, TrendingDown, Wallet, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useReports } from "../hooks/useReports";
import { useTransactions } from "../hooks/useTransactions";
import { ExpenseChart } from "../components/Charts/ExpenseChart";
import { TrendChart } from "../components/Charts/TrendChart";
import { TransactionList } from "../components/TransactionList";
import { useCurrency } from "../context/CurrencyContext";

export function DashboardPage() {
  const {
    summary,
    expenseCategories,
    monthlyTrends,
    isLoading: reportsLoading,
  } = useReports();
  const { transactions, isLoading: transactionsLoading } = useTransactions({
    perPage: 5,
  });

  const { formatAmount } = useCurrency();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Your financial overview at a glance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="card p-6 glass">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[var(--color-text-secondary)]">
              Total Balance
            </span>
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold">
            {reportsLoading ? (
              <span className="animate-pulse">---</span>
            ) : (
              formatAmount(summary?.balance || 0)
            )}
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            All time balance
          </p>
        </div>

        {/* Income Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[var(--color-text-secondary)]">
              Total Income
            </span>
            <div className="w-10 h-10 rounded-lg bg-[var(--color-income)]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[var(--color-income)]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-income)]">
            {reportsLoading ? (
              <span className="animate-pulse">---</span>
            ) : (
              formatAmount(summary?.total_income || 0)
            )}
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            All time income
          </p>
        </div>

        {/* Expense Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[var(--color-text-secondary)]">
              Total Expenses
            </span>
            <div className="w-10 h-10 rounded-lg bg-[var(--color-expense)]/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-[var(--color-expense)]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[var(--color-expense)]">
            {reportsLoading ? (
              <span className="animate-pulse">---</span>
            ) : (
              formatAmount(summary?.total_expense || 0)
            )}
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            All time expenses
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart data={monthlyTrends} />
        <ExpenseChart data={expenseCategories} />
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Link
            to="/transactions"
            className="text-[var(--color-primary)] hover:underline flex items-center gap-1 text-sm"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <TransactionList
          transactions={transactions}
          onEdit={() => {}}
          onDelete={() => {}}
          isLoading={transactionsLoading}
        />
      </div>
    </div>
  );
}
