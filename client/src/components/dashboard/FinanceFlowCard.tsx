import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CreditCard, Home, ShoppingBag, Utensils } from "lucide-react";
import { useState } from "react";

interface FinanceSummary {
  income: number;
  incomeChange: number;
  expenses: number;
  expensesChange: number;
}

interface FinanceDay {
  day: string;
  income: number;
  expenses: number;
}

interface Expense {
  id: number;
  category: string;
  amount: number;
  percentage: number;
  icon: React.ReactNode;
}

interface FinanceFlowCardProps {
  summary: FinanceSummary;
  weeklyData: FinanceDay[];
  topExpenses: Expense[];
}

export default function FinanceFlowCard({
  summary,
  weeklyData = [],
  topExpenses = [],
}: FinanceFlowCardProps) {
  const [timeframe, setTimeframe] = useState<"week" | "month">("week");

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-neutral-800">Finance Flow</h3>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant={timeframe === "month" ? "secondary" : "outline"}
              className="text-xs font-medium h-7 py-1 px-2"
              onClick={() => setTimeframe("month")}
            >
              Month
            </Button>
            <Button
              size="sm"
              variant={timeframe === "week" ? "secondary" : "outline"}
              className="text-xs font-medium h-7 py-1 px-2"
              onClick={() => setTimeframe("week")}
            >
              Week
            </Button>
          </div>
        </div>

        <div className="mb-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <span className="text-xs text-neutral-500">Income</span>
              <div className="mt-1 flex items-baseline">
                <span className="text-xl font-semibold text-neutral-800">
                  ${summary.income.toLocaleString()}
                </span>
                <span
                  className={cn(
                    "ml-2 text-xs font-medium",
                    summary.incomeChange >= 0 ? "text-green-500" : "text-red-500"
                  )}
                >
                  {summary.incomeChange >= 0 ? "+" : ""}
                  {summary.incomeChange}%
                </span>
              </div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg">
              <span className="text-xs text-neutral-500">Expenses</span>
              <div className="mt-1 flex items-baseline">
                <span className="text-xl font-semibold text-neutral-800">
                  ${summary.expenses.toLocaleString()}
                </span>
                <span
                  className={cn(
                    "ml-2 text-xs font-medium",
                    summary.expensesChange <= 0 ? "text-green-500" : "text-red-500"
                  )}
                >
                  {summary.expensesChange >= 0 ? "+" : ""}
                  {summary.expensesChange}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <div className="h-48 flex items-end space-x-1 mb-2">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex flex-col items-center flex-1">
                <div className="w-full flex flex-col items-center">
                  <div
                    className="w-full bg-green-500 rounded-t-sm"
                    style={{ height: `${(day.income / 2000) * 100}px` }}
                  ></div>
                  <div
                    className="w-full bg-red-500 rounded-b-sm"
                    style={{ height: `${(day.expenses / 2000) * 100}px` }}
                  ></div>
                </div>
                <span className="text-xs text-neutral-500 mt-1">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-sm"></span>
              <span className="ml-2 text-xs text-neutral-600">Income</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-sm"></span>
              <span className="ml-2 text-xs text-neutral-600">Expenses</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-3">Top Expenses</h4>
          <div className="space-y-3">
            {topExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  {expense.icon}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">{expense.category}</span>
                    <span className="text-sm font-medium text-neutral-800">
                      ${expense.amount}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-1">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${expense.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
