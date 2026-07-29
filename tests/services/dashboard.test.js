import { GetAdminDashboard } from "../../src/app/services/dashboard.services";
import { GetUserDashboard } from "../../src/app/services/User.dashboard";

jest.mock("../../src/app/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      count: jest.fn(),
    },
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    repairHistory: {
      count: jest.fn(),
    },
  },
}));

import prisma from "../../src/app/lib/prisma";

describe("Dashboard services", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("GetAdminDashboard returns all aggregate counts", async () => {
    prisma.user.count.mockResolvedValue(10);
    prisma.product.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    prisma.repairHistory.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2);

    const result = await GetAdminDashboard();

    expect(prisma.user.count).toHaveBeenCalled();
    expect(prisma.product.count).toHaveBeenCalledTimes(3);
    expect(prisma.repairHistory.count).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      totalUsers: 10,
      totalProducts: 3,
      activeWarranty: 2,
      expiredWarranty: 1,
      pendingRepairs: 1,
      completedRepairs: 2,
    });
  });

  test("GetUserDashboard returns correct stats for user products", async () => {
    const now = new Date();
    const products = [
      { id: 1, expiryDate: new Date(now.getTime() + 86400000), repairs: [{ status: "PENDING" }] },
      { id: 2, expiryDate: new Date(now.getTime() - 86400000), repairs: [{ status: "COMPLETED" }] },
    ];
    prisma.product.findMany.mockResolvedValue(products);

    const result = await GetUserDashboard(1);

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { userId: 1 },
      include: { repairs: true },
    });
    expect(result).toEqual({
      totalProducts: 2,
      Warrenties: 1,
      expired: 1,
      pendingRepairs: 1,
      completedRepairs: 1,
    });
  });

  test("GetUserDashboard returns zero stats when user has no products", async () => {
    prisma.product.findMany.mockResolvedValue([]);

    const result = await GetUserDashboard(999);

    expect(result).toEqual({
      totalProducts: 0,
      Warrenties: 0,
      expired: 0,
      pendingRepairs: 0,
      completedRepairs: 0,
    });
  });
});
