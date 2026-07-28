import { z } from "zod";

export const RepairValidation = z.object({
    issue: z
        .string({ message: "Issue must be a string" })
        .trim()
        .min(3, { message: "Issue must be at least 3 characters" })
        .max(100, { message: "Issue must not exceed 100 characters" }),

    description: z
        .string({ message: "Description must be a string" })
        .trim()
        .min(10, { message: "Description must be at least 10 characters" })
        .max(500, { message: "Description must not exceed 500 characters" }),

    repairDate: z.coerce.date({
        message: "Repair date is required"
    }),

    cost: z
        .coerce
        .number({ message: "Cost must be a number" })
        .min(0, { message: "Cost cannot be negative" }),

    productId: z
        .coerce
        .number({ message: "Product Id must be a number" })
        .int({ message: "Product Id must be an integer" })
        .positive({ message: "Product Id must be positive" })
});