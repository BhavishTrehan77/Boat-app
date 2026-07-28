import {z} from 'zod'


export const Authvalidation=z.object({
    name:z.string({message:"name must be a string"}).trim().min(3,{message:"name must be at least 3 characters"}).max(50,{message:"name must be less than 50 characters"}).optional(),
    email:z.string({message:"email is required"}).trim().email({message:"please enter a valid email"}),
    password:z.string({message:"password is required"}).min(6,{message:"password must be at least 6 characters long"})
})

export const LoginValidation=z.object({
    email:z.string({message:"email is required"}).trim().email({message:"please enter a valid email"}),
    password:z.string({message:"password is required"}).min(1,{message:"password is required"})
})
