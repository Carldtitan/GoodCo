import Link from "next/link";
import { PublishListingForm } from "@/components/publish-listing-form";
import { MarketplaceAccessError, requireActivePantry, requireMarketplaceManager } from "@/lib/marketplace/access";
import { isPublishableEligibleLot, mapEligibleLot } from "@/lib/marketplace/eligibility";
import { createRequestSupabaseClient } from "@/lib/supabase/request";

export default async function NewMarketplaceListingPage() {
  try {
    const activePantry = await requireActivePantry();
    requireMarketplaceManager(activePantry);
    const supabase = await createRequestSupabaseClient();
    const { data, error } = await supabase
      .from("marketplace_eligible_lots")
      .select("*")
      .eq("pantry_id", activePantry.pantryId)
      .order("move_by", { ascending: true });

    if (error) throw new Error("Could not load eligible inventory.");

    const lots = (data ?? []).map(mapEligibleLot).filter(isPublishableEligibleLot);
    return (
      <section className="py-5">
        <h1 className="text-xl font-semibold tracking-tight">Publish listing</h1>
        <PublishListingForm lots={lots} />
      </section>
    );
  } catch (error) {
    const message = error instanceof MarketplaceAccessError ? error.message : "Could not load eligible inventory.";
    return (
      <section className="py-5">
        <h1 className="text-xl font-semibold tracking-tight">Publish listing</h1>
        <p className="mt-6 border-y border-border py-8 text-center text-sm text-muted">{message}</p>
        {error instanceof MarketplaceAccessError && error.status === 401 ? (
          <Link className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" href="/sign-in">
            Sign in
          </Link>
        ) : null}
      </section>
    );
  }
}
