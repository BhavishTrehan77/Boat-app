import { createProduct, getProducts } from "@/app/services/product.service";
import { Productvalidation } from "@/app/validators/product.validator";
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
    const validate = Productvalidation.safeParse(body);
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

    const productPayload = { ...validate.data };

    // Standard users can only create products for themselves; Admin can assign to a user
    if (session.user.role === "ADMIN" && productPayload.userId) {
      productPayload.userId = Number(productPayload.userId);
    } else {
      productPayload.userId = Number(session.user.id);
    }

    const data = await createProduct(productPayload);
    return NextResponse.json(
      {
        success: true,
        body: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product creation error:", error);
    const isConflict = error.message === "Serial Number Already Exists";
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create product",
      },
      { status: isConflict ? 409 : 400 }
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


    // Admins see all products; regular users only see their own
    const userId = session.user.role === "ADMIN" ? null : session.user.id;
    const data = await getProducts(userId);

    return NextResponse.json({
      success: true,
      body: data,
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch products",
      },
      { status: 400 }
    );
  }
}
