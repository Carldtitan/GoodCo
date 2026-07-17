# Product Design: GoodCo Receiving Categorizer

## What We Are Building

Build **GoodCo Receiving Categorizer**.

It is a pantry receiving tool that helps volunteers turn incoming donated food into clean inventory records.

The app does one job:

> When food arrives, identify it, categorize it, capture quantity/storage/expiration, and save a reviewed inventory lot.

This is the first step before any pantry-to-pantry exchange can work.

## What We Are Not Building

Do not build:

- full warehouse management system,
- pantry-to-pantry marketplace yet,
- route optimization,
- volunteer driver dispatch,
- full real-time SKU truth,
- client-facing shopping app,
- AI-only food safety system.

## User

Primary user: pantry volunteer or pantry coordinator receiving food.

Secondary user: pantry manager reviewing inventory and expiring items.

## Core Workflow

1. Food arrives.
2. Volunteer opens **Receive Item**.
3. Volunteer chooses one input:
   - scan barcode,
   - take label photo,
   - speak quantity/date details,
   - upload invoice/photo,
   - enter manually for bulk produce/mixed donations.
4. App generates a draft record.
5. Volunteer reviews and edits.
6. Volunteer saves the item as an inventory lot.
7. Dashboard shows inventory and expiring-soon items.

## Input Paths

### Path 1: Barcode First

Use for packaged retail items.

Example: canned beans, cereal, pasta, peanut butter.

Flow:

1. Scan UPC/GTIN with phone camera.
2. Look up product in Open Food Facts.
3. If missing, search USDA FoodData Central.
4. Fill name, brand, package size, ingredients/nutrition if available.
5. Categorizer maps it into pantry categories.
6. Volunteer confirms.

Tools:

- Barcode scanner: `ZXing JS`
- Product data: `Open Food Facts API`
- Backup product data: `USDA FoodData Central API`

### Path 2: Photo/OCR

Use when barcode fails or item has unclear packaging.

Flow:

1. Volunteer takes front-label photo.
2. OCR extracts visible text.
3. Categorizer maps text into category/storage.
4. Volunteer confirms.

Tools:

- OCR: `Tesseract.js` for hackathon browser demo
- Better backend OCR later: `PaddleOCR`

### Path 3: Manual Quick Add

Use for bulk produce, bakery, mixed rescue, unlabeled food.

Flow:

1. Volunteer selects category.
2. Enters rough quantity.
3. Adds storage type and move-by date.
4. Saves after review.

Example:

```text
Category: Produce
Item: Mixed produce
Quantity: 80
Unit: lb
Storage: Refrigerated
Move by: Tomorrow
```

This path matters because AI will not reliably identify every mixed donation.

### Path 4: Voice-Assisted Date And Quantity

Use when the volunteer can read the package faster than they can type it.

Example voice input:

```text
Add 24 cans of black beans, best by March 12 2027, dry storage.
```

Flow:

1. Volunteer taps **Speak Details**.
2. Speech-to-text transcribes the note.
3. A structured parser extracts item, quantity, unit, storage type, and date.
4. The app shows a confirmation screen.
5. Volunteer confirms or edits before saving.

Draft output:

```json
{
  "item_name": "black beans",
  "quantity": 24,
  "unit": "cans",
  "storage_type": "dry",
  "date_label_type": "best_by",
  "best_by": "2027-03-12",
  "confidence": 0.88,
  "needs_human_review": true
}
```

Voice is never authoritative. It is a fast input method.

## Taxonomy And Categories

Do not invent the full grocery category tree from scratch.

Use a two-layer model:

1. **Standard taxonomy layer** for product matching and detail.
2. **Pantry operations layer** for simple volunteer workflows.

### Standard taxonomy layer

Use these sources:

- **GS1 Global Product Classification (GPC)** as the main long-term grocery taxonomy. GS1 GPC is a rules-based four-tier system: Segment, Family, Class, and Brick. It is built so trading partners classify products the same way.
- **Open Food Facts categories** for barcode-linked product categories, ingredients, allergens, labels, and product images. Treat it as useful but imperfect community data.
- **USDA FoodData Central food categories** for official US nutrition/product data and category enrichment.

The product record should store external category fields when available:

```text
gpc_segment
gpc_family
gpc_class
gpc_brick
open_food_facts_categories
fdc_food_category
```

