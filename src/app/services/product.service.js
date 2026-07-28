import prisma from "../lib/prisma";

export async function GetProducts(){
    return await prisma.product.findMany()
}
export async function CreateProducts(body){
    const existingProduct=await prisma.product.findUnique({where:{serialNumber:body.serialNumber}})
    if (existingProduct) {
        throw new Error("Serial Number Already Exists");
    }

    return await prisma.product.create({data:body})
}
export async function GetProductsById(id){
    return await prisma.product.findMany({where:{id:Number(id)}})
}

export async function PatchProduct(id,data){
    const Product=await prisma.product.findUnique({where:{id:Number(id)}})
    if (!Product) {
        throw new Error("Product Not Found");
    }
    
    if(data.serialNumber){
    const serial=await prisma.product.findUnique({
        where:{
            serialNumber:data.serialNumber
        }
    })
     if (serial && serial.id !== Number(id)) {
            throw new Error("Serial Number Already Exists");
        }
    }
    return await prisma.product.update({where:{id:Number(id)},data:data})

}
export async function DeleteProduct(id){
    const product=await prisma.product.findUnique({where:{id:Number(id)}})
    if(!product){
        throw new Error("Product Not Found");
    }
    return await prisma.product.delete({where:{id:Number(id)}})
}