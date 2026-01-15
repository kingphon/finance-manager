/**
 * Expense breakdown pie chart component.
 */
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { CategorySummary } from "../../hooks/useReports";
import { useCurrency } from "../../context/CurrencyContext";

interface ExpenseChartProps {
  data: CategorySummary[];
  title?: string;
}

const COLORS = [
  "#F59E0B", // Amber (Primary)
  "#8B5CF6", // Violet (Secondary)
  "#10B981", // Emerald (Success)
  "#EF4444", // Red (Danger)
  "#06B6D4", // Cyan
  "#EC4899", // Pink
  "#F97316", // Orange
  "#6366F1", // Indigo
];

export function ExpenseChart({
  data,
  title = "Expense Breakdown",
}: ExpenseChartProps) {
  const { formatAmount } = useCurrency();

  if (data.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-[var(--color-text-muted)]">
          No expense data available
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category_name,
    value: item.total,
    percentage: item.percentage,
  }));

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  strokeWidth={0}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                boxShadow: "var(--shadow-lg)",
              }}
              formatter={(value) => [formatAmount(value as number), "Amount"]}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: "var(--color-text-primary)" }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
