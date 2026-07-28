import { Login } from "@/app/services/auth.service"
import { LoginValidation } from "@/app/validators/auth.validator"
import { NextResponse } from "next/server"

export async function POST(request,{params}){
    try{
    const body=await request.json()
    const validate=LoginValidation.safeParse(body)
         if(!validate.success){
            return NextResponse.json({
                success:false,
                errors: validate.error
    
            }, { status: 400 })
         }
    const data=await Login(body.email,body.password)
    return NextResponse.json({
        success:true,
        body:data
    })
    }catch(err){
        console.error("Login error:", err)
        return NextResponse.json({
            success:false,
            message: err.message || "Login failed"
        }, { status: 400 })
    }
}