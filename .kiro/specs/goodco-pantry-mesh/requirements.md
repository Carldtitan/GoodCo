# Requirements: GoodCo Pantry Mesh

## Introduction

GoodCo Pantry Mesh is a Bay Area pantry-to-pantry inventory and marketplace system. It turns real pantry receiving events into confirmed inventory lots, then allows approved pantries in the San Francisco, Marin, Alameda, Oakland, Berkeley, and nearby East Bay operating area to list transferable inventory and request food from each other.

The product has two implementation streams after the shared contract is complete:

- **Inventory and parsing stream**: receiving, barcode lookup, product categorization, OCR/voice date input, correction memory, inventory lots, and inventory movements.
- **Marketplace stream**: pantry marketplace browse, publish listing, request/claim, approval, pickup, receipt confirmation, and transfer lifecycle.

No synthetic marketplace inventory is allowed. Marketplace listings must come from real inventory lots created in the product by users or imported from user-provided/public real sources.

## Requirements

### Requirement 1: Shared Contract

**User story:** As the engineering lead, I want a shared contract between inventory and marketplace workstreams, so that both streams can build independently without breaking data ownership.

#### Acceptance Criteria

1. WHEN the project starts implementation THEN the system SHALL define shared TypeScript types for pantries, products, inventory lots, marketplace listings, marketplace requests, transfers, and inventory movements.
2. WHEN the marketplace displays food THEN the system SHALL source every listing from a confirmed `inventory_lot`.
3. WHEN the marketplace reserves, transfers, or cancels food THEN the system SHALL write a corresponding `inventory_movement`.
4. WHEN a lot has `review_status != confirmed` THEN the system SHALL prevent that lot from being listed.
5. WHEN a lot has `redistribution_allowed != true` THEN the system SHALL prevent that lot from being listed.
6. WHEN a lot has `tefap_flag == true` THEN the system SHALL prevent marketplace listing by default.
7. WHEN a teammate works on marketplace features THEN the system SHALL expose contract-safe APIs and not require direct mutation of inventory internals.

### Requirement 2: Real Data Only

**User story:** As a food-bank stakeholder, I want the system to avoid synthetic inventory and invented marketplace activity, so that the product remains credible and auditable.

#### Acceptance Criteria

1. WHEN a marketplace listing is created THEN the system SHALL require a real confirmed inventory lot.
2. WHEN the marketplace has no real listings THEN the system SHALL show an empty state rather than preloaded synthetic food.
3. WHEN importing pantry/site data THEN the system SHALL require a real public source or user-provided CSV.
4. WHEN displaying food-bank or pantry affiliation THEN the system SHALL not imply endorsement by SF-Marin Food Bank, Alameda County Community Food Bank, or any Bay Area organization unless explicitly configured.
5. WHEN a transfer history is shown THEN the system SHALL show only actual transfer records created through the product.

### Requirement 3: Pantry Identity And Bay Area Scope

**User story:** As a network admin, I want only approved Bay Area pantry organizations to use the marketplace, so that inventory sharing is governed and local.

#### Acceptance Criteria

1. WHEN a pantry account is created THEN the system SHALL store organization name, county, address, contact, approval status, storage capabilities, and network membership.
2. WHEN a pantry is not approved THEN the system SHALL prevent it from publishing listings or requesting food.
3. WHEN users browse the marketplace THEN the system SHALL support county filters for San Francisco, Marin, Alameda, Oakland, Berkeley, and nearby East Bay coverage.
4. WHEN a pantry requests refrigerated or frozen inventory THEN the system SHALL verify that the requesting pantry has compatible storage capability or require explicit override.

### Requirement 4: Receiving And Inventory Capture

**User story:** As a pantry volunteer, I want to quickly receive food into inventory, so that food can be tracked without heavy manual data entry.

#### Acceptance Criteria

1. WHEN a volunteer scans a barcode THEN the system SHALL search Open Food Facts first and USDA FoodData Central second.
2. WHEN product data is found THEN the system SHALL draft product name, brand, package size, category, subcategory, storage type, ingredients, and allergens where available.
3. WHEN barcode lookup fails THEN the system SHALL allow photo/OCR, voice input, or manual quick add.
4. WHEN the system creates a draft record THEN it SHALL require human review before saving an inventory lot.
5. WHEN a lot is saved THEN the system SHALL store quantity, unit, pantry, source type, received date, storage type, date fields, review status, confidence, and redistribution fields.

### Requirement 5: Category And Date Intelligence

**User story:** As a pantry volunteer, I want the app to suggest categories and date fields, so that I can receive food faster while still confirming important details.

#### Acceptance Criteria

