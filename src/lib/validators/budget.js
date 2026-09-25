import { z } from "zod";

export const budgetSchema = z.object({
    categoryId: z.string(),
    amount: z.coerce.number().positive().max(1_000_000_000),
    month: z.coerce.date(),
});
