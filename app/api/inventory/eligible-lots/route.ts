import { NextResponse } from "next/server";
import { MarketplaceAccessError, requireActivePantry } from "@/lib/marketplace/access";
import { isPublishableEligibleLot, mapEligibleLot } from "@/lib/marketplace/eligibility";
import { createRequestSupabaseClient } from "@/lib/supabase/request";

export async function GET() {
  try {
    const activePantry = await requireActivePantry();
    const supabase = await createRequestSupabaseClient();
    const { data, error } = await supabase
      .from("marketplace_eligible_lots")
      .select("*")
      .eq("pantry_id", activePantry.pantryId)
      .order("move_by", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Could not load eligible inventory." }, { status: 500 });
    }

    const lots = (data ?? []).map(mapEligibleLot).filter(isPublishableEligibleLot);
    return NextResponse.json({ lots });
  } catch (error) {
    if (error instanceof MarketplaceAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not load eligible inventory." }, { status: 500 });
  }
}
