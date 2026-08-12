import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine(
   (val) => mongoose.Types.ObjectId.isValid(val),
   { message: "Невалидный Id" }
)

const optionalString = z.preprocess(
   (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
   z.string().trim().optional()
)

const expenseSchemas = {
   addExpenseBody: z.object({
      sum: z.coerce.number().positive({ message: "Сумма должна быть больше нуля" }),
      title: z.string().trim().min(1, "Название не может быть пустым"),
      category: optionalString,
   }),

   updateExpenseBody: z.object({
      expenseId: objectIdSchema,
      sum: z.coerce.number().positive({ message: "Сумма должна быть больше нуля" }).optional(),
      title: optionalString,
      category: optionalString,
   }).refine(data => {
      const hasSum = data.sum !== undefined;
      const hasTitle = data.title !== undefined;
      const hasCategory = data.category !== undefined;

      return hasSum || hasTitle || hasCategory
   }, {
      message: "Необходимо заполнить хотя бы одно поле",
      path: ['body']
   }),

   getSortExpensesQuery: z.object({
      dateFrom: z.iso.date({ message: "Неверный формат даты начала (ожидается ГГГГ-ММ-ДД)" }),
      dateTo: z.iso.date({ message: "Неверный формат даты конца (ожидается ГГГГ-ММ-ДД)" })
   }),

   getExpensesForMonth: z.object({
      date: z.iso.date({ message: "Неверный формат даты (ожидается ГГГГ-ММ-ДД)" }),
   }),

   deleteExpenseParams: z.object({
      expenseId: objectIdSchema,
   }),
}

export default expenseSchemas