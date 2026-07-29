import { RepairValidation } from "../../src/app/validators/repair.validator";

describe("Repair validator", () => {
  test("accepts valid repair payload", () => {
    const result = RepairValidation.safeParse({
      issue: "Screen broken",
      description: "Screen is cracked completely needs replacement.",
      repairDate: "2026-07-01",
      cost: 500,
      productId: 1,
    });
    expect(result.success).toBe(true);
  });

  test("rejects issue shorter than 3 characters", () => {
    const result = RepairValidation.safeParse({
      issue: "AB",
      description: "Long enough description to pass min length properly",
      repairDate: "2026-07-01",
      cost: 100,
      productId: 1,
    });
    expect(result.success).toBe(false);
  });

  test("rejects description shorter than 10 characters", () => {
    const result = RepairValidation.safeParse({
      issue: "Not charging",
      description: "Short",
      repairDate: "2026-07-01",
      cost: 100,
      productId: 1,
    });
    expect(result.success).toBe(false);
  });

  test("rejects negative cost", () => {
    const result = RepairValidation.safeParse({
      issue: "Not charging",
      description: "Battery not charging at all",
      repairDate: "2026-07-01",
      cost: -50,
      productId: 1,
    });
    expect(result.success).toBe(false);
  });

  test("rejects non-integer productId", () => {
    const result = RepairValidation.safeParse({
      issue: "Not charging",
      description: "Battery not charging at all",
      repairDate: "2026-07-01",
      cost: 100,
      productId: 1.5,
    });
    expect(result.success).toBe(false);
  });
});
