# Implementation Plan: GoodCo Pantry Mesh

## Overview

This plan implements GoodCo Pantry Mesh in TypeScript on Next.js with Supabase. The product has two coupled but separable workstreams: **Inventory + Parsing** and **Marketplace**. Both streams depend on a shared contract that defines the data model, TypeScript types, policy rules, and API boundaries.

The implementation rule is simple: marketplace listings never invent food. Marketplace supply must come from confirmed inventory lots created through the receiving flow or imported from real user-provided records. The marketplace starts empty until real inventory exists.

The plan follows a Kiro-style dependency flow:

1. Build shared contract first.
2. Split into parallel workstreams.
3. Integrate transfers through the contract.
4. Validate policy, security, and real-data rules.

## Ownership

Tasks are split for two people working in parallel after the shared contract is complete. Owner labels apply to the top-level task and all sub-tasks unless a sub-task says otherwise.

- **Person A - Shared Contract + Inventory/Parsing:** Task 1, Task 2, Task 3, Task 4, Task 7, Task 11. Person A owns receiving, barcode/product lookup, OCR/voice date parsing, categorization, correction memory, inventory lots, inventory movements, and contract-safe inventory APIs.
- **Person B - Marketplace:** Task 5, Task 6, Task 8, Task 9. Person B owns browse, listing detail, publish listing, claim/request, approvals, my listings, my requests, and admin policy UI.
- **Both:** Task 10 and Task 12. Integration points and final validation must be checked together.

## Tasks

- [x] 1. Define the shared contract artifacts (Owner: Person A)
  - [x] 1.1 Create `contracts/goodco-pantry-mesh.types.ts`
    - Define shared enums and types for pantry categories, storage types, source types, date fields, pantries, products, inventory lots, inventory movements, marketplace listings, marketplace requests, marketplace transfers, and network policies.
    - Export `MarketplaceEligibleLot` and `MarketplaceMovement` as the seam between the two workstreams.
    - _Requirements: 1.1, 1.2, 1.3, 7.1, 8.1_

  - [x] 1.2 Create `contracts/goodco-pantry-mesh.schema.sql`
    - Define the Supabase/Postgres table contract for pantries, products, inventory lots, movements, classification memory, listings, requests, transfers, and network policies.
    - Add check constraints for status fields, non-negative quantities, zero-price marketplace default, and TEFAP blocked-by-default policy.
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 7.1, 9.1, 10.1_

  - [x] 1.3 Create `contracts/goodco-pantry-mesh.api.md`
    - Document the API boundary: inventory owns lots and movements; marketplace owns listings, requests, approvals, and transfer UI.
    - Document reserve, cancel, and finalize transfer semantics.
    - _Requirements: 1.3, 7.5, 8.4, 8.5_

  - [x] 1.4 Document real-data-only contract rules
    - Marketplace listings must be created from confirmed inventory lots.
    - No synthetic marketplace inventory or invented transfer history.
    - Food-bank endorsement must not be implied unless configured.
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [ ] 2. Set up the application shell and Supabase wiring (Owner: Person A)
  - [x] 2.1 Initialize the Next.js app structure
    - Create the Next.js App Router layout, TypeScript config, Tailwind config, and base directories: `app/`, `components/`, `lib/`, `contracts/`, and `supabase/`.
    - _Requirements: 1.1_

  - [x] 2.2 Wire Supabase clients and env validation
    - Read `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`.
    - Add startup validation that fails clearly when required env vars are missing.
    - _Requirements: 1.1, 11.1_

  - [x] 2.3 Apply schema migration from the shared contract
    - Convert or copy the contract SQL into Supabase migrations.
    - Do not prepopulate marketplace inventory.
    - _Requirements: 1.1, 2.1, 2.2_

