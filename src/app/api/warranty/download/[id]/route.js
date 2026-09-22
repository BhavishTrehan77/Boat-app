import prisma from "@/app/lib/prisma";
import { getAuthSession } from "@/app/lib/session";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request, { params }) {
  try {
    // 1. Check authentication
    const session = await getAuthSession(request);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const documentId = Number(id);

    if (isNaN(documentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid document ID." },
        { status: 400 }
      );
    }

    // 2. Fetch document record from database
    const document = await prisma.warrantyDocument.findUnique({
      where: { id: documentId },
      include: { product: true },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, message: "Warranty document not found." },
        { status: 404 }
      );
    }

    // 3. Access control: Admin can download any document; users can download their own
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = document.product?.userId === Number(session.user.id);

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: "Forbidden. You do not have permission to download this document." },
        { status: 403 }
      );
    }

    // 4. Resolve file path on disk
    let relativePath = document.fileUrl;
    if (relativePath.startsWith("/")) {
      relativePath = relativePath.slice(1);
    }
    const filePath = path.join(process.cwd(), "public", relativePath.replace(/^uploads\//, "uploads/"));

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: "Document file not found on server." },
        { status: 404 }
      );
    }

    // 5. Read file buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Determine content type based on file extension
    const ext = path.extname(document.fileName || filePath).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".webp") contentType = "image/webp";

    // 6. Return response with Content-Disposition attachment to trigger download
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${document.fileName || `document-${document.id}${ext}`}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Document download error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to download document." },
      { status: 500 }
    );
  }
}
