
import { DeletingRepair, GetById, PatchingRepair } from "@/app/services/repair.service"
import { NextResponse } from "next/server"

export async function GET(request,{params}){
    try{
    const {id}=await params
    const data=await GetById(id)
    return NextResponse.json({
        success:true,
        data:data
    })
    }catch(err){
        return NextResponse.json({
            success:false,
            message:err.message
        })
    }

}

export async function PATCH(request,{params}){
    try{
    const{id}=await params;
    const body=await request.json()
    const validate=RepairValidation.safeParse()
                 if(!validate.success){
                    return NextResponse.json({
                        success:false,
                        errors: validate.error
            
                    })
                 }
    const data=await PatchingRepair(id,body)
    return NextResponse.json({
        success:true,
        data:data
    })
    }catch(err){
        return NextResponse.json({
               success:false,
               message:err.message
        })
        
    }
}

export async function DELETE(request,{params}){
    try{
    const{id}=await params
    const data=await DeletingRepair(id)
    return NextResponse.json({
        success:true,
        data:data
    })
    }catch(err){
        return NextResponse.json({
            success:false,
            message:err.message
        })
    }
    
}