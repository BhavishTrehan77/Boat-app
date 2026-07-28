import { Warrenty } from "@/app/services/warrenty.service";
import { NextResponse } from "next/server";


export async function GET(request,{params}){
    const {serialNumber}=await params
    
    const product=await Warrenty(serialNumber)
     return NextResponse.json({
            success: true,
            data: product
        });
}