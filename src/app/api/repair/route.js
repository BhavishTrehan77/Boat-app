import { GetingRepair, PostingRepair } from "@/app/services/repair.service";
import { RepairValidation } from "@/app/validators/repair.validator";
import { NextResponse } from "next/server";

export async function POST(request){
    try{
    const body=await request.json()
     const validate=RepairValidation.safeParse(body)
             if(!validate.success){
                return NextResponse.json({
                    success:false,
                    errors: validate.error
        
                }, { status: 400 })
             }
    const data=await PostingRepair(body)
    return NextResponse.json({
        success:true,
        data:data
    },{status:201})
    }catch(err){
        console.error("Repair creation error:", err)
        return NextResponse.json({
            success:false,
            message:err.message
        }, { status: 400 })
    }

}

export async function GET(){
    try{
    const data=await GetingRepair()
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