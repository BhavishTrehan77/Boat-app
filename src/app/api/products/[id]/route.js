import {
  deleteProduct,
  getProductById,
  updateProduct,
} from "@/app/services/product.service";
import { Productvalidation } from "@/app/validators/product.validator";
import { getAuthSession } from "@/app/lib/session";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const session = await getAuthSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product Not Found" },
        { status: 404 }
      );
    }

    // Ownership check: regular user can only view their own product
    if (
      session.user.role !== "ADMIN" &&
      product.userId !== Number(session.user.id)
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden. You do not own this product." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      body: product,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch product" },
      { status: 400 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getAuthSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product Not Found" },
        { status: 404 }
      );
    }

    // Ownership check: regular user can only edit their own product
    if (
      session.user.role !== "ADMIN" &&
      product.userId !== Number(session.user.id)
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden. You do not own this product." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validate = Productvalidation.partial().safeParse(body);
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

    const updatePayload = { ...validate.data };
    // Prevent non-admin users from reassigning product ownership
    if (session.user.role !== "ADMIN" && updatePayload.userId) {
      delete updatePayload.userId;
    }

    const data = await updateProduct(id, updatePayload);
    return NextResponse.json({
      success: true,
      body: data,
    });
  } catch (error) {
    const isConflict = error.message === "Serial Number Already Exists";
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update product" },
      { status: isConflict ? 409 : 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getAuthSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product Not Found" },
        { status: 404 }
      );
    }

    // Ownership check: regular user can only delete their own product
    if (
      session.user.role !== "ADMIN" &&
      product.userId !== Number(session.user.id)
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden. You do not own this product." },
        { status: 403 }
      );
    }

    const data = await deleteProduct(id);
    return NextResponse.json({
      success: true,
      body: data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete product" },
      { status: 400 }
    );
  }
}
