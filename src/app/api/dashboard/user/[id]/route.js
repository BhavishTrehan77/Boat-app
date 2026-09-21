import { GetUserDashboard } from "@/app/services/User.dashboard";
import { getAuthSession } from "@/app/lib/session";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Secure user dashboard: identity must match session user or be Admin
    if (
      session.user.role !== "ADMIN" &&
      Number(session.user.id) !== Number(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden. You can only access your own user dashboard.",
        },
        { status: 403 }
      );
    }

    const data = await GetUserDashboard(id);
    return NextResponse.json({
      success: true,
      body: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch user dashboard",
      },
      { status: 400 }
    );
  }
}