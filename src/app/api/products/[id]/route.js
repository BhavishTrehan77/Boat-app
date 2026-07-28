import { DeleteProduct, GetProductsById, PatchProduct } from "@/app/services/product.service"
import { NextResponse } from "next/server"

export async function GET(request,{params}){
    const{id}=await params;
    const data=await GetProductsById(id)
    return NextResponse.json({
        success:true,
        body:data
    })
}

export async function PATCH(request,{params}){
    const body=await request.json()
     const validate=Productvalidation.safeParse()
             if(!validate.success){
                return NextResponse.json({
                    success:false,
                    errors: validate.error
        
                })
             }
    const{id}=await params
    const data=await PatchProduct(id,body)
    return NextResponse.json({
        success:true,
        body:data
    })
}

export async function DELETE(request,{params}){
    const{id}=await params;
    const data=await DeleteProduct(id)
    return NextResponse.json({
        success:true,
        body:data
    })
}
