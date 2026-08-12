import { Response, NextFunction, RequestHandler } from "express"
import { z, ZodError } from "zod"
import ApiError from "../exceptions/api-error"

interface RequestValidation<
   TParams extends z.ZodTypeAny = any,
   TQuery extends z.ZodTypeAny = any,
   TBody extends z.ZodTypeAny = any
> {
   params?: TParams;
   query?: TQuery;
   body?: TBody;
}

export const validate = <
   TParams extends z.ZodTypeAny = z.ZodTypeAny,
   TQuery extends z.ZodTypeAny = z.ZodTypeAny,
   TBody extends z.ZodTypeAny = z.ZodTypeAny
>(
   schemas: RequestValidation<TParams, TQuery, TBody>
): RequestHandler<
   z.infer<TParams>,
   any,
   z.infer<TBody>,
   z.infer<TQuery>
> => {
   return async (req, res, next: NextFunction): Promise<void> => {
      try {
         if (schemas.params) {
            req.params = await schemas.params.parseAsync(req.params)
         }
         if (schemas.query) {
            const parsedQuery = await schemas.query.parseAsync(req.query)
            const queryRef = req.query as any;

            Object.keys(queryRef).forEach(key => delete queryRef[key])
            
            Object.assign(queryRef, parsedQuery)
         }
         if (schemas.body) {
            req.body = await schemas.body.parseAsync(req.body)
         }

         return next();
      } catch (error) {
         if (error instanceof ZodError) {
            const formattedErrors = error.issues.map((err) => ({
               path: err.path.join('.'),
               message: err.message,
            }))

            return next(ApiError.BadRequest('Ошибка при валидации', formattedErrors))
         }

         return next(error);
      }
   }
}