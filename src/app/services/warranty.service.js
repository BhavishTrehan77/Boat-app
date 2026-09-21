import prisma from "../lib/prisma";

export async function getWarrantyBySerial(serialNumber) {
  const product = await prisma.product.findUnique({
    where: {
      serialNumber,
    },
    include: {
      documents: true,
      repairs: true,
    },
  });
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
}

// Backwards compatibility alias
export const Warrenty = getWarrantyBySerial;
