"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  PANTRY_CATEGORIES,
  STORAGE_TYPES,
} from "@/contracts/goodco-pantry-mesh.constants";
import { createApprovedCategoryMapping } from "@/lib/categories/review";
import { getPantryContext } from "@/lib/pantry/context";

const approveSchema = z.object({
  eventId: z.string().uuid(),
  barcode: z.string().optional(),
  productName: z.string().optional(),
  category: z.enum(PANTRY_CATEGORIES),
  storageType: z.enum(STORAGE_TYPES),
});

export async function approveCategoryMapping(formData: FormData) {
  const parsed = approveSchema.safeParse({
    eventId: REDACTED"eventId"),
    barcode: REDACTED"barcode") || undefined,
    productName: REDACTED"productName") || undefined,
    category: REDACTED"category"),
    storageType: REDACTED"storageType"),
  });

  if (!parsed.success) return;

  const pantryContext = await getPantryContext();

  if (!pantryContext.userId || !pantryContext.activePantry) return;

  await createApprovedCategoryMapping({
    pantryId: pantryContext.activePantry.id,
    userId: pantryContext.userId,
    eventId: parsed.data.eventId,
    barcode: parsed.data.barcode ?? null,
    productName: parsed.data.productName ?? null,
    category: parsed.data.category,
    storageType: parsed.data.storageType,
  });

  revalidatePath("/review");
}
