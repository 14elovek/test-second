import { z } from "zod";

const userSchemas = {
    registerBody: z.object({
        email: z.email({ message: "Некорректный email" }),
        password: z.string().min(3, "Пароль слишком короткий").max(20, "Пароль слишком длинный"),
    }),

    loginBody: z.object({
        email: z.email({ message: "Некорректный email" }),
        password: z.string().min(3, "Пароль слишком короткий").max(20, "Пароль слишком длинный"),
    }),

    activateParams: z.object({
        link: z.string().trim().pipe(z.uuid({message: 'Некорректная ссылка активации'})),
    }),
}

export default userSchemas