import { z } from "zod"

export const paginationQuerySchema = z.object({
   page: z.coerce
      .number()
      .int('Страница должна быть целым числом')
      .positive('Номер страницы должен быть больше 0')
      .default(1),
         
   limit: z.coerce
      .number()
      .int('Лимит должен быть целым числом')
      .positive('Лимит должен быть больше 0')
      .max(100, 'Нельзя запросить больше 100 элементов')
      .default(10)
})