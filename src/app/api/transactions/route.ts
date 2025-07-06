import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("personal_finance");
    const data = await req.json();
    const result = await db.collection("transactions").insertOne(data);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unable to connect to database" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("personal_finance");
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '0', 10); // Default to 0 to fetch all
    let transactions;
    let totalTransactions = 0;
    let hasMore = false;

    if (limit === 0) {
      // Fetch all transactions if limit is 0
      transactions = await db.collection("transactions")
        .find({})
        .sort({ date: -1 })
        .toArray();
      totalTransactions = transactions.length;
      hasMore = false;
    } else {
      // Fetch paginated transactions
      const skip = (page - 1) * limit;
      transactions = await db.collection("transactions")
        .find({})
        .sort({ date: -1 }) // Sort by date descending for most recent first
        .skip(skip)
        .limit(limit)
        .toArray();
      totalTransactions = await db.collection("transactions").countDocuments({});
      hasMore = (page * limit) < totalTransactions;
    }

    return NextResponse.json({ transactions, hasMore, totalTransactions }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unable to connect to database" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const client = await clientPromise;
    const db = client.db("personal_finance");
    const { id } = await params; // Await the params
    const result = await db.collection("transactions").deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Transaction deleted successfully" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unable to delete transaction" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const client = await clientPromise;
    const db = client.db("personal_finance");
    const { id } = await params; // Await the params
    const data = await req.json();
    const result = await db.collection("transactions").updateOne({ _id: new ObjectId(id) }, { $set: data });
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Transaction updated successfully" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unable to update transaction" }, { status: 500 });
  }
}