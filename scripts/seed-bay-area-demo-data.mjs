import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const ADMIN_NETWORK_ID = "9b75fa8d-4d26-4a0c-8d51-9fb6a0e1a111";
const ADMIN_PANTRY_ID = "73fe61fe-3f74-4ec4-97b1-8232fd994111";
const SEED_PREFIX = "DEMO-BAY";

function loadEnv() {
  const env = {};
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index >= 0) env[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return env;
}

function uuidFromSlug(slug) {
  const hash = createHash("sha256").update(`goodco:${slug}`).digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `5${hash.slice(13, 16)}`,
    `${(Number.parseInt(hash.slice(16, 18), 16) & 0x3f | 0x80).toString(16)}${hash.slice(18, 20)}`,
    hash.slice(20, 32),
  ].join("-");
}

function dateAfter(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function timestampAfter(days, hour) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
}

const sourcePages = [
  "https://www.sfmfoodbank.org/find-food/",
  "https://www.stanthonysf.org/",
  "https://www.cityhopesf.org/",
  "https://berkeleyfoodnetwork.org/",
  "https://www.cityteam.org/oakland/",
  "https://samaritanhousesanmateo.org/",
  "https://www.sacredheartcs.org/",
  "https://www.wvcommunityservices.org/",
  "https://www.rittercenter.org/",
  "https://www.monumentcrisiscenter.org/",
  "https://www.canv.org/food-bank",
  "https://refb.org/",
  "https://faithfoodfridays.com/",
  "https://www.shfb.org/impact/our-work/partner-agencies/",
  "https://www.accfb.org/about-us/food-distribution/",
];

const pantries = [
  {
    slug: "st-anthony-foundation",
    name: "St. Anthony Foundation",
    county: "San Francisco",
    address: "San Francisco, CA",
    lat: 37.7821,
    lng: -122.4131,
    storage: ["dry", "refrigerated", "frozen", "ambient_short_shelf_life"],
    source: "https://www.stanthonysf.org/",
  },
  {
    slug: "city-hope-sf",
    name: "City Hope SF",
    county: "San Francisco",
    address: "San Francisco, CA",
    lat: 37.7849,
    lng: -122.4204,
    storage: ["dry", "refrigerated", "ambient_short_shelf_life"],
    source: "https://www.cityhopesf.org/",
  },
  {
    slug: "berkeley-food-network",
    name: "Berkeley Food Network",
    county: "Alameda",
    address: "Berkeley, CA",
    lat: 37.8703,
    lng: -122.2948,
    storage: ["dry", "refrigerated", "frozen", "ambient_short_shelf_life"],
    source: "https://berkeleyfoodnetwork.org/",
  },
  {
    slug: "cityteam-oakland",
    name: "CityTeam Oakland",
    county: "Alameda",
    address: "Oakland, CA",
    lat: 37.8007,
    lng: -122.276,
    storage: ["dry", "refrigerated", "frozen"],
    source: "https://www.cityteam.org/oakland/",
  },
  {
    slug: "samaritan-house-san-mateo",
    name: "Samaritan House San Mateo",
    county: "San Mateo",
    address: "San Mateo, CA",
    lat: 37.563,
    lng: -122.3255,
    storage: ["dry", "refrigerated", "frozen", "ambient_short_shelf_life"],
    source: "https://samaritanhousesanmateo.org/",
  },
  {
    slug: "sacred-heart-community-service",
    name: "Sacred Heart Community Service",
    county: "Santa Clara",
    address: "San Jose, CA",
    lat: 37.3195,
    lng: -121.878,
    storage: ["dry", "refrigerated", "ambient_short_shelf_life"],
    source: "https://www.sacredheartcs.org/",
  },
  {
    slug: "west-valley-community-services",
    name: "West Valley Community Services",
    county: "Santa Clara",
    address: "Cupertino, CA",
    lat: 37.323,
    lng: -122.047,
    storage: ["dry", "refrigerated", "frozen"],
    source: "https://www.wvcommunityservices.org/",
  },
  {
    slug: "ritter-center",
    name: "Ritter Center",
    county: "Marin",
    address: "San Rafael, CA",
    lat: 37.9735,
    lng: -122.5311,
    storage: ["dry", "refrigerated", "ambient_short_shelf_life"],
    source: "https://www.rittercenter.org/",
  },
  {
    slug: "monument-crisis-center",
    name: "Monument Crisis Center",
    county: "Contra Costa",
    address: "Concord, CA",
    lat: 37.9779,
    lng: -122.0311,
    storage: ["dry", "refrigerated", "frozen", "ambient_short_shelf_life"],
    source: "https://www.monumentcrisiscenter.org/",
  },
  {
    slug: "canv-food-bank",
    name: "Community Action Napa Valley Food Bank",
    county: "Napa",
    address: "Napa, CA",
    lat: 38.2975,
    lng: -122.2869,
    storage: ["dry", "refrigerated", "frozen"],
    source: "https://www.canv.org/food-bank",
  },
  {
    slug: "redwood-empire-food-bank",
    name: "Redwood Empire Food Bank",
    county: "Sonoma",
    address: "Santa Rosa, CA",
    lat: 38.511,
    lng: -122.789,
    storage: ["dry", "refrigerated", "frozen", "ambient_short_shelf_life"],
    source: "https://refb.org/",
  },
  {
    slug: "faith-food-fridays",
    name: "Faith Food Fridays",
    county: "Solano",
    address: "Vallejo, CA",
    lat: 38.101,
    lng: -122.248,
    storage: ["dry", "refrigerated", "frozen"],
    source: "https://faithfoodfridays.com/",
  },
];

