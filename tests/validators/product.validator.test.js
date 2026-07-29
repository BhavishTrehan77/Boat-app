import { Productvalidation } from "../../src/app/validators/product.validator";

describe("Product validator", () => {
  test("accepts valid product payload", () => {
    const result = Productvalidation.safeParse({
      productName: "BOAT Airdopes 141",
      searialNumber: "BOAT-12345",
      purchaseDate: "2026-01-01",
      warrantyMonths: 12,
      userId: 1,
    });
    expect(result.success).toBe(true);
  });

  test("rejects short productName", () => {
    const result = Productvalidation.safeParse({
      productName: "A",
      searialNumber: "BOAT-12345",
      purchaseDate: "2026-01-01",
      warrantyMonths: 12,
      userId: 1,
    });
    expect(result.success).toBe(false);
  });

  test("rejects short searialNumber", () => {
    const result = Productvalidation.safeParse({
      productName: "BOAT Airdopes",
      searialNumber: "A1",
      purchaseDate: "2026-01-01",
      warrantyMonths: 12,
      userId: 1,
    });
    expect(result.success).toBe(false);
  });

  test("rejects zero or negative warrantyMonths", () => {
    const result = Productvalidation.safeParse({
      productName: "BOAT Airdopes",
      searialNumber: "BOAT-12345",
      purchaseDate: "2026-01-01",
      warrantyMonths: 0,
      userId: 1,
    });
    expect(result.success).toBe(false);
  });

  test("rejects negative userId", () => {
    const result = Productvalidation.safeParse({
      productName: "BOAT Airdopes",
      searialNumber: "BOAT-12345",
      purchaseDate: "2026-01-01",
      warrantyMonths: 12,
      userId: -1,
    });
    expect(result.success).toBe(false);
  });
});
