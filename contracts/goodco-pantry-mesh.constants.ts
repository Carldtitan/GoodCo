export const PANTRY_CATEGORIES = [
  "produce",
  "dairy",
  "eggs",
  "meat",
  "poultry",
  "seafood",
  "plant_protein",
  "canned_meals",
  "canned_vegetables",
  "canned_fruit",
  "canned_beans",
  "grains_and_rice",
  "pasta_and_noodles",
  "cereal_and_breakfast",
  "bread_and_bakery",
  "snacks",
  "beverages",
  "baby_food",
  "infant_formula",
  "diapers_and_baby_supplies",
  "hygiene",
  "household",
  "pet_food",
  "prepared_meals",
  "frozen_food",
  "refrigerated_prepared_food",
  "condiments_and_sauces",
  "baking_goods",
  "spices_and_seasonings",
  "unknown",
] as const;

export const STORAGE_TYPES = [
  "dry",
  "refrigerated",
  "frozen",
  "ambient_short_shelf_life",
] as const;

export const UNITS = ["each", "case", "box", "lb", "oz", "gal"] as const;

export const SOURCE_TYPES = [
  "food_bank",
  "retail_rescue",
  "direct_donation",
  "purchased",
  "unknown",
] as const;

export const DATE_LABEL_TYPES = [
  "best_by",
  "use_by",
  "sell_by",
  "expires",
  "packed_on",
  "produced_on",
  "unknown",
] as const;
