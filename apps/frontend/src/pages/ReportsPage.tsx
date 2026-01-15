/**
 * Reports Page - Detailed financial analytics.
 */
import { useState } from "react";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { useReports } from "../hooks/useReports";
import { ExpenseChart } from "../components/Charts/ExpenseChart";
import { TrendChart } from "../components/Charts/TrendChart";
import { useCurrency } from "../context/CurrencyContext";

export function ReportsPage() {
  const [dateRange, setDateRange] = useState<"all" | "30" | "90" | "365">(
    "all"
  );

  const getDateRange = () => {
    if (dateRange === "all") return { start: undefined, end: undefined };

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - parseInt(dateRange));

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  };

  const { start, end } = getDateRange();
  const {
    summary,
    incomeCategories,
    expenseCategories,
    monthlyTrends,
    isLoading,
  } = useReports(start, end);

  const { formatAmount } = useCurrency();

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "30", label: "Last 30 Days" },
    { value: "90", label: "Last 90 Days" },
    { value: "365", label: "Last Year" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            Detailed financial analytics
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--color-text-muted)]" />
          <div className="flex gap-1">
            {dateRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value as typeof dateRange)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === option.value
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm text-[var(--color-text-muted)]">Net Balance</p>
          <p className="text-2xl font-bold mt-1">
            {isLoading ? "---" : formatAmount(summary?.balance || 0)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[var(--color-text-muted)]">Total Income</p>
          <p className="text-2xl font-bold mt-1 text-[var(--color-income)]">
            {isLoading ? "---" : formatAmount(summary?.total_income || 0)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[var(--color-text-muted)]">
            Total Expenses
          </p>
          <p className="text-2xl font-bold mt-1 text-[var(--color-expense)]">
            {isLoading ? "---" : formatAmount(summary?.total_expense || 0)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[var(--color-text-muted)]">Savings Rate</p>
          <p className="text-2xl font-bold mt-1">
            {isLoading
              ? "---"
              : summary?.total_income
              ? `${(
                  ((summary.total_income - summary.total_expense) /
                    summary.total_income) *
                  100
                ).toFixed(1)}%`
              : "0%"}
          </p>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <TrendChart data={monthlyTrends} />

      {/* Category Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[var(--color-income)]" />
            <h3 className="text-lg font-semibold">Income by Category</h3>
          </div>
          {incomeCategories.length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-center py-8">
              No income data available
            </p>
          ) : (
            <div className="space-y-3">
              {incomeCategories.map((cat) => (
                <div key={cat.category_id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        {cat.category_name}
                      </span>
                      <span className="text-sm text-[var(--color-income)]">
                        {formatAmount(cat.total)}
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--color-bg-hover)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-income)] rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] w-12 text-right">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense Categories */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-[var(--color-expense)]" />
            <h3 className="text-lg font-semibold">Expenses by Category</h3>
          </div>
          {expenseCategories.length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-center py-8">
              No expense data available
            </p>
          ) : (
            <div className="space-y-3">
              {expenseCategories.map((cat) => (
                <div key={cat.category_id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        {cat.category_name}
                      </span>
                      <span className="text-sm text-[var(--color-expense)]">
                        {formatAmount(cat.total)}
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--color-bg-hover)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-expense)] rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] w-12 text-right">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expense Pie Chart */}
      <ExpenseChart data={expenseCategories} />
    </div>
  );
}
