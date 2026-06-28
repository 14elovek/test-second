import { Schema, model } from "mongoose";

const ExpenseSchema = new Schema({
   user: {type: Schema.Types.ObjectId, ref: 'User'},
   sum: {type: Number, required: true},
   title: {type: String, required: true},
   date: {type: Date, require: true},
   category: {type: String}
})

ExpenseSchema.index({user: 1, date: 1})

export default model('Expense', ExpenseSchema)