const catalog = [
  { slug: "gala-apples", name: "Gala apples", category: "produce", subcategory: "fresh fruit", storage: "ambient_short_shelf_life", unit: "lb", baseQuantity: 240, sourceType: "retail_rescue", dateLabel: "best_by", dateDays: 4 },
  { slug: "romaine-hearts", name: "Romaine hearts", category: "produce", subcategory: "leafy greens", storage: "refrigerated", unit: "case", baseQuantity: 18, sourceType: "retail_rescue", dateLabel: "use_by", dateDays: 3 },
  { slug: "whole-milk-gallons", name: "Whole milk gallons", category: "dairy", subcategory: "milk", storage: "refrigerated", unit: "gal", baseQuantity: 64, sourceType: "food_bank", dateLabel: "use_by", dateDays: 7 },
  { slug: "eggs-dozen", name: "Large eggs, dozen packs", category: "eggs", subcategory: "shell eggs", storage: "refrigerated", unit: "case", baseQuantity: 22, sourceType: "food_bank", dateLabel: "best_by", dateDays: 14 },
  { slug: "frozen-chicken", name: "Frozen chicken thighs", category: "poultry", subcategory: "frozen protein", storage: "frozen", unit: "case", baseQuantity: 16, sourceType: "food_bank", dateLabel: "expires", dateDays: 45 },
  { slug: "black-beans", name: "Canned black beans", category: "canned_beans", subcategory: "beans", storage: "dry", unit: "case", baseQuantity: 32, sourceType: "food_bank", dateLabel: "best_by", dateDays: 180 },
  { slug: "brown-rice", name: "Brown rice, 2 lb bags", category: "grains_and_rice", subcategory: "rice", storage: "dry", unit: "case", baseQuantity: 28, sourceType: "purchased", dateLabel: "best_by", dateDays: 240 },
  { slug: "penne-pasta", name: "Penne pasta", category: "pasta_and_noodles", subcategory: "dry pasta", storage: "dry", unit: "case", baseQuantity: 30, sourceType: "food_bank", dateLabel: "best_by", dateDays: 220 },
  { slug: "oat-cereal", name: "Oat cereal boxes", category: "cereal_and_breakfast", subcategory: "cereal", storage: "dry", unit: "case", baseQuantity: 24, sourceType: "direct_donation", dateLabel: "best_by", dateDays: 120 },
  { slug: "peanut-butter", name: "Peanut butter jars", category: "plant_protein", subcategory: "nut butter", storage: "dry", unit: "case", baseQuantity: 26, sourceType: "food_bank", dateLabel: "best_by", dateDays: 200 },
  { slug: "diapers-size-4", name: "Diapers, size 4", category: "diapers_and_baby_supplies", subcategory: "diapers", storage: "dry", unit: "case", baseQuantity: 20, sourceType: "direct_donation", dateLabel: "unknown", dateDays: null },
  { slug: "shampoo", name: "Family-size shampoo", category: "hygiene", subcategory: "personal care", storage: "dry", unit: "case", baseQuantity: 18, sourceType: "direct_donation", dateLabel: "unknown", dateDays: null },
  { slug: "prepared-turkey-meals", name: "Prepared turkey meals", category: "prepared_meals", subcategory: "ready meals", storage: "refrigerated", unit: "each", baseQuantity: 96, sourceType: "retail_rescue", dateLabel: "use_by", dateDays: 2 },
  { slug: "frozen-vegetables", name: "Frozen mixed vegetables", category: "frozen_food", subcategory: "vegetables", storage: "frozen", unit: "case", baseQuantity: 24, sourceType: "food_bank", dateLabel: "best_by", dateDays: 90 },
  { slug: "infant-formula", name: "Infant formula cans", category: "infant_formula", subcategory: "formula", storage: "dry", unit: "case", baseQuantity: 8, sourceType: "food_bank", dateLabel: "expires", dateDays: 75 },
  { slug: "tomato-sauce", name: "Tomato sauce cans", category: "condiments_and_sauces", subcategory: "sauce", storage: "dry", unit: "case", baseQuantity: 30, sourceType: "food_bank", dateLabel: "best_by", dateDays: 210 },
];

