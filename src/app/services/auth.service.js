

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'
import crypto from 'crypto'
import { NextResponse } from 'next/server'
export async function Signup(data){
    if(data.password){
        const hashedPassword=await bcrypt.hash(data.password,10)
        data.password=hashedPassword
    }
    return await prisma.user.create({data})
}

export async function Login(email,password){
    const user=await prisma.user.findUnique({where:{email}})
    if(!user){
        throw new Error("user not found")
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error("password didnt match")
    }
    const secret = process.env.ACC_KEY || process.env.NEXTAUTH_SECRET;
    if (!secret) {
        throw new Error("JWT secret is not configured")
    }
    const AccToken=jwt.sign({id:user.id,role:user.role},secret,{expiresIn:"2d"})

    return{
        AccToken
    }
}

export async function Forgot(email){
    const user=await prisma.user.findUnique({where:{email}})
    if(!user){
        throw new Error("error coming")
    }
    const resetToken=crypto.randomBytes(32).toString('hex')
    const hashedToken=crypto.createHash('sha256').update(resetToken).digest('hex')
    await prisma.user.update({where:{email},data:{resetPasswordToken:hashedToken,resetPasswordExpire:new Date(Date.now()+1000*60*60)}})
    return{resetToken}
}

export async function Reset(password,token){
    if(!password){
        return NextResponse.json({
            success:false
        })
    }
    const hashedToken=crypto.createHash('sha256').update(token).digest('hex')
    const Product=await prisma.product.findUnique({resetPasswordToken:hashedToken,resetPasswordExpire:{gt:Date.now()}})

    await prisma.product.update({where:{id:Number(id)},data:{resetPasswordToken:null,resetPasswordExpire:null}})

    return{
        message:"password reset successfully done"
    }
}