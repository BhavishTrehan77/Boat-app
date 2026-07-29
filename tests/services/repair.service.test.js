import { PostingRepair, GetingRepair, PatchingRepair, DeletingRepair, GetById } from "../../src/app/services/repair.service";

jest.mock("../../src/app/lib/prisma", () => ({
  __esModule: true,
  default: {
    product: {
      findUnique: jest.fn(),
    },
    repairHistory: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import prisma from "../../src/app/lib/prisma";

describe("Repair service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("PostingRepair creates a repair when product exists", async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 1 });
    prisma.repairHistory.create.mockResolvedValue({ id: 1, productId: 1, issue: "Not charging" });

    const result = await PostingRepair({ productId: 1, issue: "Not charging" });

    expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(prisma.repairHistory.create).toHaveBeenCalledWith({ data: { productId: 1, issue: "Not charging" } });
    expect(result.id).toBe(1);
  });

  test("PostingRepair throws when product does not exist", async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(PostingRepair({ productId: 999, issue: "Broken" })).rejects.toThrow("Product Not Found");
  });

  test("GetingRepair returns all repairs with products", async () => {
    const repairs = [{ id: 1, issue: "Broken", product: { id: 1, productName: "BOAT" } }];
    prisma.repairHistory.findMany.mockResolvedValue(repairs);

    const result = await GetingRepair();

    expect(prisma.repairHistory.findMany).toHaveBeenCalledWith({ include: { product: true } });
    expect(result).toEqual(repairs);
  });

  test("PatchingRepair updates an existing repair", async () => {
    prisma.repairHistory.findUnique.mockResolvedValue({ id: 1, issue: "Old" });
    prisma.repairHistory.update.mockResolvedValue({ id: 1, issue: "Fixed" });

    const result = await PatchingRepair(1, { issue: "Fixed" });

    expect(prisma.repairHistory.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { issue: "Fixed" } });
    expect(result.issue).toBe("Fixed");
  });

  test("PatchingRepair throws when repair does not exist", async () => {
    prisma.repairHistory.findUnique.mockResolvedValue(null);

    await expect(PatchingRepair(999, { issue: "X" })).rejects.toThrow("Repair Not Found");
  });

  test("DeletingRepair deletes an existing repair", async () => {
    prisma.repairHistory.findUnique.mockResolvedValue({ id: 1 });
    prisma.repairHistory.delete.mockResolvedValue({ id: 1 });

    const result = await DeletingRepair(1);

    expect(prisma.repairHistory.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result.id).toBe(1);
  });

  test("DeletingRepair throws when repair does not exist", async () => {
    prisma.repairHistory.findUnique.mockResolvedValue(null);

    await expect(DeletingRepair(1)).rejects.toThrow("not found");
  });

  test("GetById returns repair with product", async () => {
    const repair = { id: 1, issue: "Broken", product: { id: 1 } };
    prisma.repairHistory.findUnique.mockResolvedValue(repair);

    const result = await GetById(1);

    expect(prisma.repairHistory.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, include: { product: true } });
    expect(result).toEqual(repair);
  });

  test("GetById throws when repair does not exist", async () => {
    prisma.repairHistory.findUnique.mockResolvedValue(null);

    await expect(GetById(999)).rejects.toThrow("Repair not found");
  });
});
