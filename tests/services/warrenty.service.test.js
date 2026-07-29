import { Warrenty } from "../../src/app/services/warrenty.service";

jest.mock("../../src/app/lib/prisma", () => ({
  __esModule: true,
  default: {
    product: {
      findUnique: jest.fn(),
    },
  },
}));

import prisma from "../../src/app/lib/prisma";

describe("Warranty service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Warrenty returns product with documents and repairs when found", async () => {
    const product = {
      id: 1,
      productName: "BOAT Airdopes",
      serialNumber: "BOAT-123",
      documents: [{ id: 1, pdfUrl: "http://x" }],
      repairs: [{ id: 1, issue: "Sound" }],
    };
    prisma.product.findUnique.mockResolvedValue(product);

    const result = await Warrenty("BOAT-123");

    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: { serialNumber: "BOAT-123" },
      include: { documents: true, repairs: true },
    });
    expect(result).toEqual(product);
  });

  test("Warrenty throws when product not found", async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(Warrenty("UNKNOWN-999")).rejects.toThrow("Product not found");
  });
});
