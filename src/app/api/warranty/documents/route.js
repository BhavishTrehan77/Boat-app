import { getAllWarrantyDocuments } from "@/app/services/upload.services";
import { getAuthSession } from "@/app/lib/session";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (session.user.role === "ADMIN") {
      // Admins see all documents across all users
      const documents = await getAllWarrantyDocuments();
      return NextResponse.json({ success: true, body: documents });
    } else {
      // Regular users only see documents for their products
      const documents = await prisma.warrantyDocument.findMany({
        where: {
          product: {
            userId: Number(session.user.id),
          },
        },
        include: {
          product: true,
        },
        orderBy: { uploadedAt: "desc" },
      });
      return NextResponse.json({ success: true, body: documents });
    }
  } catch (error) {
    console.error("Fetch warranty documents error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch documents." },
      { status: 500 }
    );
  }
}
