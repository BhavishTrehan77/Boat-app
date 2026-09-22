import prisma from "../lib/prisma";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

// 1. Create a warranty document record in the database
export async function saveWarrantyDocument({ fileName, fileUrl, productId }) {
  // Check if the product exists
  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
  });

  if (!product) {
    throw new Error("Product Not Found");
  }

  // Create document entry linked to product
  const document = await prisma.warrantyDocument.create({
    data: {
      fileName: fileName,
      fileUrl: fileUrl,
      productId: Number(productId),
    },
    include: {
      product: true,
    },
  });

  return document;
}

// 2. Fetch all warranty documents (used by Admin to review and download)
export async function getAllWarrantyDocuments() {
  return await prisma.warrantyDocument.findMany({
    include: {
      product: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: { uploadedAt: "desc" },
  });
}

// 3. Find a single warranty document by ID
export async function getWarrantyDocumentById(id) {
  const document = await prisma.warrantyDocument.findUnique({
    where: { id: Number(id) },
    include: {
      product: true,
    },
  });

  if (!document) {
    throw new Error("Warranty document not found");
  }

  return document;
}

// 4. Backwards-compatible upload function (saves file locally)
export async function UploadWarrantyPDF(file, productId) {
  if (!file) {
    throw new Error("File is required.");
  }

  const sanitizedName = (file.name || "document.pdf").replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${Date.now()}-${sanitizedName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  const fileUrl = `/uploads/${fileName}`;

  return await saveWarrantyDocument({
    fileName,
    fileUrl,
    productId,
  });
}

export default {
  saveWarrantyDocument,
  getAllWarrantyDocuments,
  getWarrantyDocumentById,
  UploadWarrantyPDF,
};