function productRows() {
  return catalog.map((item) => ({
    id: uuidFromSlug(`product:${item.slug}`),
    barcode: null,
    name: item.name,
    brand: null,
    package_size: null,
    category: item.category,
    subcategory: item.subcategory,
    storage_type: item.storage,
    ingredients: null,
    allergens: item.slug === "peanut-butter" ? ["peanuts"] : [],
    source: "manual",
    open_food_facts_categories: [],
    fdc_food_category: null,
    updated_at: new Date().toISOString(),
  }));
}

function pantryRows() {
  return pantries.map((pantry) => ({
    id: uuidFromSlug(`pantry:${pantry.slug}`),
    network_id: ADMIN_NETWORK_ID,
    name: pantry.name,
    county: pantry.county,
    address: pantry.address,
    lat: pantry.lat,
    lng: pantry.lng,
    contact_name: "GoodCo demo seed",
    contact_phone: null,
    approved_status: "approved",
    storage_capabilities: pantry.storage,
    updated_at: new Date().toISOString(),
  }));
}

function inventoryAndListings() {
  const lots = [];
  const movements = [];
  const listings = [];
  const productIdBySlug = new Map(catalog.map((item) => [item.slug, uuidFromSlug(`product:${item.slug}`)]));

  for (const [pantryIndex, pantry] of pantries.entries()) {
    const pantryId = uuidFromSlug(`pantry:${pantry.slug}`);
    const start = (pantryIndex * 3) % catalog.length;
    const items = Array.from({ length: 12 }, (_, offset) => catalog[(start + offset) % catalog.length]);

    for (const [itemIndex, item] of items.entries()) {
      const lotId = uuidFromSlug(`lot:${pantry.slug}:${item.slug}`);
      const quantity = item.baseQuantity + pantryIndex * 3 + itemIndex * 2;
      const listable = itemIndex < 9;
      const tefap = itemIndex === 10;
      const dateValue = item.dateDays == null ? null : dateAfter(item.dateDays + (pantryIndex % 4));
      const lot = {
        id: lotId,
        product_id: productIdBySlug.get(item.slug),
        pantry_id: pantryId,
        quantity_on_hand: quantity,
        quantity_reserved: 0,
        unit: item.unit,
        source_type: item.sourceType,
        received_at: timestampAfter(-1 * ((itemIndex % 5) + 1), 18),
        best_by: item.dateLabel === "best_by" ? dateValue : null,
        use_by: item.dateLabel === "use_by" ? dateValue : null,
        sell_by: null,
        expiration_date: item.dateLabel === "expires" ? dateValue : null,
        production_date: null,
        packaging_date: null,
        move_by: item.storage === "dry" && item.dateDays !== null ? dateAfter(Math.min(item.dateDays, 45)) : dateValue,
        date_label_type: item.dateLabel,
        date_raw_text: dateValue ? `${item.dateLabel.replaceAll("_", " ").toUpperCase()} ${dateValue}` : null,
        date_voice_transcript: null,
        date_source: dateValue ? "manual" : null,
        date_confidence: dateValue ? 1 : null,
        date_review_status: dateValue ? "confirmed" : "not_applicable",
        lot_code: `${SEED_PREFIX}-${pantry.slug.toUpperCase().slice(0, 6)}-${itemIndex + 1}`,
        storage_type: item.storage,
        tefap_flag: tefap,
        redistribution_allowed: listable && !tefap,
        confidence: 0.96,
        review_status: "confirmed",
        updated_at: new Date().toISOString(),
      };
      lots.push(lot);
      movements.push({
        lot_id: lotId,
        movement_type: "receiving",
        quantity_delta: quantity,
        unit: item.unit,
        actor_id: null,
        note: `Seeded Bay Area demo receipt from ${pantry.name}`,
      });

      if (itemIndex < 6) {
        const listedQuantity = Math.max(1, Math.floor(quantity * 0.45));
        listings.push({
          id: uuidFromSlug(`listing:${pantry.slug}:${item.slug}`),
          lot_id: lotId,
          source_pantry_id: pantryId,
          item_name: item.name,
          category: item.category,
          subcategory: item.subcategory,
          quantity_listed: listedQuantity,
          quantity_available: listedQuantity,
          unit: item.unit,
          storage_type: item.storage,
          best_by: lot.best_by,
          expiration_date: lot.expiration_date,
          move_by: lot.move_by,
          pickup_window_start: timestampAfter(1 + (itemIndex % 2), 16),
          pickup_window_end: timestampAfter(3 + (itemIndex % 3), 23),
          photo_url: null,
          status: "active",
          approval_mode: itemIndex % 3 === 0 ? "auto_approve" : "source_pantry_approval",
          price_cents: 0,
          payment_required: false,
          restriction_status: "none",
          updated_at: new Date().toISOString(),
        });
      }
    }
  }

  return { lots, movements, listings };
}

