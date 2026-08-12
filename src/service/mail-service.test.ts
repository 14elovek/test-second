import { describe, test, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mailService from './mail-service'
import mongoose, { Types } from 'mongoose'

describe('userService', () => {
   let mongoServer: MongoMemoryServer

   beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create()
      await mongoose.connect(mongoServer.getUri())
   })

   afterAll(async () => {
      await mongoose.disconnect()
      await mongoServer.stop()
   })

   describe('sendActivationLink', () => {
      const testEmail = 'user@example.com';
      const testLink = 'http://localhost:5000/api/activate/unique-token-123';

      test('должен формировать опции письма и вызывать sendMail',
         async () => {
            const sendMailSpy = vi.spyOn(mailService.transporter, 'sendMail').mockImplementation(
               async () => {
                  return Promise.resolve({ messageId: 'test-id' })
               }
            )
            await mailService.sendActivationLink(testEmail, testLink)

            expect(sendMailSpy).toHaveBeenCalledTimes(1)

            expect(sendMailSpy).toHaveBeenCalledWith(
               expect.objectContaining({
                  to: testEmail,
                  html: expect.stringContaining(`href="${testLink}"`)
               })
            )

            sendMailSpy.mockRestore();
         }
      )
   })
})