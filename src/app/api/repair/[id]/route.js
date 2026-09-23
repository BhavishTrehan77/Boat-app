import {
  deleteRepair,
  getRepairById,
  updateRepair,
} from "@/app/services/repair.service";
import { RepairValidation } from "@/app/validators/repair.validator";
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
    const repair = await getRepairById(id);
    if (!repair) {
      return NextResponse.json(
        { success: false, message: "Repair not found" },
        { status: 404 }
      );
    }

    // Ownership check: regular user can only view their own repairs
    if (
      session.user.role !== "ADMIN" &&
      repair.product?.userId !== Number(session.user.id)
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden. You do not own this repair ticket." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: repair,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch repair ticket",
      },
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
    const repair = await getRepairById(id);
    if (!repair) {
      return NextResponse.json(
        { success: false, message: "Repair not found" },
        { status: 404 }
      );
    }

    // Ownership check: regular user can only edit their own product's repair
    if (
      session.user.role !== "ADMIN" &&
      repair.product?.userId !== Number(session.user.id)
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden. You do not own this repair ticket." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validate = RepairValidation.partial().safeParse(body);
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

    // If status is being updated (PENDING -> IN_PROGRESS -> COMPLETED), verify Admin role
    if (body.status) {
      if (session.user.role !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            message: "Forbidden. Only administrators can update repair status.",
          },
          { status: 403 }
        );
      }
      const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updatePayload.status = body.status;
    }

    const data = await updateRepair(id, updatePayload);
    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to update repair ticket",
      },
      { status: 400 }
    );
  }
}

export const PUT = PATCH;

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
    const repair = await getRepairById(id);
    if (!repair) {
      return NextResponse.json(
        { success: false, message: "Repair not found" },
        { status: 404 }
      );
    }

    // Ownership check: regular user can only delete their own repair ticket
    if (
      session.user.role !== "ADMIN" &&
      repair.product?.userId !== Number(session.user.id)
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden. You do not own this repair ticket." },
        { status: 403 }
      );
    }

    const data = await deleteRepair(id);
    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to delete repair ticket",
      },
      { status: 400 }
    );
  }
}