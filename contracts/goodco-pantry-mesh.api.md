# GoodCo Pantry Mesh Shared API Contract

This contract is the seam between the inventory/parsing stream and the marketplace stream.

## Ownership

Inventory owns:

- `products`
- `inventory_lots`
- `inventory_movements`
- `category_mappings`
- `classification_events`
- `extraction_jobs`
- eligible-lot API
- reserve/cancel/finalize inventory movement APIs

Marketplace owns:

- `marketplace_listings`
- `marketplace_requests`
- `marketplace_transfers`
- `network_policies`
- browse, publish, request, approval, pickup, and receipt UI

Marketplace must never directly mutate inventory quantities.

## Real Data Rule

Marketplace listings can only be created from confirmed inventory lots.

Allowed listing source:

```text
inventory_lots.review_status = confirmed
inventory_lots.redistribution_allowed = true
inventory_lots.tefap_flag = false by default
inventory_lots.quantity_on_hand - inventory_lots.quantity_reserved > 0
```

The marketplace starts empty. It stays empty until real inventory records are created by users or imported from a real user-provided source.

## API Routes

Route names are implementation guidance. Server actions or RPC functions may be used if they preserve the same contract.

### `GET /api/inventory/eligible-lots`

Owned by inventory.

Returns `MarketplaceEligibleLot[]` for the active pantry.

Rules:

- Excludes unconfirmed lots.
- Excludes lots with no available quantity.
- Excludes `tefap_flag = true` by default.
- Excludes `redistribution_allowed = false`.

### `POST /api/marketplace/listings`

Owned by marketplace, calls inventory eligibility check.

Input:

```ts
{
  lotId: string;
  quantityListed: number;
  unit: Unit;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  approvalMode: ApprovalMode;
}
```

Rules:

- `lotId` must resolve to an eligible lot.
- `quantityListed` must be less than or equal to available lot quantity.
- `price_cents` defaults to `0`.
- `payment_required` defaults to `false`.

### `POST /api/marketplace/requests`

Owned by marketplace, calls inventory reservation API.

Input:

```ts
{
  listingId: string;
  quantityRequested: number;
  requestedPickupTime?: string;
}
```

Rules:

- Requesting pantry must be approved.
- Quantity must be available on the listing.
- Requesting pantry must support the listing storage type or require admin override.
- Restricted categories follow `network_policies`.

### `POST /api/inventory/marketplace-reservations`

Owned by inventory.

Creates a `marketplace_reserved` movement and increments `inventory_lots.quantity_reserved`.

Input:

```ts
{
  listingId: string;
  requestId: string;
  lotId: string;
  quantity: number;
  unit: Unit;
  actorId: string;
}
```

Rules:

- Does not decrement `quantity_on_hand`.
- Fails if requested quantity exceeds available quantity.

### `POST /api/inventory/marketplace-cancellations`

Owned by inventory.

Creates a `marketplace_cancelled` movement and decrements `quantity_reserved`.

Input:

```ts
{
  listingId: string;
  requestId: string;
  lotId: string;
  quantity: number;
  unit: Unit;
  actorId: string;
  reason?: string;
}
```

### `POST /api/inventory/marketplace-transfers`

Owned by inventory.

Finalizes a transfer after source pickup and destination receipt confirmation.

Input:

```ts
{
  listingId: string;
  requestId: string;
  sourceLotId: string;
  sourcePantryId: string;
  destinationPantryId: string;
  quantity: number;
  unit: Unit;
  actorId: string;
  temperatureAtPickup?: number;
  temperatureAtReceipt?: number;
  photoUrl?: string;
}
```

Rules:

- Decrements source `quantity_on_hand`.
- Decrements source `quantity_reserved`.
- Creates destination inventory lot using source product/date/traceability fields.
- Creates `marketplace_transferred` movement.
- Updates marketplace request and listing status.

## Status Lifecycles

### Listing

```text
active -> reserved -> fulfilled
active -> expired
active -> cancelled
reserved -> cancelled
```

### Request

```text
requested -> approved -> ready_for_pickup -> picked_up -> received
requested -> rejected
requested -> cancelled
approved -> cancelled
```

## Policy Defaults

- Paid transfers disabled.
- TEFAP transfers disabled.
- Admin approval enabled for restricted categories.
- No public consumer access.
- No inferred endorsement by any Bay Area food bank.

## Integration Test Contract

The minimum cross-stream validation is:

1. Create a real inventory lot through receiving.
2. Mark it confirmed and redistribution allowed.
3. Publish it as a listing.
4. Request part of the listed quantity.
5. Reserve quantity through inventory API.
6. Approve and confirm pickup.
7. Confirm receipt.
8. Finalize transfer through inventory API.
9. Verify source lot quantity decreased.
10. Verify destination lot was created.
11. Verify transfer traceability links source lot to destination lot.
