import { describe, expect, it } from "vitest";
import { readPublicEnv, readServerEnv } from "@/lib/env";

const validEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable",
  SUPABASE_SECRET_KEY: "secret",
  FIREWORKS_API_KEY: "fireworks",
  FIREWORKS_MODEL: "accounts/fireworks/models/example",
  USDA_FDC_API_KEY: "usda",
};

describe("environment validation", () => {
  it("reads public Supabase config", () => {
    expect(readPublicEnv(validEnv)).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabasePublishableKey: "publishable",
    });
  });

  it("reads required server config", () => {
    expect(readServerEnv(validEnv)).toMatchObject({
      supabaseSecretKey: "secret",
      fireworksModel: "accounts/fireworks/models/example",
    });
  });

  it("rejects missing required variables", () => {
    expect(() => readServerEnv({})).toThrow(
      /Missing or invalid environment variables/,
    );
  });
});
