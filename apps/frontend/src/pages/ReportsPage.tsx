/**
 * Reports Page - Detailed financial analytics.
 */
import { useState } from "react";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { useReports } from "../hooks/useReports";
import { ExpenseChart } from "../components/Charts/ExpenseChart";
import { TrendChart } from "../components/Charts/TrendChart";
import { useCurrency } from "../context/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <p className="text-muted-foreground mt-1">
            Detailed financial analytics
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <div className="flex gap-1">
            {dateRangeOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => setDateRange(option.value as typeof dateRange)}
                variant={dateRange === option.value ? "default" : "ghost"}
                size="sm"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Net Balance</p>
            <p className="text-2xl font-bold mt-1">
              {isLoading ? "---" : formatAmount(summary?.balance || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Total Income</p>
            <p className="text-2xl font-bold mt-1 text-emerald-400">
              {isLoading ? "---" : formatAmount(summary?.total_income || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold mt-1 text-rose-400">
              {isLoading ? "---" : formatAmount(summary?.total_expense || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Savings Rate</p>
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
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends Chart */}
      <TrendChart data={monthlyTrends} />

      {/* Category Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Income by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
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
                        <span className="text-sm text-emerald-400">
                          {formatAmount(cat.total)}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              Expenses by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
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
                        <span className="text-sm text-rose-400">
                          {formatAmount(cat.total)}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expense Pie Chart */}
      <ExpenseChart data={expenseCategories} />
    </div>
  );
}