- [ ] 3. Implement inventory receiving and categorization (Owner: Person A)
  - [x] 3.1 Build pantry context and receiving shell
    - Add authenticated pantry context and receiving navigation.
    - _Requirements: 3.1, 4.1_

  - [x] 3.2 Implement barcode scan and product lookup
    - Use `@zxing/browser` to scan UPC/GTIN.
    - Query Open Food Facts first and USDA FoodData Central second.
    - _Requirements: 4.1, 4.2_

  - [x] 3.3 Implement pantry category mapping
    - Map standard product categories into the pantry operations taxonomy.
    - Use correction memory before Fireworks fallback.
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 3.4 Implement OCR and voice-assisted date capture
    - Use Tesseract.js for date OCR and browser speech input for spoken quantity/date details.
    - Store raw OCR text or voice transcript.
    - _Requirements: 5.4, 5.5, 5.6_

  - [x] 3.5 Implement Fireworks fallback parser
    - Use Fireworks only for low-confidence category/date parsing.
    - Validate structured JSON against contract enums before showing a draft.
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 3.6 Build review-before-save flow
    - Show draft item, quantity, unit, date, storage, category, confidence, and source trail.
    - Require human confirmation before saving.
    - _Requirements: 4.4, 4.5, 5.5_

  - [ ] 3.7 Save inventory lots and receiving movements
    - Persist product, lot, classification event, extraction job, and initial receiving movement.
    - _Requirements: 4.5, 11.3_

  - [ ]* 3.8 Add tests for category mapping and date parsing
    - Assert correction memory beats LLM fallback.
    - Assert date drafts require review.
    - _Requirements: 5.2, 5.3, 5.5, 6.1_

- [ ] 4. Implement inventory marketplace seam APIs (Owner: Person A)
  - [ ] 4.1 Implement eligible lots query
    - Return only lots where `review_status = confirmed`, `redistribution_allowed = true`, quantity is available, and `tefap_flag = false` by default.
    - _Requirements: 1.2, 1.4, 7.1, 9.2_

  - [ ] 4.2 Implement reservation movement API
    - Create `marketplace_reserved` movement and reduce marketplace-available quantity without finalizing transfer.
    - _Requirements: 1.3, 7.5, 8.1_

  - [ ] 4.3 Implement cancellation movement API
    - Create `marketplace_cancelled` movement and release reserved quantity.
    - _Requirements: 8.5_

  - [ ] 4.4 Implement transfer-finalize API
    - Decrement source inventory, create destination inventory lot, and write `marketplace_transferred` movement.
    - _Requirements: 1.3, 8.4, 9.5_

  - [ ]* 4.5 Add tests for reserve/cancel/finalize semantics
    - Verify reservations do not remove on-hand quantity until transfer finalization.
    - Verify cancellation releases reserved quantity.
    - _Requirements: 1.3, 8.4, 8.5_

- [ ] 5. Build marketplace browsing and listing creation (Owner: Person B)
  - [ ] 5.1 Build marketplace shell
    - Add Marketplace, My Listings, My Requests, and Admin Console navigation.
    - _Requirements: 7.3, 8.1_

  - [ ] 5.2 Build publish-listing flow from eligible lots
    - Source listings only from the eligible-lot API.
    - Require quantity, pickup window, storage type, move-by date, and approval mode.
    - _Requirements: 1.2, 7.1, 7.2_

  - [ ] 5.3 Build marketplace browse
    - Show active listings with category, county, storage, move-by urgency, availability confidence, and distance/filter controls.
    - _Requirements: 3.3, 7.3_

  - [ ] 5.4 Build listing detail
    - Show item, quantity, source pantry, pickup details, traceability fields, storage requirement, and restriction badges.
    - _Requirements: 7.3, 9.3, 10.2_

  - [ ]* 5.5 Add tests for listing creation guardrails
    - Assert listings cannot be created without an eligible inventory lot.
    - _Requirements: 1.2, 2.1, 7.1_

- [ ] 6. Build request, approval, and marketplace status UI (Owner: Person B)
  - [ ] 6.1 Build request/claim drawer
    - Request quantity and pickup time from an active listing.
    - Validate organization approval status, requested quantity, listing status, and storage compatibility.
    - _Requirements: 8.1, 8.2_

  - [ ] 6.2 Build approval states
    - Support auto-approved, source-pantry approval, and admin approval modes.
    - _Requirements: 7.2, 8.2, 9.3_

  - [ ] 6.3 Build My Listings
    - Show active, reserved, pending approval, fulfilled, expired, and cancelled listings.
    - _Requirements: 7.4, 8.2_

  - [ ] 6.4 Build My Requests
    - Show requested, approved, ready for pickup, picked up, received, and cancelled requests.
    - _Requirements: 8.3, 8.4, 8.5_

  - [ ]* 6.5 Add request lifecycle tests
    - Assert invalid requests are rejected and valid requests enter the expected state.
    - _Requirements: 8.1, 8.2_

