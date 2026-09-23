import { getWarrantyBySerial } from "@/app/services/warranty.service";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { serial } = await params;
    const product = await getWarrantyBySerial(decodeURIComponent(serial));
    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Product not found",
      },
      { status: 404 }
    );
  }
}
