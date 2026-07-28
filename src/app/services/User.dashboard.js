import prisma from "../lib/prisma"

export async function GetUserDashboard(userId){
   const product = await prisma.product.findMany({
    where: {
        userId: Number(userId)
    },
    include: {
        repairs: true
    }
});
   const totalProducts=product.length

   const Warrenties=product.filter(p=>new Date(p.expiryDate)>new Date()).length
   const expired=product.filter(p=>new Date(p.expiryDate)<=new Date()).length

   const pendingRepairs=product.reduce((total,product)=>{
      return total+product.repairs.filter(repair=>repair.status==="PENDING").length
   },0)
   const completedRepairs=product.reduce((total,product)=>{
      return total+product.repairs.filter(repair=>repair.status==="COMPLETED").length
   },0)
   return {
      totalProducts,
      Warrenties,
      expired,
      pendingRepairs,
      completedRepairs
   }
}