async function findSeededLotIds(supabase) {
  const seedPantryIds = pantries.map((pantry) => uuidFromSlug(`pantry:${pantry.slug}`));
  const { data, error } = await supabase
    .from("inventory_lots")
    .select("id")
    .in("pantry_id", seedPantryIds);
  if (error) throw error;
  return (data ?? []).map((row) => row.id);
}

async function resetSeed(supabase) {
  const seedPantryIds = pantries.map((pantry) => uuidFromSlug(`pantry:${pantry.slug}`));
  const seedProductIds = catalog.map((item) => uuidFromSlug(`product:${item.slug}`));
  const seededLotIds = await findSeededLotIds(supabase);

  if (seededLotIds.length) {
    const { data: requestRows } = await supabase
      .from("marketplace_requests")
      .select("id")
      .or(`source_pantry_id.in.(${seedPantryIds.join(",")}),requesting_pantry_id.in.(${seedPantryIds.join(",")})`);
    const requestIds = (requestRows ?? []).map((row) => row.id);

    if (requestIds.length) {
      await supabase.from("marketplace_transfers").delete().in("request_id", requestIds);
      await supabase.from("marketplace_requests").delete().in("id", requestIds);
    }

    await supabase.from("marketplace_transfers").delete().in("source_lot_id", seededLotIds);
    await supabase.from("marketplace_listings").delete().in("lot_id", seededLotIds);
    await supabase.from("inventory_movements").delete().in("lot_id", seededLotIds);
    await supabase.from("inventory_lots").delete().in("id", seededLotIds);
  }

  await supabase.from("pantry_memberships").delete().in("pantry_id", seedPantryIds);
  await supabase.from("pantries").delete().in("id", seedPantryIds);
  await supabase.from("products").delete().in("id", seedProductIds);
}

async function upsertChunk(supabase, table, rows, chunkSize = 100) {
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: "id" });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

async function insertChunk(supabase, table, rows, chunkSize = 100) {
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

async function main() {
  const env = loadEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required.");
  }

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false },
  });

  const products = productRows();
  const pantryRecords = pantryRows();
  const { lots, movements, listings } = inventoryAndListings();

  await resetSeed(supabase);

  await upsertChunk(supabase, "products", products);
  await upsertChunk(supabase, "pantries", pantryRecords);
  await supabase
    .from("pantries")
    .update({
      lat: 37.7749,
      lng: -122.4194,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ADMIN_PANTRY_ID);
  await upsertChunk(supabase, "inventory_lots", lots);
  await insertChunk(supabase, "inventory_movements", movements);
  await upsertChunk(supabase, "marketplace_listings", listings);
  await supabase.from("network_policies").delete().eq("network_id", ADMIN_NETWORK_ID);
  await supabase.from("network_policies").insert(
    {
      id: uuidFromSlug(`network-policy:${ADMIN_NETWORK_ID}`),
      network_id: ADMIN_NETWORK_ID,
      allow_tefap_transfer: false,
      allow_paid_transfer: false,
      require_admin_approval: false,
      restricted_categories: ["infant_formula"],
      updated_at: new Date().toISOString(),
    },
  );

  console.log(JSON.stringify({
    seeded: {
      pantries: pantryRecords.length,
      products: products.length,
      inventoryLots: lots.length,
      receivingMovements: movements.length,
      marketplaceListings: listings.length,
    },
    mode: "demo_seed",
    note: "Inventory quantities and listings are mock demo records. Pantry organization names are public Bay Area references; this does not imply participation or endorsement.",
    sourcePages,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
