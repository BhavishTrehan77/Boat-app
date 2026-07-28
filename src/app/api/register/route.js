import { Signup } from "@/app/services/auth.service"
import { Authvalidation } from "@/app/validators/auth.validator"
import { NextResponse } from "next/server"
import { success } from "zod"


export async function POST(request,{params}){
    try{
   
    const body=await request.json()
     const validate=Authvalidation.safeParse(body)
     if(!validate.success){
        return NextResponse.json({
            success:false,
            errors: validate.error

        }, { status: 400 })
     }
    const data=await Signup(body)
    return NextResponse.json({
        success:true,
        body:data
    }, { status: 201 })
    }catch(err){
        console.error("Registration error:", err)
        return NextResponse.json({
            success:false,
            message:err.message
        }, { status: 400 })
    }
}