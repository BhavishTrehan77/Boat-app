import prisma from "../lib/prisma";

export async function createRepair(data) {
  const product = await prisma.product.findUnique({
    where: {
      id: Number(data.productId),
    },
  });

  if (!product) {
    throw new Error("Product Not Found");
  }

  const payload = {
    issue: data.issue,
    description: data.description || "",
    repairDate: data.repairDate ? new Date(data.repairDate) : new Date(),
    cost: Number(data.cost || 0),
    productId: Number(data.productId),
    ...(data.status ? { status: data.status } : {}),
  };

  return await prisma.repairHistory.create({ data: payload });
}

export async function getRepairs(userId = null) {
  const where = userId ? { product: { userId: Number(userId) } } : {};
  return await prisma.repairHistory.findMany({
    where,
    include: { product: true },
    orderBy: { repairDate: "desc" },
  });
}

export async function getRepairById(id) {
  const repair = await prisma.repairHistory.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      product: true,
    },
  });
  if (!repair) {
    throw new Error("Repair not found");
  }
  return repair;
}

export async function updateRepair(id, data) {
  const repair = await prisma.repairHistory.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      product: true,
    },
  });

  if (!repair) {
    throw new Error("Repair Not Found");
  }

  const updateData = { ...data };
  if (updateData.repairDate) {
    updateData.repairDate = new Date(updateData.repairDate);
  }
  if (updateData.cost !== undefined) {
    updateData.cost = Number(updateData.cost);
  }
  if (updateData.productId) {
    updateData.productId = Number(updateData.productId);
  }

  return await prisma.repairHistory.update({
    where: { id: Number(id) },
    data: updateData,
  });
}

export async function deleteRepair(id) {
  const repair = await prisma.repairHistory.findUnique({
    where: { id: Number(id) },
  });
  if (!repair) {
    throw new Error("not found");
  }
  return await prisma.repairHistory.delete({
    where: { id: Number(id) },
  });
}

// Backwards compatibility aliases
export const PostingRepair = createRepair;
export const GetingRepair = getRepairs;
export const PatchingRepair = updateRepair;
export const DeletingRepair = deleteRepair;
export const GetById = getRepairById;