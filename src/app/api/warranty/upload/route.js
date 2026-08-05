import { UploadWarrantyPDF } from "@/app/services/upload.services";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Get file (supports 'file' or 'pdf' form field names)
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
        error: error.message,
      },
      { status: 400 }
    );
  }
}
