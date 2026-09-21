import prisma from "../lib/prisma";

export function calculateExpiryDate(purchaseDate, warrantyMonths) {
  const purchase = new Date(purchaseDate);
  const expiry = new Date(purchase);
  expiry.setMonth(expiry.getMonth() + Number(warrantyMonths || 12));
  return expiry;
}

export async function getProducts(userId = null) {
  const where = userId ? { userId: Number(userId) } : {};
  return await prisma.product.findMany({
    where,
    include: {
      documents: true,
      repairs: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProduct(body) {
  const existingProduct = await prisma.product.findUnique({
    where: { serialNumber: body.serialNumber },
  });
  if (existingProduct) {
    throw new Error("Serial Number Already Exists");
  }

  const purchaseDate = new Date(body.purchaseDate);
  const warrantyMonths = Number(body.warrantyMonths);
  const expiryDate = calculateExpiryDate(purchaseDate, warrantyMonths);

  const productData = {
    productName: body.productName,
    serialNumber: body.serialNumber,
    purchaseDate,
    warrantyMonths,
    expiryDate,
    ...(body.userId ? { userId: Number(body.userId) } : {}),
  };

  try {
    return await prisma.product.create({ data: productData });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new Error("Serial Number Already Exists");
    }
    throw error;
  }
}

export async function getProductById(id) {
  return await prisma.product.findUnique({
    where: { id: Number(id) },
    include: {
      documents: true,
      repairs: true,
    },
  });
}

export async function updateProduct(id, data) {
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });
  if (!product) {
    throw new Error("Product Not Found");
  }

  if (data.serialNumber) {
    const serial = await prisma.product.findUnique({
      where: { serialNumber: data.serialNumber },
    });
    if (serial && serial.id !== Number(id)) {
      throw new Error("Serial Number Already Exists");
    }
  }

  const updateData = { ...data };

  // Recalculate expiryDate if purchaseDate or warrantyMonths is changed
  if (data.purchaseDate || data.warrantyMonths) {
    const purchaseDate = data.purchaseDate || product.purchaseDate;
    const warrantyMonths = data.warrantyMonths || product.warrantyMonths;
    updateData.expiryDate = calculateExpiryDate(purchaseDate, warrantyMonths);
  }

  if (updateData.purchaseDate) {
    updateData.purchaseDate = new Date(updateData.purchaseDate);
  }

  if (updateData.userId) {
    updateData.userId = Number(updateData.userId);
  }

  try {
    return await prisma.product.update({
      where: { id: Number(id) },
      data: updateData,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new Error("Serial Number Already Exists");
    }
    throw error;
  }
}

export async function deleteProduct(id) {
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });
  if (!product) {
    throw new Error("Product Not Found");
  }
  return await prisma.product.delete({
    where: { id: Number(id) },
  });
}

// Backwards compatibility aliases
export const GetProducts = getProducts;
export const CreateProducts = createProduct;
export const GetProductsById = getProductById;
export const PatchProduct = updateProduct;
export const DeleteProduct = deleteProduct;