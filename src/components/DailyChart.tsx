
"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  date: string;
}

interface DailyChartProps {
  transactions: Transaction[];
  selectedMonth: string;
  loading: boolean;
}

export function DailyChart({ transactions, selectedMonth, loading }: DailyChartProps) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && selectedMonth) {
      const dailyExpenses = transactions.reduce((acc: any, transaction: Transaction) => {
        const transactionDate = new Date(transaction.date);
        const month = transactionDate.toLocaleString('default', { month: 'long' });

        if (month === selectedMonth) {
          const day = transactionDate.getDate();
          if (!acc[day]) {
            acc[day] = 0;
          }
          acc[day] += transaction.amount;
        }
        return acc;
      }, {});

      const chartData = Object.keys(dailyExpenses).map(day => ({
        name: day,
        Expenses: dailyExpenses[day]
      })).sort((a, b) => parseInt(a.name) - parseInt(b.name));

      setData(chartData);
    }
  }, [transactions, selectedMonth, loading]);

  return (
    <div className="mt-1">
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
            <Bar dataKey="Expenses" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
