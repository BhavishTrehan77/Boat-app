import {z} from "zod"

export const Productvalidation=z.object({
    productName:z.string({message:"it must be in string format"}).trim().min(3,{message:"minimum length must be 3"}).max(100,{message:"maximum length is 100"}),
    searialNumber:z.string().trim().min(5,{message:"minimum length is 5"}).max(50,{message:"maximum length is50"}),
    purchaseDate:z.coerce.date({message:"purchase date is required field"}),
    warrantyMonths:z.number().positive({message:"no must be positive"}) .gt(0, "Warranty months must be greater than 0"),
    userId:z.number().positive({message:"no must be positive"})
})