- [ ] 7. Build inventory management screens (Owner: Person A)
  - [ ] 7.1 Build inventory list
    - Show pantry lots with category, quantity, storage, date status, review status, and marketplace eligibility.
    - _Requirements: 4.5, 7.1_

  - [ ] 7.2 Build expiring-soon view
    - Show lots by move-by urgency and storage type.
    - _Requirements: 5.6_

  - [ ] 7.3 Build correction-memory review
    - Show unknown/low-confidence classification events and allow approved category mappings.
    - _Requirements: 5.2, 5.3_

- [ ] 8. Build marketplace admin policy console (Owner: Person B)
  - [ ] 8.1 Build organization approval controls
    - Approve or suspend pantry marketplace access.
    - _Requirements: 3.1, 3.2_

  - [ ] 8.2 Build network policy controls
    - Configure restricted categories, admin approval requirement, TEFAP transfer disabled default, and paid transfer disabled default.
    - _Requirements: 9.1, 9.2, 9.3, 10.1, 10.3_

  - [ ] 8.3 Build policy audit display
    - Show policy decisions tied to listing and request records.
    - _Requirements: 9.5, 11.4_

- [ ] 9. Integrate marketplace transfer lifecycle (Owner: Person B with Person A contract review)
  - [ ] 9.1 Connect request to inventory reservation API
    - Marketplace requests call the inventory seam instead of mutating lot quantities directly.
    - _Requirements: 1.3, 8.1_

  - [ ] 9.2 Connect pickup and receipt confirmation
    - Source pantry confirms handoff; destination pantry confirms receipt.
    - _Requirements: 8.3, 8.4_

  - [ ] 9.3 Connect transfer finalization to inventory API
    - Final transfer creates source and destination inventory movement records.
    - _Requirements: 1.3, 8.4, 9.5_

  - [ ] 9.4 Implement cancelled request release
    - Cancel request and release reserved quantity through inventory seam.
    - _Requirements: 8.5_

- [ ] 10. Checkpoint - inventory and marketplace integration (Owner: Both)
  - Verify a real user-created inventory lot can be listed, requested, reserved, approved, picked up, received, and finalized without synthetic marketplace inventory.
  - _Requirements: 2.1, 7.1, 8.4, 11.4_

- [ ] 11. Reporting, export, and operational validation (Owner: Person A)
  - [ ] 11.1 Add CSV exports
    - Export products, lots, movements, listings, requests, transfers, classification events, and policy records.
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 11.2 Add audit trail views
    - Show classification corrections and transfer traceability from source lot to destination lot.
    - _Requirements: 5.2, 9.5, 11.3_

  - [ ]* 11.3 Add no-synthetic-marketplace validation test
    - Assert the marketplace renders empty until a confirmed inventory lot is listed.
    - _Requirements: 2.1, 2.2_

- [ ] 12. Final checkpoint - ship-ready review (Owner: Both)
  - [ ] 12.1 Run validation suite
    - Confirm tests pass for category mapping, date parsing, eligibility rules, reservation/finalization, RLS, and real-data constraints.
    - _Requirements: 1, 2, 5, 8, 9, 10_

  - [ ] 12.2 Review env and README handoff
    - Ensure `.env.example` contains only required variables and no real secrets.
    - Document setup without adding optional model/provider clutter.
    - _Requirements: 11.1_

## Notes

- Tasks marked with `*` are optional tests for faster hackathon execution, but they are recommended for contract-heavy logic.
- Marketplace listings must come from confirmed inventory lots. No synthetic marketplace inventory should be committed.
- Paid transfer is disabled in MVP. Use request/claim/order language, not consumer purchase/payment language.
- TEFAP inventory is blocked from marketplace listing by default.
- Fireworks is a fallback parser only. Barcode lookup, correction memory, and deterministic rules should handle common cases first.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4", "5.1"] },
    { "id": 3, "tasks": ["3.5", "3.6", "3.7", "5.2", "5.3", "5.4", "8.1", "8.2"] },
    { "id": 4, "tasks": ["4.1", "5.5", "6.1", "6.2", "7.1", "7.2", "7.3", "8.3"] },
    { "id": 5, "tasks": ["4.2", "4.3", "4.4", "6.3", "6.4", "6.5", "9.1"] },
    { "id": 6, "tasks": ["4.5", "9.2", "9.3", "9.4", "11.1", "11.2"] },
    { "id": 7, "tasks": ["10", "11.3", "12.1", "12.2"] }
  ]
}
```
