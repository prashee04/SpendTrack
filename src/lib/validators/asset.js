import { z } from "zod";

export const assetSchema = z.object({
    name: z.string().min(1).max(100).trim(),
    type: z.string().min(1).max(50),
    value: z.coerce.number().min(0).max(1_000_000_000_000),
    purchaseValue: z.coerce.number().min(0).optional().nullable(),
    purchaseDate: z.coerce.date().optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
});
