import { Schema, model } from "mongoose";

const ExpenseSchema = new Schema({
   user: {type: Schema.Types.ObjectId, ref: 'User'},
   monthlyExpenses: {type: Schema.Types.ObjectId, ref: 'MonthlyExpenses'},
   sum: {type: Number, required: true},
   title: {type: String, required: true},
   date: {type: Date, require: true},
   category: {type: String}
})

export default model('Expense', ExpenseSchema)