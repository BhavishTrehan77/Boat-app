import { GetUserDashboard } from "@/app/services/User.dashboard";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request,{params}){
    const{id}=await params;
    const data=await GetUserDashboard(id)
    return NextResponse.json({
        success:true,
        body:data
    })
    
}