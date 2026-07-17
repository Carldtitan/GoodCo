import { NextResponse } from "next/server";
import { z } from "zod";
import { readServerEnv } from "@/lib/env";
import { parseReceivingWithFireworks } from "@/lib/llm/fireworks";

const fallbackParseSchema = z.object({
  barcode: z.string().optional().nullable(),
  productName: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  externalCategory: z.string().optional().nullable(),
  dateRawText: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const body = fallbackParseSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ result: null }, { status: 400 });
  }

  const env = readServerEnv();
  const result = await parseReceivingWithFireworks(body.data, {
    apiKey: env.fireworksApiKey,
    model: env.fireworksModel,
  });

  if (!result.ok) {
    return NextResponse.json({ result: null, reason: result.reason });
  }

  return NextResponse.json({ result: result.draft });
}
