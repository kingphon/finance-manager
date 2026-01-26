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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
        <p className="text-muted-foreground mt-1">
          Your financial overview at a glance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Total Balance</span>
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
            <p className="text-sm text-muted-foreground mt-2">All time balance</p>
          </CardContent>
        </Card>

        {/* Income Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Total Income</span>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              {reportsLoading ? (
                <span className="animate-pulse">---</span>
              ) : (
                formatAmount(summary?.total_income || 0)
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-2">All time income</p>
          </CardContent>
        </Card>

        {/* Expense Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Total Expenses</span>
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-rose-400">
              {reportsLoading ? (
                <span className="animate-pulse">---</span>
              ) : (
                formatAmount(summary?.total_expense || 0)
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-2">All time expenses</p>
          </CardContent>
        </Card>
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
          <Button variant="link" asChild className="p-0 h-auto">
            <Link to="/transactions" className="flex items-center gap-1">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
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
