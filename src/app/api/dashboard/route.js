import { GetAdminDashboard } from "@/app/services/dashboard.services";
import { NextResponse } from "next/server";


export async function GET(){
    const data=await GetAdminDashboard()
    return NextResponse.json({
        success:true,
        body:data
    })
}