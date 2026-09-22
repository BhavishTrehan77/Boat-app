import prisma from "../lib/prisma";

export async function GetUserDashboard(userId) {
  const products = await prisma.product.findMany({
    where: {
      userId: Number(userId),
    },
    include: {
      repairs: true,
    },
  });

  const totalProducts = products.length;
  const now = new Date();

  const Warrenties = products.filter(
    (p) => p.expiryDate && new Date(p.expiryDate) > now
  ).length;
  const expired = products.filter(
    (p) => p.expiryDate && new Date(p.expiryDate) <= now
  ).length;

  const pendingRepairs = products.reduce((total, p) => {
    return (
      total +
      (p.repairs || []).filter((repair) => repair.status === "PENDING").length
    );
  }, 0);

  const completedRepairs = products.reduce((total, p) => {
    return (
      total +
      (p.repairs || []).filter((repair) => repair.status === "COMPLETED").length
    );
  }, 0);

  return {
    totalProducts,
    Warrenties,
    expired,
    pendingRepairs,
    completedRepairs,
  };
}
