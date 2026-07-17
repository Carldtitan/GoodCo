import { NextResponse } from "next/server";
import { readServerEnv } from "@/lib/env";
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

  return NextResponse.json({ result });
}
