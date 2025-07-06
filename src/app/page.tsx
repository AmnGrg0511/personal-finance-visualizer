"use client";

import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { MonthlyChart } from "@/components/MonthlyChart";
import { CategoryChart } from "@/components/CategoryChart";
import { Dashboard } from "@/components/Dashboard";
import { BudgetForm } from "@/components/BudgetForm";
import { BudgetVsActualChart } from "@/components/BudgetVsActualChart";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState, useRef, useCallback } from "react";

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

const TRANSACTIONS_PER_PAGE = 10;

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]); // For paginated list
  const [allTransactionsForCharts, setAllTransactionsForCharts] = useState<Transaction[]>([]); // For charts
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingAllTransactionsForCharts, setLoadingAllTransactionsForCharts] = useState(true);
  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastTransactionElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loadingTransactions) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreTransactions) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingTransactions, hasMoreTransactions]
  );

  const fetchPaginatedTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    const response = await fetch(
      `/api/transactions?page=${page}&limit=${TRANSACTIONS_PER_PAGE}`
    );
    const data = await response.json();
    setTransactions((prevTransactions) => [...prevTransactions, ...data.transactions]);
    setHasMoreTransactions(data.hasMore);
    setLoadingTransactions(false);
  }, [page]);

  const fetchAllTransactionsForCharts = useCallback(async () => {
    setLoadingAllTransactionsForCharts(true);
    const response = await fetch("/api/transactions?limit=0"); // Request all transactions
    const data = await response.json();
    setAllTransactionsForCharts(data.transactions);
    setLoadingAllTransactionsForCharts(false);
  }, []);

  const fetchBudgets = useCallback(async () => {
    setLoadingBudgets(true);
    const response = await fetch("/api/budgets");
    const data = await response.json();
    setBudgets(data);
    setLoadingBudgets(false);
  }, []);

  useEffect(() => {
    fetchPaginatedTransactions();
  }, [fetchPaginatedTransactions]);

  useEffect(() => {
    fetchAllTransactionsForCharts();
    fetchBudgets();
  }, [fetchAllTransactionsForCharts, fetchBudgets]);

  const handleTransactionAction = () => {
    setPage(1); // Reset page to 1 to refetch from start
    setTransactions([]); // Clear existing transactions
    fetchPaginatedTransactions(); // Fetch first page
    fetchAllTransactionsForCharts(); // Re-fetch all transactions for charts
    fetchBudgets(); // Also refetch budgets as they might be affected by new transactions
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-12 lg:p-24 bg-gray-50 dark:bg-neutral-950">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-7xl space-y-12">
        <Dashboard transactions={allTransactionsForCharts} loading={loadingAllTransactionsForCharts} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <TransactionForm onTransactionAdded={handleTransactionAction} />
            <BudgetForm onBudgetAdded={handleTransactionAction} />
          </div>
          <div className="space-y-8">
            <MonthlyChart transactions={allTransactionsForCharts} loading={loadingAllTransactionsForCharts} />
            <CategoryChart transactions={allTransactionsForCharts} loading={loadingAllTransactionsForCharts} />
            <BudgetVsActualChart transactions={allTransactionsForCharts} budgets={budgets} loading={loadingAllTransactionsForCharts || loadingBudgets} />
          </div>
        </div>

        <TransactionList
          transactions={transactions}
          onTransactionDeleted={handleTransactionAction}
          onTransactionUpdated={handleTransactionAction}
          loading={loadingTransactions}
          lastTransactionElementRef={lastTransactionElementRef}
          hasMore={hasMoreTransactions}
        />
      </div>
    </main>
  );
}