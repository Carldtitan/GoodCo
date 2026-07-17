import { NextResponse } from "next/server";
import { z } from "zod";
import {
  DATE_LABEL_TYPES,
  PANTRY_CATEGORIES,
  SOURCE_TYPES,
  STORAGE_TYPES,
  UNITS,
} from "@/contracts/goodco-pantry-mesh.constants";
import { getPantryContext } from "@/lib/pantry/context";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

const receiveSchema = z.object({
  product: z.object({
    barcode: z.string().nullable(),
    name: z.string().min(1),
    brand: z.string().nullable(),
    packageSize: z.string().nullable(),
    ingredients: z.string().nullable(),
    allergens: z.array(z.string()),
    source: z.enum(["open_food_facts", "usda_fdc", "manual"]),
    openFoodFactsCategories: z.array(z.string()),
    fdcFoodCategory: z.string().nullable(),
    suggestedCategory: z.enum(PANTRY_CATEGORIES),
    categorySource: z.string(),
    categoryConfidence: z.number().min(0).max(1),
  }),
  lot: z.object({
    itemName: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.enum(UNITS),
    category: z.enum(PANTRY_CATEGORIES),
    subcategory: z.string().nullable(),
    storageType: z.enum(STORAGE_TYPES),
    sourceType: z.enum(SOURCE_TYPES),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    dateLabelType: z.enum(DATE_LABEL_TYPES),
    dateRawText: z.string().nullable(),
    dateVoiceTranscript: z.string().nullable(),
    dateSource: z
      .enum(["gs1_barcode", "ocr", "voice", "llm_parse", "manual", "default_rule"])
      .nullable(),
    dateConfidence: z.number().min(0).max(1).nullable(),
    redistributionAllowed: z.boolean(),
  }),
});

function dateColumns(
  date: string | null,
  labelType: z.infer<typeof receiveSchema>["lot"]["dateLabelType"],
) {
  return {
    best_by: labelType === "best_by" ? date : null,
    use_by: labelType === "use_by" ? date : null,
    sell_by: labelType === "sell_by" ? date : null,
    expiration_date: labelType === "expires" ? date : null,
    production_date: labelType === "produced_on" ? date : null,
    packaging_date: labelType === "packed_on" ? date : null,
    move_by: labelType === "unknown" ? date : null,
  };
}

export async function POST(request: Request) {
  const parsed = receiveSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid receiving draft" }, { status: 400 });
  }

  const pantryContext = await getPantryContext();

  if (!pantryContext.userId || !pantryContext.activePantry) {
    return NextResponse.json({ error: "Pantry required" }, { status: 401 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { product, lot } = parsed.data;

  const { data: productRow, error: productError } = await supabase
    .from("products")
    .insert({
      barcode: product.barcode,
      name: lot.itemName,
      brand: product.brand,
      package_size: product.packageSize,
      category: lot.category,
      subcategory: lot.subcategory,
      storage_type: lot.storageType,
      ingredients: product.ingredients,
      allergens: product.allergens,
      source: product.source,
      open_food_facts_categories: product.openFoodFactsCategories,
      fdc_food_category: product.fdcFoodCategory,
    })
    .select("id")
    .single();

  if (productError || !productRow) {
    return NextResponse.json({ error: "Product save failed" }, { status: 500 });
  }

  const { data: lotRow, error: lotError } = await supabase
    .from("inventory_lots")
    .insert({
      product_id: productRow.id,
      pantry_id: pantryContext.activePantry.id,
      quantity_on_hand: lot.quantity,
      quantity_reserved: 0,
      unit: lot.unit,
      source_type: lot.sourceType,
      ...dateColumns(lot.date, lot.dateLabelType),
      date_label_type: lot.dateLabelType,
      date_raw_text: lot.dateRawText,
      date_voice_transcript: lot.dateVoiceTranscript,
      date_source: lot.dateSource,
      date_confidence: lot.dateConfidence,
      date_review_status: lot.date ? "confirmed" : "missing",
      storage_type: lot.storageType,
      tefap_flag: false,
      redistribution_allowed: lot.redistributionAllowed,
      confidence: product.categoryConfidence,
      review_status: "confirmed",
    })
    .select("id")
    .single();

  if (lotError || !lotRow) {
    return NextResponse.json({ error: "Lot save failed" }, { status: 500 });
  }

  await supabase.from("inventory_movements").insert({
    lot_id: lotRow.id,
    movement_type: "receiving",
    quantity_delta: lot.quantity,
    unit: lot.unit,
    actor_id: pantryContext.userId,
    note: "Received",
  });

  await supabase.from("classification_events").insert({
    input_type: "receiving",
    barcode: product.barcode,
    product_name: product.name,
    suggested_category: product.suggestedCategory,
    final_category: lot.category,
    suggested_subcategory: null,
    final_subcategory: lot.subcategory,
    model_or_rule_used: product.categorySource,
    confidence: product.categoryConfidence,
    was_corrected: product.suggestedCategory !== lot.category,
    corrected_by:
      product.suggestedCategory !== lot.category ? pantryContext.userId : null,
  });

  if (lot.dateRawText || lot.dateVoiceTranscript) {
    await supabase.from("extraction_jobs").insert({
      input_type: lot.dateSource ?? "manual",
      extracted_json: {
        normalizedDate: lot.date,
        labelType: lot.dateLabelType,
        rawText: lot.dateRawText,
        transcript: lot.dateVoiceTranscript,
      },
      confidence: lot.dateConfidence,
      status: lot.date ? "completed" : "needs_review",
    });
  }

  return NextResponse.json({
    result: {
      productId: productRow.id,
      lotId: lotRow.id,
    },
  });
}
