interface UserModel {
   email: string
   _id: any
   isActivated: boolean
}

export default class UserDto {
   readonly email: string
   readonly id: string
   readonly isActivated: boolean

   constructor(model: UserModel) {
      this.email = model.email
      this.id = model._id ? model._id.toString() : ''
      this.isActivated = model.isActivated
   }
}