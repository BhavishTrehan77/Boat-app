import { runMulter } from "@/app/lib/multer";
import { saveWarrantyDocument } from "@/app/services/upload.services";
import { getAuthSession } from "@/app/lib/session";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // 1. Verify user is logged in
    const session = await getAuthSession(request);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in to upload." },
        { status: 401 }
      );
    }

    // 2. Process file upload using Multer (saves to public/uploads)
    const { file, body } = await runMulter(request, "file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No image or document file provided." },
        { status: 400 }
      );
    }

    const productId = body.productId;
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required." },
        { status: 400 }
      );
    }

    // 3. Check product existence and access control
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    // Regular users can only upload files for products they own
    const isOwner = product.userId === Number(session.user.id);
    const isAdmin = session.user.role === "ADMIN";

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden. You can only upload files for your own registered products.",
        },
        { status: 403 }
      );
    }

    // 4. Save file metadata to the database
    const fileUrl = `/uploads/${file.filename}`;
    const document = await saveWarrantyDocument({
      fileName: file.originalname,
      fileUrl: fileUrl,
      productId: Number(productId),
    });

    return NextResponse.json(
      {
        success: true,
        message: "File uploaded successfully via Multer!",
        body: document,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Warranty upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to upload file.",
      },
      { status: 400 }
    );
  }
}
