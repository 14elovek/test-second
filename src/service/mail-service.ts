import nodemailer from 'nodemailer'
import 'dotenv/config'

class MailService {
   transporter: nodemailer.Transporter

   constructor() {
      this.transporter = nodemailer.createTransport({
         host: process.env.SMTP_HOST,
         port: Number(process.env.SMTP_PORT),
         secure: false,
         auth: {
            user: process.env.SMTP_LOGIN,
            pass: process.env.SMTP_PASSWORD
         }
      })
   }

   async sendActivationLink(to: string, activationLink: string) {
      await this.transporter.sendMail({
         from: process.env.SMTP_LOGIN,
         to,
         subject: `Активация аккаунта на сайте ${process.env.API_URL}`,
         text: '',
         html: 
            `
               <div>
                  <h1>Для активации перейдите по ссылке</h1>
                  <a href="${activationLink}">${activationLink}</a>
               </div>
            `
      })
   }
}

export default new MailService()