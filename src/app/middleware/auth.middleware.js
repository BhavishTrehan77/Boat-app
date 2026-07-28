import { NextResponse } from "next/server"

import jwt from "jsonwebtoken";
export async function Authmiddleware(request){
    const AuthHeader=request.headers.get("authorization")
    if(!AuthHeader){
        return NextResponse.json({
            success:false,
            message:"authheqder not wokr"
        })
    }
    if(!AuthHeader.startsWith('Bearer ')){
         return NextResponse.json({
            success:false,
            message:"authheqder not wokr"
        })
    }
    const token=AuthHeader.split(" ")[1]
    const secret = process.env.ACC_KEY || process.env.NEXTAUTH_SECRET;
    if (!secret) {
        return NextResponse.json({
            success:false,
            message:"JWT secret is not configured"
        }, { status: 500 })
    }
    const decode=jwt.verify(token, secret)
    if(!decode){
         return NextResponse.json({
            success:false,
            message:"authheqder not wokr"
        })
    }
return NextResponse.next();
}