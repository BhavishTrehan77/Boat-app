import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "./auth";

const secret =
  process.env.NEXTAUTH_SECRET ||
  process.env.ACC_KEY ||
  "boat-support-super-secret-jwt-key-2026";

export async function getAuthSession(request) {
  // 1. Try getServerSession
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return session;
    }
  } catch (err) {
    // proceed to getToken fallback
  }

  // 2. Direct cookie JWT extraction via getToken (critical for Next.js 15/16 App Router)
  if (request) {
    try {
      const token = await getToken({ req: request, secret });
      if (token) {
        return {
          user: {
            id: token.id || token.sub,
            name: token.name,
            email: token.email,
            role: token.role || "USER",
          },
        };
      }
    } catch (err) {
      // fallback failed
    }
  }

  return null;
}