### Pantry operations layer

Volunteers should not see hundreds of GS1 categories during receiving.

GoodCo maps the standard taxonomy into a smaller operational category set:

- produce
- dairy
- eggs
- meat
- poultry
- seafood
- plant protein
- canned meals
- canned vegetables
- canned fruit
- canned beans
- grains and rice
- pasta and noodles
- cereal and breakfast
- bread and bakery
- snacks
- beverages
- baby food
- infant formula
- diapers and baby supplies
- hygiene
- household
- pet food
- prepared meals
- frozen food
- refrigerated prepared food
- condiments and sauces
- baking goods
- spices and seasonings
- unknown

### Why two layers

GS1/Open Food Facts/USDA help us be exhaustive.

The pantry operations layer helps volunteers move fast.

Example:

```text
GS1/Open Food Facts detail: Canned black beans, branded shelf-stable legume product
GoodCo pantry category: canned beans
Storage type: dry
```

Example:

```text
GS1/Open Food Facts detail: Pasteurized whole milk, refrigerated dairy beverage
GoodCo pantry category: dairy
Storage type: refrigerated
```

Example:

```text
Manual input: mixed rescued produce
GoodCo pantry category: produce
Storage type: refrigerated
Move-by date: volunteer-entered or default rule
```

## Categorizer Logic

Use a hybrid categorizer.

Order of operations:

1. Exact barcode/product match.
2. Known local pantry mapping.
3. Rules-based keyword/category mapping.
4. LLM fallback for messy cases.
5. Human review before save.

The LLM is not the source of truth. It drafts a category.

## Persistent Learning From Corrections

Yes, the app should remember corrections.

But this should be implemented as deterministic database memory, not as vague LLM memory.

Example:

1. The app classifies an item as `unknown`.
2. A volunteer corrects it to `seafood`.
3. GoodCo saves that correction.
4. Next time the same barcode, product name, or similar OCR text appears, GoodCo suggests `seafood` before calling the LLM.

### What gets remembered

Store corrections at several levels:

1. **Exact barcode mapping**
   - Best case.
   - Example: barcode `012345678905` always maps to `seafood > frozen fish`.

2. **Product-name mapping**
   - Useful when no barcode exists.
   - Example: `tilapia fillets` maps to `seafood`.

3. **Brand + product mapping**
   - Useful for branded packaged goods.
   - Example: `Brand X smoked oysters` maps to `seafood > canned seafood`.

4. **OCR phrase mapping**
   - Useful for weird labels.
   - Example: OCR phrase `sardines in tomato sauce` maps to `seafood > canned seafood`.

5. **Local pantry rule**
   - Useful when one pantry wants a different operational category.
   - Example: pantry A maps `protein shakes` to `ready-to-eat`; pantry B maps them to `beverages`.

### Memory scopes

Use three scopes:

- `local`: correction only applies to one pantry.
- `network`: correction applies across a food-bank/pantry network after admin approval.
- `global_seed`: base mappings shipped with the app.

Do not automatically promote one volunteer's correction to the whole network. Require approval.

### When memory is used

Categorization order becomes:

1. Exact barcode mapping from memory.
2. Product database lookup.
3. Pantry/network correction memory.
4. Rules-based keyword mapping.
5. LLM fallback.
6. Human review.

This makes the app cheaper and better over time.

### Unknown queue

The app should track unknowns:

- items classified as `unknown`,
- low-confidence classifications,
- repeated manual corrections,
- categories with high correction rates.

Managers can review this queue and create new mappings.

## LLM Categorizer

Use an LLM only when lookup/rules are uncertain.

Input to LLM:

```json
{
  "product_name": "Goya Black Beans",
  "brand": "Goya",
  "package_size": "15.5 oz",
  "ingredients": "black beans, water, salt",
  "ocr_text": "Goya Black Beans 15.5 oz"
}
```

Output:

```json
{
  "category": "dry_goods",
  "subcategory": "canned_beans",
  "storage_type": "dry",
  "perishable": false,
  "diet_tags": ["vegetarian"],
  "allergen_flags": [],
  "confidence": 0.94,
  "needs_human_review": false,
  "reason": "Canned beans are shelf-stable dry goods."
}
```

Use structured JSON output only.

## Expiration And Production Dates

Expiration and production dates cannot be fully automated from a normal UPC barcode.

Important reality:

