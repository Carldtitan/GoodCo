import { NextResponse } from "next/server";
import { isExportDataset, type ExportDataset } from "@/lib/export/datasets";
import { toCsv } from "@/lib/export/csv";
import { getPantryContext } from "@/lib/pantry/context";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ dataset: string }>;
};

async function loadRows(dataset: ExportDataset, pantryId: string) {
  const supabase = createServiceRoleSupabaseClient();

  switch (dataset) {
    case "products": {
      const { data } = await supabase
        .from("inventory_lots")
        .select("product_id, products(*)")
        .eq("pantry_id", pantryId)
        .limit(1000);
      return (data ?? []).map((row) => {
        const product = Array.isArray(row.products)
          ? row.products[0]
          : row.products;
        return (product ?? {}) as Record<string, unknown>;
      });
    }
    case "lots": {
      const { data } = await supabase
        .from("inventory_lots")
        .select("*")
        .eq("pantry_id", pantryId)
        .limit(1000);
      return data ?? [];
    }
    case "movements": {
      const { data } = await supabase
        .from("inventory_movements")
        .select("*, inventory_lots!inner(pantry_id)")
        .eq("inventory_lots.pantry_id", pantryId)
        .limit(1000);
      return data ?? [];
    }
    case "listings": {
      const { data } = await supabase
        .from("marketplace_listings")
        .select("*")
        .eq("source_pantry_id", pantryId)
        .limit(1000);
      return data ?? [];
    }
    case "requests": {
      const { data } = await supabase
        .from("marketplace_requests")
        .select("*")
        .or(`requesting_pantry_id.eq.${pantryId},source_pantry_id.eq.${pantryId}`)
        .limit(1000);
      return data ?? [];
    }
    case "transfers": {
      const { data } = await supabase
        .from("marketplace_transfers")
        .select("*")
        .or(`source_pantry_id.eq.${pantryId},destination_pantry_id.eq.${pantryId}`)
        .limit(1000);
      return data ?? [];
    }
    case "classification_events": {
      const { data } = await supabase
        .from("classification_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      return data ?? [];
    }
    case "policy_records": {
      const { data } = await supabase
        .from("network_policies")
        .select("*")
        .limit(1000);
      return data ?? [];
    }
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const { dataset } = await context.params;

  if (!isExportDataset(dataset)) {
    return NextResponse.json({ error: "Unknown export" }, { status: 404 });
  }

  const pantryContext = await getPantryContext();

  if (!pantryContext.userId || !pantryContext.activePantry) {
    return NextResponse.json({ error: "Pantry required" }, { status: 401 });
  }

  const rows = await loadRows(dataset, pantryContext.activePantry.id);
  const csv = toCsv(rows as Array<Record<string, unknown>>);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${dataset}.csv"`,
    },
  });
}