1. WHEN product data includes a known grocery category THEN the system SHALL map it to a pantry operations category.
2. WHEN a user corrects a category THEN the system SHALL save the correction in persistent mapping memory.
3. WHEN the same barcode, product name, brand/product pair, or OCR phrase appears again THEN the system SHALL reuse approved correction memory before calling the LLM.
4. WHEN OCR or voice detects a date THEN the system SHALL store the raw text/transcript and proposed normalized date.
5. WHEN a date is detected THEN the system SHALL require review before it becomes confirmed.
6. WHEN no package date exists THEN the system SHALL require a move-by date for perishable or short-shelf-life items.

### Requirement 6: Fireworks LLM Fallback

**User story:** As an implementer, I want hosted LLM fallback only for uncertain categorization and date parsing, so that common cases remain cheap and deterministic.

#### Acceptance Criteria

1. WHEN barcode lookup, correction memory, and rules produce high confidence THEN the system SHALL not call Fireworks.
2. WHEN categorization remains low confidence THEN the system SHALL call Fireworks with structured JSON output requirements.
3. WHEN Fireworks returns a classification THEN the system SHALL mark the result as a draft until human review.
4. WHEN Fireworks fails THEN the system SHALL degrade to manual review without blocking receiving.

### Requirement 7: Marketplace Listing

**User story:** As a pantry manager, I want to publish eligible inventory to a local marketplace, so that other approved pantries can claim food before it expires or sits unused.

#### Acceptance Criteria

1. WHEN a pantry opens inventory THEN the system SHALL show which lots are marketplace-eligible.
2. WHEN a user publishes a lot THEN the system SHALL require listed quantity, pickup window, storage type, move-by date, and approval mode.
3. WHEN a listing is active THEN the system SHALL show item name, category, quantity, unit, source pantry, distance, storage badge, move-by badge, and availability confidence.
4. WHEN a listing expires or move-by date passes THEN the system SHALL remove it from active browse results.
5. WHEN a listed quantity is reserved THEN the system SHALL reduce marketplace-available quantity without finalizing inventory transfer.

### Requirement 8: Marketplace Request And Transfer

**User story:** As an approved pantry requester, I want to claim available food from nearby pantries, so that I can fill shortages without waiting only on the hub.

#### Acceptance Criteria

1. WHEN a requester submits a request THEN the system SHALL validate approval status, quantity, storage compatibility, listing status, and policy restrictions.
2. WHEN a request requires approval THEN the system SHALL route it to source pantry or network admin based on listing approval mode.
3. WHEN pickup is confirmed by the source pantry THEN the system SHALL mark the request as picked up.
4. WHEN receipt is confirmed by the destination pantry THEN the system SHALL finalize the transfer, decrement source inventory, and create destination inventory.
5. WHEN a request is cancelled THEN the system SHALL release reserved quantity back to the listing.

### Requirement 9: Policy And Safety

**User story:** As a network admin, I want policy controls for restricted inventory, so that pantry sharing does not violate partner rules.

#### Acceptance Criteria

1. WHEN network policy disables paid transfer THEN the system SHALL keep all marketplace listings at `price_cents = 0`.
2. WHEN network policy disables TEFAP transfer THEN the system SHALL block TEFAP inventory from listing.
3. WHEN a category is restricted THEN the system SHALL require admin approval before listing or transfer.
4. WHEN a cold or frozen transfer is completed THEN the system SHALL allow pickup and receipt temperature capture.
5. WHEN a transfer occurs THEN the system SHALL retain traceability from source lot to destination lot.

### Requirement 10: No Payment In MVP

**User story:** As a product owner, I want marketplace interactions to be free request/claim flows in the first version, so that the product avoids resale and compliance risk.

#### Acceptance Criteria

1. WHEN the marketplace is used in MVP THEN the system SHALL not collect payment.
2. WHEN items are displayed THEN the system SHALL use request/claim/order language rather than consumer purchase language.
3. WHEN future cost recovery is configured THEN the system SHALL require explicit network policy enabling before any priced transfer is shown.

### Requirement 11: Reporting And Export

**User story:** As a network admin, I want exportable inventory and marketplace records, so that the system can support audits and migration to existing pantry systems.

#### Acceptance Criteria

1. WHEN inventory records exist THEN the system SHALL support CSV export of products, lots, and movements.
2. WHEN marketplace records exist THEN the system SHALL support CSV export of listings, requests, transfers, and policy decisions.
3. WHEN a classification is corrected THEN the system SHALL retain a classification event audit record.
4. WHEN a transfer is completed THEN the system SHALL retain source pantry, destination pantry, quantity, unit, timestamps, and actors.
