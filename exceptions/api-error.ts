export default class ApiError extends Error {
   status
   errors

   constructor(status: number, message: string, errors: any[] = []) {
      super(message)
      this.errors = errors
      this.status = status
   }

   static UnauthorizedError() {
      return new ApiError(401, 'Пользователь не авторизован')
   }

   static BadRequest(message: string, errors: any[] = []) {
      return new ApiError(400, message, errors)
   }

   static Forbidden() {
      return new ApiError(403, 'Отказано в доступе')
   }
}