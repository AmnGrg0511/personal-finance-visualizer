
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/constants/categories";
import { useState } from "react";
import { DateTimePicker } from "./DateTimePicker";

const formSchema = z.object({
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number.",
  }),
  date: z.date(),
  category: z.string(),
});

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface EditTransactionFormProps {
  transaction: Transaction;
  onTransactionUpdated: () => void;
  onClose: () => void;
}

export function EditTransactionForm({ transaction, onTransactionUpdated, onClose }: EditTransactionFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: transaction.description,
      amount: transaction.amount,
      date: new Date(transaction.date),
      category: transaction.category,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch(`/api/transactions/${transaction._id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...values,
        date: values.date.toISOString(),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      setSubmitted(true);
      onTransactionUpdated();
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1000);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Edit Transaction</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Coffee, Dinner, Books" {...field} />
                </FormControl>
                <FormDescription>
                  A brief description of the transaction.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onFocus={(e) => e.target.select()}
                  />
                </FormControl>
                <FormDescription>The amount of the transaction.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date and Time</FormLabel>
                <FormControl>
                  <DateTimePicker {...field} />
                </FormControl>
                <FormDescription>The date and time of the transaction.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Select a category for the transaction.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Update Transaction</Button>
          <Button type="button" variant="outline" onClick={onClose} className="ml-2">Cancel</Button>
        </form>
      </Form>
      {submitted && <p className="text-green-500 mt-4">Transaction updated successfully!</p>}
    </div>
  );
}
