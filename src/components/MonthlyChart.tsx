
"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyChart } from "./DailyChart";
import { ArrowLeft } from "lucide-react";

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  date: string;
}

interface MonthlyChartProps {
  transactions: Transaction[];
  loading: boolean;
}

export function MonthlyChart({ transactions, loading }: MonthlyChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      const monthlyExpenses = transactions.reduce((acc: any, transaction: Transaction) => {
        const month = new Date(transaction.date).toLocaleString('default', { month: 'long' });
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += transaction.amount;
        return acc;
      }, {});

      const chartData = Object.keys(monthlyExpenses).map(month => ({
        name: month,
        Expenses: monthlyExpenses[month]
      }));

      setData(chartData);
    }
  }, [transactions, loading]);

  const handleBarClick = (data: any) => {
    setSelectedMonth(data.name);
  };

  const handleBackClick = () => {
    setSelectedMonth(null);
  };

  if (selectedMonth) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center space-x-2">
          <ArrowLeft className="h-5 w-5 cursor-pointer" onClick={handleBackClick} />
          <CardTitle>Daily Expenses for {selectedMonth}</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyChart transactions={transactions} selectedMonth={selectedMonth} loading={loading} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
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
              <Bar dataKey="Expenses" fill="#6366f1" radius={[4, 4, 0, 0]} onClick={handleBarClick} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
