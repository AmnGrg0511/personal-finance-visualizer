
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface DashboardProps {
  transactions: Transaction[];
  loading: boolean;
}

export function Dashboard({ transactions, loading }: DashboardProps) {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any>({});
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!loading) {
      const total = transactions.reduce((acc: number, transaction: Transaction) => acc + transaction.amount, 0);
      setTotalExpenses(total);

      const breakdown = transactions.reduce((acc: any, transaction: Transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc;
      }, {});
      setCategoryBreakdown(breakdown);

      const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentTransactions(sortedTransactions.slice(0, 3));
    }
  }, [transactions, loading]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-3/4" /> : <p className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <ul>
              {Object.keys(categoryBreakdown).map(category => (
                <li key={category} className="flex justify-between">
                  <span>{category}</span>
                  <span>₹{categoryBreakdown[category].toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <ul>
              {recentTransactions.map(transaction => (
                <li key={transaction._id} className="border-b py-2">
                  <p className="font-bold">{transaction.description}</p>
                  <p>Amount: ₹{transaction.amount}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
