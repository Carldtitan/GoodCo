import { describe, expect, it } from "vitest";
import { distanceMiles, moveByTone } from "@/lib/marketplace/listing-view";

describe("marketplace listing view", () => {
  it("calculates a real geographic distance only when both pantries have coordinates", () => {
    expect(distanceMiles({ lat: 37.7749, lng: -122.4194 }, { lat: 37.8044, lng: -122.2712 })).toBe(8.3);
    expect(distanceMiles({ lat: null, lng: -122.4194 }, { lat: 37.8044, lng: -122.2712 })).toBeNull();
  });

  it("marks near move-by dates with an urgency tone", () => {
    expect(moveByTone("2026-07-18", new Date("2026-07-17T12:00:00Z"))).toBe("danger");
    expect(moveByTone("2026-07-20", new Date("2026-07-17T12:00:00Z"))).toBe("warning");
  });
});
