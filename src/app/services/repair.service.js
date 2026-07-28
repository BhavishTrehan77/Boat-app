import prisma from "../lib/prisma";

export async function PostingRepair(data){
    console.log(data);
   
    const product=await prisma.product.findUnique({
        where:{
            id:Number(data.productId)
        }
    })
    console.log(product);
    if (!product) {
        throw new Error("Product Not Found");
    }
    
    return await prisma.repairHistory.create({data})
}

export async function GetingRepair(){

    return await prisma.repairHistory.findMany({include:{product:true}})
}

export async function PatchingRepair(id,data){

        const repair = await prisma.repairHistory.findUnique({
        where: {
            id: Number(id)
        }
    });

    if (!repair) {
        throw new Error("Repair Not Found");
    }

    return await prisma.repairHistory.update({where:{id:Number(id)},data})
}

export async function DeletingRepair(id){
    const repair=await prisma.repairHistory.findUnique({where:{id:Number(id)}})
    if(!repair){
        throw new Error("not found")
    }
    return await prisma.repairHistory.delete({where:{id:Number(id)}})
}

export async function GetById(id){
    const repair=await prisma.repairHistory.findUnique({
        where:{
            id:Number(id)
        },
        include:{
            product:true
        }
    })
    if(!repair){
        throw new Error("Repair not found")
    }
    return repair;
}