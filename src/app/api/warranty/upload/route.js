import { UploadWarrantyPDF } from "@/app/services/upload.services";
import { getAuthSession } from "@/app/lib/session";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden. Only administrators can upload warranty documents.",
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") || formData.get("pdf");
    const productId = formData.get("productId");

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "PDF file is required.",
        },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "productId is required.",
        },
        { status: 400 }
      );
    }

    const document = await UploadWarrantyPDF(file, productId);

    return NextResponse.json(
      {
        success: true,
        body: document,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Warranty PDF upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to upload warranty document.",
      },
      { status: 400 }
    );
  }
}