- A normal retail UPC/GTIN identifies the product, not the individual package's expiration date.
- GS1 Application Identifiers can encode batch/lot, production date, best-before date, and expiration date in richer barcode types like GS1-128 or GS1 DataMatrix.
- Most pantry-facing packaged grocery items will only have a printed human-readable date on the package.
- For most foods, date labels are not federally required except infant formula, and they usually indicate quality rather than safety.

So GoodCo should automate date capture as a **draft**, not as an authority.

### Date capture paths

1. **GS1 barcode date extraction**
   - If the scanned barcode is GS1-128/DataMatrix and includes date fields, parse it directly.
   - Useful fields:
     - production date,
     - packaging date,
     - best-before date,
     - expiration date,
     - lot/batch number.
   - This is the best case, but not common on ordinary consumer UPCs.

2. **OCR from date photo**
   - Volunteer taps "Scan date."
   - App asks for a close-up photo of the printed date.
   - OCR extracts text.
   - A date parser normalizes formats like:
     - `BEST BY 03/12/27`
     - `USE BY 2027-03-12`
     - `EXP MAR 12 2027`
     - `BB 12MAR27`
   - Human reviews before save.

3. **Voice date entry**
   - Volunteer reads the date aloud.
   - Example: "Best by March twelfth twenty twenty seven."
   - Speech-to-text creates a transcript.
   - A structured parser converts the transcript into date fields.
   - Human reviews before save.

4. **LLM/date-parser fallback**
   - If OCR text is messy, pass only the OCR text and product context to a structured parser.
   - The output must identify:
     - date value,
     - date label type,
     - confidence,
     - whether human review is required.

5. **Manual move-by date**
   - For bulk produce, bakery, prepared food, and mixed rescue boxes, volunteers set a move-by date.
   - GoodCo can suggest defaults, but the volunteer confirms.

### Date fields to store

Add these fields to `inventory_lots`:

```text
date_label_type       // best_by, use_by, sell_by, expires, packed_on, produced_on, unknown
date_raw_text         // exact OCR text from package
date_voice_transcript // exact speech transcript, if voice was used
best_by
use_by
sell_by
expiration_date
production_date
packaging_date
move_by
lot_code
date_source          // gs1_barcode, ocr, llm_parse, manual, default_rule
date_confidence
date_review_status
```

### Date automation rule

Never silently save an extracted date as final.

Use this status model:

- `confirmed`: human approved it.
- `draft_high_confidence`: OCR/parser found a plausible date.
- `needs_review`: unclear label, multiple dates, low confidence.
- `missing`: no date found.
- `not_applicable`: bulk/mixed donation where move-by date is used instead.

### Expiring soon logic

Use `move_by` as the operational field.

Why: product labels are inconsistent, and food banks/pantries need an action date.

Rule:

```text
if expiration_date exists:
  move_by = expiration_date minus buffer
else if best_by/use_by exists:
  move_by = date minus category buffer
else if category is produce/bakery/prepared:
  move_by = received_at plus default shelf-life rule
else:
  move_by = manual required
```

The app should show why:

```text
Move by tomorrow because this is refrigerated mixed produce and no package date was found.
```

## What We Will Use

### App

- Frontend: `Next.js`
- Language: `TypeScript`
- Styling: `Tailwind CSS`
- Database: `Supabase Postgres`
- File storage: `Supabase Storage`

Supabase Postgres is the MVP database and system of record for the hackathon app.

The app can run as a normal web app/PWA. Later, it can export or sync records into whatever system a pantry or food bank already uses.

### Barcode

- `@zxing/browser`

### Product Lookup

- `Open Food Facts API`
- `USDA FoodData Central API`

### OCR

- MVP: `Tesseract.js`
- Later: `PaddleOCR` backend service if needed

### Speech

- MVP: browser `Web Speech API` if available.
- More reliable option: `Whisper` / hosted speech-to-text.
- Local/offline later: `whisper.cpp` or `Vosk`.

Speech is used only to create editable draft fields.

### LLM

MVP option:

- OpenAI structured-output call for categorization and date-parser fallback.

Cheap/open option:

- local/open model later, such as Qwen or Llama-based classifier.

For hackathon speed, use a hosted LLM for fallback only. Most common items should be handled by barcode lookup and rules.

## Database Tables

### `products`

Canonical product info.

Fields:

