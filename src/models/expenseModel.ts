import { Schema, model, Types, Document } from "mongoose";

interface IExpense extends Document {
   user: Types.ObjectId
   sum: number
   title: string
   date: Date
   category?: string
}

const ExpenseSchema = new Schema<IExpense>({
   user: {type: Schema.Types.ObjectId, ref: 'User'},
   sum: {type: Number, required: true},
   title: {type: String, required: true},
   date: {type: Date, required: true},
   category: {type: String}
})

ExpenseSchema.index({user: 1, date: 1})

export default model<IExpense>('Expense', ExpenseSchema)