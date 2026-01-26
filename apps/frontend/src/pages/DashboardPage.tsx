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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>DASHBOARD</h1>
        <p className="text-muted-foreground mt-2">
          Your financial overview at a glance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance Card */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">BALANCE</span>
              <div className="w-8 h-8 bg-primary border-2 border-border flex items-center justify-center">
                <Wallet className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <p className="font-['Press_Start_2P'] text-lg">
              {reportsLoading ? (
                <span className="animate-blink">---</span>
              ) : (
                formatAmount(summary?.balance || 0)
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-2">All time</p>
          </CardContent>
        </Card>

        {/* Income Card */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">INCOME</span>
              <div className="w-8 h-8 bg-[hsl(var(--income))] border-2 border-border flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[hsl(var(--income-foreground))]" />
              </div>
            </div>
            <p className="font-['Press_Start_2P'] text-lg text-[hsl(var(--income))]">
              {reportsLoading ? (
                <span className="animate-blink">---</span>
              ) : (
                formatAmount(summary?.total_income || 0)
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-2">All time</p>
          </CardContent>
        </Card>

        {/* Expense Card */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">EXPENSES</span>
              <div className="w-8 h-8 bg-[hsl(var(--expense))] border-2 border-border flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-[hsl(var(--expense-foreground))]" />
              </div>
            </div>
            <p className="font-['Press_Start_2P'] text-lg text-[hsl(var(--expense))]">
              {reportsLoading ? (
                <span className="animate-blink">---</span>
              ) : (
                formatAmount(summary?.total_expense || 0)
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-2">All time</p>
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
