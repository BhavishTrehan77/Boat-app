import { Authvalidation, LoginValidation } from "../../src/app/validators/auth.validator";

describe("Auth validators", () => {
  test("Authvalidation accepts a valid signup payload", () => {
    const result = Authvalidation.safeParse({
      name: "Bhavish",
      email: "bhavish@example.com",
      password: "123456",
    });

    expect(result.success).toBe(true);
  });

  test("Authvalidation rejects short names", () => {
    const result = Authvalidation.safeParse({
      name: "Bi",
      email: "bhavish@example.com",
      password: "123456",
    });

    expect(result.success).toBe(false);
  });

  test("LoginValidation rejects invalid emails", () => {
    const result = LoginValidation.safeParse({ email: "not-an-email", password: "123456" });

    expect(result.success).toBe(false);
  });
});
