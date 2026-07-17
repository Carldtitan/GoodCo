import type { PantryCategory, StorageType, Unit } from "@/contracts/goodco-pantry-mesh.types";

export type MarketplaceListingView = {
  id: string;
  lotId: string;
  itemName: string;
  category: PantryCategory;
  quantityAvailable: number;
  unit: Unit;
  storageType: StorageType;
  moveBy: string | null;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  status: string;
  approvalMode: string;
  restrictionStatus: string;
  sourcePantry: { name: string; county: string; address?: string; contactName?: string | null; contactPhone?: string | null; lat: number | null; lng: number | null };
  traceability: { lotCode: string | null; sourceType: string | null; receivedAt: string | null; dateSource: string | null; dateReviewStatus: string | null };
};

export function distanceMiles(from: { lat: number | null; lng: number | null }, to: { lat: number | null; lng: number | null }) {
  if (from.lat == null || from.lng == null || to.lat == null || to.lng == null) return null;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(deltaLng / 2) ** 2;
  return Math.round(earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export function moveByTone(moveBy: string | null, now = new Date()) {
  if (!moveBy) return "muted" as const;
  const days = Math.ceil((new Date(`${moveBy}T00:00:00`).getTime() - now.setHours(0, 0, 0, 0)) / 86_400_000);
  if (days <= 1) return "danger" as const;
  if (days <= 3) return "warning" as const;
  return "muted" as const;
}
