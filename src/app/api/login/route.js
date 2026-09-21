import { NextResponse } from "next/server";

// Custom JWT login has been retired in favor of NextAuth session authentication
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "Custom login is deprecated. Please sign in via NextAuth credentials provider.",
    },
    { status: 410 }
  );
}