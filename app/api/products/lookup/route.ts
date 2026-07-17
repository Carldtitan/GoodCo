import { NextResponse } from "next/server";
import { loadCategoryMappings } from "@/lib/categories/memory";
import { resolvePantryCategory } from "@/lib/categories/taxonomy";
import { readServerEnv } from "@/lib/env";
import { getPantryContext } from "@/lib/pantry/context";
import { lookupProductByBarcode } from "@/lib/products/lookup";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const barcode = url.searchParams.get("barcode") ?? "";

  if (!barcode.trim()) {
    return NextResponse.json(
      { error: "Barcode required" },
      { status: 400 },
    );
  }

  const env = readServerEnv();
  const result = await lookupProductByBarcode(barcode, {
    usdaApiKey: env.usdaFdcApiKey,
  });

  if (!result.found) {
    return NextResponse.json({ result });
  }

  const pantryContext = await getPantryContext();
  const mappings = await loadCategoryMappings({
    pantryId: pantryContext.activePantry?.id,
    networkId: pantryContext.activePantry?.networkId,
  });
  const category = resolvePantryCategory(
    {
      barcode: result.barcode,
      productName: result.name,
      brand: result.brand,
      externalCategory: result.categoryText,
      storageType: result.storageType,
    },
    mappings,
  );

  return NextResponse.json({
    result: {
      ...result,
      pantryCategory: category.category,
      subcategory: category.subcategory,
      categoryStorageType: category.storageType,
      categoryConfidence: category.confidence,
      categorySource: category.source,
      categoryMatchedBy: category.matchedBy,
    },
  });
}
