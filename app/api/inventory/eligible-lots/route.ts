import { NextResponse } from "next/server";
import {
  mapEligibleLotRow,
  type EligibleLotRow,
} from "@/lib/inventory/eligibility";
import { getPantryContext } from "@/lib/pantry/context";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const pantryContext = await getPantryContext();

  if (!pantryContext.userId || !pantryContext.activePantry) {
    return NextResponse.json({ error: "Pantry required" }, { status: 401 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("marketplace_eligible_lots")
    .select("*")
    .eq("pantry_id", pantryContext.activePantry.id)
    .returns<EligibleLotRow[]>();

  if (error) {
    return NextResponse.json({ error: "Eligible lots failed" }, { status: 500 });
  }

  return NextResponse.json({
    result: (data ?? []).map(mapEligibleLotRow),
  });
}
