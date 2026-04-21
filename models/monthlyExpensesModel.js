import { Schema, model } from "mongoose";

const MonthlyExpensesSchema = new Schema({
   user: {type: Schema.Types.ObjectId, ref: 'User'},
   date: {type: String, required: true},
   limit: {type: Number},
   sum: {type: Number, required: true},
})

export default model('MonthlyExpenses', MonthlyExpensesSchema)