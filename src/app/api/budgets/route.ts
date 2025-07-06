import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import Budget from "@/models/Budget";

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("personal_finance");
    const data = await req.json();

    const result = await db.collection("budgets").updateOne(
      { category: data.category }, // Filter: find by category
      { $set: { amount: data.amount } }, // Update: set the new amount
      { upsert: true } // Options: insert if not found
    );

    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unable to connect to database" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("personal_finance");
    const budgets = await db.collection("budgets").find({}).toArray();
    return NextResponse.json(budgets, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unable to connect to database" }, { status: 500 });
  }
}