import { GetAdminDashboard } from "@/app/services/dashboard.services";
import { getAuthSession } from "@/app/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
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
        { success: false, message: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const data = await GetAdminDashboard();
    return NextResponse.json({
      success: true,
      body: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch dashboard metrics",
      },
      { status: 400 }
    );
  }
}