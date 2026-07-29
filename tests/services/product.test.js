import prisma from "../../src/app/lib/prisma";
import { GetProducts, CreateProducts, GetProductsById, PatchProduct, DeleteProduct } from "../../src/app/services/product.service";

jest.mock("../../src/app/lib/prisma", () => ({
  __esModule: true,
  default: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("Product service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("GetProducts returns all products", async () => {
    const products = [{ id: 1, productName: "Laptop", serialNumber: "SN001" }];
    prisma.product.findMany.mockResolvedValue(products);

    const result = await GetProducts();

    expect(prisma.product.findMany).toHaveBeenCalled();
    expect(result).toEqual(products);
  });

  test("CreateProducts creates a product when the serial number is new", async () => {
    const body = { productName: "Mouse", serialNumber: "SN002", purchaseDate: new Date(), warrantyMonths: 12, expiryDate: new Date() };
    prisma.product.findUnique.mockResolvedValue(null);
    prisma.product.create.mockResolvedValue({ id: 2, ...body });

    const result = await CreateProducts(body);

    expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { serialNumber: body.serialNumber } });
    expect(prisma.product.create).toHaveBeenCalledWith({ data: body });
    expect(result).toEqual({ id: 2, ...body });
  });

  test("CreateProducts throws when the serial number already exists", async () => {
    const body = { productName: "Mouse", serialNumber: "SN002" };
    prisma.product.findUnique.mockResolvedValue({ id: 1, serialNumber: "SN002" });

    await expect(CreateProducts(body)).rejects.toThrow("Serial Number Already Exists");
  });

  test("GetProductsById returns products matching the id", async () => {
    const products = [{ id: 1, productName: "Laptop" }];
    prisma.product.findMany.mockResolvedValue(products);

    const result = await GetProductsById(1);

    expect(prisma.product.findMany).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual(products);
  });

  test("PatchProduct updates an existing product", async () => {
    const updatedProduct = { id: 1, productName: "Laptop Pro" };
    prisma.product.findUnique.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce(null);
    prisma.product.update.mockResolvedValue(updatedProduct);

    const result = await PatchProduct(1, { productName: "Laptop Pro" });

    expect(prisma.product.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { productName: "Laptop Pro" } });
    expect(result).toEqual(updatedProduct);
  });

  test("PatchProduct throws when the serial number already exists on another product", async () => {
    prisma.product.findUnique.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 2, serialNumber: "SN999" });

    await expect(PatchProduct(1, { serialNumber: "SN999" })).rejects.toThrow("Serial Number Already Exists");
  });

  test("DeleteProduct deletes an existing product", async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 1 });
    prisma.product.delete.mockResolvedValue({ id: 1 });

    const result = await DeleteProduct(1);

    expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual({ id: 1 });
  });

  test("DeleteProduct throws when the product does not exist", async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(DeleteProduct(1)).rejects.toThrow("Product Not Found");
  });
});