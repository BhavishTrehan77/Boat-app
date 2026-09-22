import { createRepair, getRepairs } from "@/app/services/repair.service";
import { getProductById } from "@/app/services/product.service";
import { RepairValidation } from "@/app/validators/repair.validator";
import { getAuthSession } from "@/app/lib/session";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const session = await getAuthSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }


    const body = await request.json();
    const validate = RepairValidation.safeParse(body);
    if (!validate.success) {
      return NextResponse.json(
        {
          success: false,
          errors: validate.error.flatten
            ? validate.error.flatten().fieldErrors
            : validate.error,
        },
        { status: 400 }
      );
    }

    // Verify product exists and verify ownership
    const product = await getProductById(validate.data.productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product Not Found" },
        { status: 404 }
      );
    }

    if (
      session.user.role !== "ADMIN" &&
      product.userId !== Number(session.user.id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden. You can only request repairs for your own products.",
        },
        { status: 403 }
      );
    }

    const payload = {
      ...validate.data,
      status: session.user.role === "ADMIN" && validate.data.status ? validate.data.status : "PENDING",
    };
    const data = await createRepair(payload);
    return NextResponse.json(
      {
        success: true,
        data: data,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Repair creation error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to create repair request",
      },
      { status: 400 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getAuthSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }


    // Admins view all repairs; regular users only view their own products' repairs
    const userId = session.user.role === "ADMIN" ? null : session.user.id;
    const data = await getRepairs(userId);

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch repair records",
      },
      { status: 400 }
    );
  }
}