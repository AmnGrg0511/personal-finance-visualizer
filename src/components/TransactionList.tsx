"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditTransactionForm } from "./EditTransactionForm";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Coffee, ShoppingCart, Car, Home, DollarSign, PiggyBank, BookOpen, Utensils, Shirt, Train, Heart, Wallet } from "lucide-react";

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionDeleted: () => void;
  onTransactionUpdated: () => void;
  loading: boolean;
  lastTransactionElementRef: (node: HTMLDivElement) => void;
  hasMore: boolean;
}

// Category icon mapping
const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: React.ElementType } = {
    'Dining Out': Utensils,
    'Shopping': ShoppingCart,
    'Transportation': Car,
    'Rent': Home,
    'Utilities': Home,
    'Entertainment': Coffee,
    'Healthcare': Heart,
    'Groceries': ShoppingCart,
    'Other': PiggyBank,
  };
  const IconComponent = icons[category] || PiggyBank;
  return <IconComponent className="w-4 h-4 text-gray-800 dark:text-gray-200" />;
};

// Category color mapping
const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    'Dining Out': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
    'Shopping': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
    'Transportation': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
    'Rent': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
    'Utilities': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
    'Entertainment': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
    'Healthcare': 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-200 dark:border-pink-700',
    'Groceries': 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900 dark:text-lime-200 dark:border-lime-700',
    'Other': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
  };
  return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
};

// Format relative time
const getRelativeTime = (date: string) => {
  const now = new Date();
  const transactionDate = new Date(date);
  const diffInHours = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  return transactionDate.toLocaleDateString();
};

export function TransactionList({ transactions, onTransactionDeleted, onTransactionUpdated, loading, lastTransactionElementRef, hasMore }: TransactionListProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDeleteId, setTransactionToDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!transactionToDeleteId) return;

    try {
      const response = await fetch(`/api/transactions/${transactionToDeleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      toast.success("Transaction deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete transaction. Please try again.");
      console.error("Delete error:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setTransactionToDeleteId(null);
      onTransactionDeleted(); // Always re-fetch data to ensure consistency
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setTransactionToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-50">Transactions</h2>
      <div className="grid gap-4">
        {transactions.length === 0 && !loading && !hasMore ? (
          <p>No transactions yet. Add one above!</p>
        ) : (
          transactions.map((transaction, index) => {
            const isLastElement = transactions.length === index + 1;
            return (
              <Card 
                key={transaction._id} 
                ref={isLastElement ? lastTransactionElementRef : null}
                className="group hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    {/* Left side - Main content */}
                    <div className="flex items-start gap-3 flex-1">
                      {/* Category icon */}
                      <div className="flex-shrink-0 p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:group-hover:bg-gray-600">
                        {getCategoryIcon(transaction.category)}
                      </div>
                      
                      {/* Transaction details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-50 truncate">
                            {transaction.description}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getCategoryColor(transaction.category)}`}
                          >
                            {transaction.category}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="text-xs">₹</span>
                            <span className="font-medium">{transaction.amount.toLocaleString()}</span>
                          </span>
                          <span>•</span>
                          <time title={new Date(transaction.date).toLocaleString()}>
                            {getRelativeTime(transaction.date)}
                          </time>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side - Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* Quick edit button - visible on hover */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(transaction);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      {/* Delete button - visible on hover, opens confirmation dialog */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(transaction._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
        {loading && (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
        {!hasMore && !loading && transactions.length > 0 && (
          <p className="text-center text-gray-500 mt-4">No more transactions to load.</p>
        )}
      </div>

      {selectedTransaction && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>
                Make changes to your transaction here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <EditTransactionForm
              transaction={selectedTransaction}
              onTransactionUpdated={() => {
                onTransactionUpdated();
                setIsEditDialogOpen(false);
              }}
              onClose={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}