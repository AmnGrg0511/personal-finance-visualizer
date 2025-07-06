
import { Schema, model, models } from "mongoose";

const BudgetSchema = new Schema({
  category: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const Budget = models.Budget || model("Budget", BudgetSchema);

export default Budget;
