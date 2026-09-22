import {
  saveWarrantyDocument,
  getAllWarrantyDocuments,
  getWarrantyDocumentById,
} from "../../src/app/services/upload.services";

jest.mock("../../src/app/lib/prisma", () => ({
  __esModule: true,
  default: {
    product: {
      findUnique: jest.fn(),
    },
    warrantyDocument: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import prisma from "../../src/app/lib/prisma";

describe("Upload service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("saveWarrantyDocument creates document when product exists", async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 1, productName: "BOAT Airdopes" });
    const mockDoc = { id: 1, fileName: "receipt.png", fileUrl: "/uploads/receipt.png", productId: 1 };
    prisma.warrantyDocument.create.mockResolvedValue(mockDoc);

    const result = await saveWarrantyDocument({
      fileName: "receipt.png",
      fileUrl: "/uploads/receipt.png",
      productId: 1,
    });

    expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(prisma.warrantyDocument.create).toHaveBeenCalledWith({
      data: {
        fileName: "receipt.png",
        fileUrl: "/uploads/receipt.png",
        productId: 1,
      },
      include: { product: true },
    });
    expect(result).toEqual(mockDoc);
  });

  test("saveWarrantyDocument throws if product does not exist", async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(
      saveWarrantyDocument({
        fileName: "receipt.png",
        fileUrl: "/uploads/receipt.png",
        productId: 999,
      })
    ).rejects.toThrow("Product Not Found");
  });

  test("getAllWarrantyDocuments returns all documents", async () => {
    const mockList = [{ id: 1, fileName: "doc.pdf" }, { id: 2, fileName: "pic.png" }];
    prisma.warrantyDocument.findMany.mockResolvedValue(mockList);

    const result = await getAllWarrantyDocuments();
    expect(prisma.warrantyDocument.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockList);
  });

  test("getWarrantyDocumentById returns document when found", async () => {
    const mockDoc = { id: 1, fileName: "doc.pdf" };
    prisma.warrantyDocument.findUnique.mockResolvedValue(mockDoc);

    const result = await getWarrantyDocumentById(1);
    expect(prisma.warrantyDocument.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { product: true },
    });
    expect(result).toEqual(mockDoc);
  });
});
