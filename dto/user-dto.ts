interface UserModel {
   email: string
   _id: string
   isActivated: boolean
}

export default class UserDto {
   readonly email
   readonly id
   readonly isActivated

   constructor(model: UserModel) {
      this.email = model.email
      this.id = model._id
      this.isActivated = model.isActivated
   }
}