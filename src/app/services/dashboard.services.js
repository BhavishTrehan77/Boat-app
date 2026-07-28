import prisma from "../lib/prisma";
export async function GetAdminDashboard(){
const [
    totalUsers,
    totalProducts,
    activeWarranty,
     expiredWarranty,
    pendingRepairs,
    completedRepairs
]=await Promise.all([
    prisma.user.count(),
    prisma.product.count() ,
    prisma.product.count({
        where:{
            expiryDate:{gte:new Date()}
        }
    }),
    prisma.product.count({
        where:{
            expiryDate:{lt:new Date()}
        }
    }),
    prisma.repairHistory.count({
        where:{
            status:"PENDING"
        }
    }),
    prisma.repairHistory.count({
        where:{
            status:"COMPLETED"
        }
    }),
])
 return {
        totalUsers,
        totalProducts,
        activeWarranty,
        expiredWarranty,
        pendingRepairs,
        completedRepairs
    };
}
