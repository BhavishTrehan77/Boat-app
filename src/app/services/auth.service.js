

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

export async function Signup(data) {
  if (data.password) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
  }
  return await prisma.user.create({ data });
}

export async function Login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("user not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("password didnt match");
  }
  const secret = process.env.ACC_KEY || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }
  const AccToken = jwt.sign({ id: user.id, role: user.role }, secret, {
    expiresIn: "2d",
  });

  return {
    AccToken,
  };
}