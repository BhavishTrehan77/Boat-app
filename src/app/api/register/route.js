import { Signup } from "@/app/services/auth.service";
import { Authvalidation } from "@/app/validators/auth.validator";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const validate = Authvalidation.safeParse(body);
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

    const signupPayload = {
      ...validate.data,
      role: validate.data.role || "USER",
    };
    const data = await Signup(signupPayload);

    // Security best practice: omit hashed password from response
    // eslint-disable-next-line no-unused-vars
    const { password, ...safeUser } = data;

    return NextResponse.json(
      {
        success: true,
        body: safeUser,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    const isDuplicate =
      err.code === "P2002" || err.message?.includes("Unique constraint");
    return NextResponse.json(
      {
        success: false,
        message: isDuplicate
          ? "An account with this email already exists"
          : err.message || "Registration failed",
      },
      { status: isDuplicate ? 409 : 400 }
    );
  }
}