- `id`
- `barcode`
- `name`
- `brand`
- `package_size`
- `category`
- `subcategory`
- `storage_type`
- `ingredients`
- `allergens`
- `source`
- `gpc_segment`
- `gpc_family`
- `gpc_class`
- `gpc_brick`
- `open_food_facts_categories`
- `fdc_food_category`

### `category_mappings`

Persistent memory for corrections.

Fields:

- `id`
- `scope` // local, network, global_seed
- `pantry_id`
- `network_id`
- `match_type` // barcode, product_name, brand_product, ocr_phrase, keyword_rule
- `match_value`
- `category`
- `subcategory`
- `storage_type`
- `confidence`
- `created_by`
- `approved_by`
- `created_at`
- `updated_at`

### `classification_events`

Audit trail of every classification attempt.

Fields:

- `id`
- `input_type`
- `barcode`
- `product_name`
- `ocr_text`
- `suggested_category`
- `final_category`
- `suggested_subcategory`
- `final_subcategory`
- `model_or_rule_used`
- `confidence`
- `was_corrected`
- `corrected_by`
- `created_at`

### `inventory_lots`

Actual pantry inventory lots.

Fields:

- `id`
- `product_id`
- `pantry_id`
- `quantity`
- `unit`
- `source_type`
- `received_at`
- `best_by`
- `use_by`
- `sell_by`
- `expiration_date`
- `production_date`
- `packaging_date`
- `move_by`
- `date_label_type`
- `date_raw_text`
- `date_voice_transcript`
- `date_source`
- `date_confidence`
- `date_review_status`
- `lot_code`
- `storage_type`
- `tefap_flag`
- `redistribution_allowed`
- `confidence`
- `review_status`

### `inventory_movements`

Every inventory change.

Fields:

- `id`
- `lot_id`
- `movement_type`
- `quantity_delta`
- `actor`
- `created_at`
- `note`

### `extraction_jobs`

AI/OCR/barcode processing history.

Fields:

- `id`
- `input_type`
- `raw_input_url`
- `extracted_json`
- `confidence`
- `status`
- `created_at`

## Integration Strategy

Food pantries do not all use the same database.

Some use spreadsheets/manual records. Some use pantry software. Some food banks use larger ERP/WMS systems.

So GoodCo should not assume one destination database.

MVP:

- GoodCo stores its own records in Supabase Postgres.
- Export inventory lots and movements as CSV.
- Import product lists from CSV.

Later:

- API export.
- Webhooks.
- Integration adapters for specific systems if a partner requests them.

The app should be vendor-agnostic. It should create clean inventory records that can be moved into another system, not require every pantry to replace its current system.

## Main Screens

### 1. Receive Item

Buttons:

- Scan Barcode
- Take Photo
- Speak Details
- Upload Invoice
- Quick Add

### 2. Review Draft

Shows:

- item name
- category
- quantity
- unit
- storage type
- best-by / move-by
- voice transcript if speech was used
- allergens/diet tags
- confidence
- source trail

User can edit before save.

### 3. Inventory

Shows:

- current lots
- category filters
- storage filters
- expiring soon
- low-confidence records

### 4. Expiring Soon

Shows:

- items to distribute first
- move-by date
- quantity
- storage location

## Demo Data

Seed these demo items:

- canned black beans
- rice
- peanut butter
- cereal
- milk
- frozen chicken
- mixed produce
- diapers
- hygiene kit

## Demo Script

1. Scan canned beans barcode.
2. App fills product info.
3. App categorizes as dry goods / canned beans.
4. User says: "Add 24 cans, best by March 12 2027."
5. User saves lot.
6. User quick-adds 80 lb mixed produce.
7. App marks it refrigerated and move-by tomorrow.
8. Inventory dashboard shows:
   - dry goods: 24 cans
   - produce: 80 lb
   - expiring soon: mixed produce

## Success Metric

The product is successful if it reduces receiving friction.

Measure:

- time to create inventory record,
- percent of records categorized automatically,
- percent needing human correction,
- number of expiring items caught,
- percent of date fields captured through OCR or voice,
- number of inventory records with source/expiration captured.

## Final Scope

Build only:

- barcode scan,
- product lookup,
- category prediction,
- voice-assisted quantity/date input,
- manual quick add,
- review/save,
- inventory list,
- expiring-soon view.

Everything else comes later.
