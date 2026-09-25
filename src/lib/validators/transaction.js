import { z } from "zod";

export const transactionSchema = z.object({
    amount: z.coerce.number().positive().max(1_000_000_000),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
    categoryId: z.string().optional().nullable(),
    subCategory: z.string().max(100).optional().nullable(),
    description: z.string().min(1).max(200).trim(),
    reference: z.string().max(100).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
    date: z.coerce.date(),
    receiptUrl: z.string().url().optional().nullable(),
});
