import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("../../src/app/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import prisma from "../../src/app/lib/prisma";
import { Signup, Login, Forgot } from "../../src/app/services/auth.service";

describe("Auth service", () => {
  beforeEach(() => {
    process.env.ACC_KEY = "test-secret";
    jest.resetAllMocks();
    jwt.sign.mockReturnValue("fake_token");
  });

  describe("Signup", () => {
    test("should hash password and create user", async () => {
      const hashed = "hashed_password";
      bcrypt.hash.mockResolvedValue(hashed);
      prisma.user.create.mockResolvedValue({ id: 1, name: "Bhavish", email: "b@e.com", password: hashed });

      const result = await Signup({ name: "Bhavish", email: "b@e.com", password: "123456" });

      expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { name: "Bhavish", email: "b@e.com", password: hashed },
      });
      expect(result.id).toBe(1);
    });

    test("should not hash if password is missing", async () => {
      prisma.user.create.mockResolvedValue({ id: 1, name: "Bhavish", email: "b@e.com" });

      await Signup({ name: "Bhavish", email: "b@e.com" });

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { name: "Bhavish", email: "b@e.com" },
      });
    });
  });

  describe("Login", () => {
    test("should return token when credentials are correct", async () => {
      const user = { id: 1, name: "Bhavish", email: "b@e.com", password: "hashed", role: "USER" };
      prisma.user.findUnique.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      const result = await Login("b@e.com", "123456");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "b@e.com" } });
      expect(bcrypt.compare).toHaveBeenCalledWith("123456", "hashed");
      expect(jwt.sign).toHaveBeenCalledWith({ id: 1, role: "USER" }, "test-secret", { expiresIn: "2d" });
      expect(result).toEqual({ AccToken: "fake_token" });
    });

    test("should throw when user is not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(Login("unknown@e.com", "123456")).rejects.toThrow("user not found");
    });

    test("should throw when password does not match", async () => {
      const user = { id: 1, email: "b@e.com", password: "hashed" };
      prisma.user.findUnique.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      await expect(Login("b@e.com", "wrong")).rejects.toThrow("password didnt match");
    });
  });

  describe("Forgot", () => {
    test("should return reset token for existing user", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, email: "b@e.com" });
      prisma.user.update.mockResolvedValue({ id: 1 });

      const result = await Forgot("b@e.com");

      expect(result.resetToken).toBeDefined();
      expect(result.resetToken.length).toBeGreaterThan(0);
      expect(prisma.user.update).toHaveBeenCalled();
    });

    test("should throw when user is not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(Forgot("unknown@e.com")).rejects.toThrow("error coming");
    });
  });
});
