"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface Budget {
  _id: string;
  category: string;
  amount: number;
}

interface BudgetVsActualChartProps {
  transactions: Transaction[];
  budgets: Budget[];
  loading: boolean;
}

export function BudgetVsActualChart({ transactions, budgets, loading }: BudgetVsActualChartProps) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!loading) {
      const actualExpenses = transactions.reduce((acc: any, transaction: Transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc;
      }, {});

      const chartData = budgets.map((budget: Budget) => ({
        name: budget.category,
        Budget: budget.amount,
        Actual: actualExpenses[budget.category] || 0,
      }));

      setData(chartData);
    }
  }, [transactions, budgets, loading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actual</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value: number) => `₹${value}`} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} formatter={(value: number) => `₹${value}`} />
              <Legend />
              <Bar dataKey="Budget" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}