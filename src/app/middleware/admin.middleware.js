import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function AdminMiddleware(request) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authorization header is missing"
                },
                {
                    status: 401
                }
            );
        }

        if (!authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid authorization format"
                },
                {
                    status: 401
                }
            );
        }

        const token = authHeader.split(" ")[1];

        const secret = process.env.ACC_KEY || process.env.NEXTAUTH_SECRET;
        if (!secret) {
            return NextResponse.json(
                {
                    success: false,
                    message: "JWT secret is not configured"
                },
                {
                    status: 500
                }
            );
        }

        const decoded = jwt.verify(token, secret);

        if (decoded.role !== "ADMIN") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Access Denied. Admin only."
                },
                {
                    status: 403
                }
            );
        }

        return NextResponse.next();

    } catch (err) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid or Expired Token"
            },
            {
                status: 401
            }
        );
    }
}