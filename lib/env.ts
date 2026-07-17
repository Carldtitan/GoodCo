import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SECRET_KEY: z.string().min(1),
  FIREWORKS_API_KEY: z.string().min(1),
  FIREWORKS_MODEL: z.string().min(1),
  USDA_FDC_API_KEY: z.string().min(1),
});

export type PublicEnv = {
  supabaseUrl: string;
  supabasePublishableKey: string;
};

export type ServerEnv = PublicEnv & {
  supabaseSecretKey: string;
  fireworksApiKey: string;
  fireworksModel: string;
  usdaFdcApiKey: string;
};

type EnvSource = Record<string, string | undefined>;

function formatEnvError(error: z.ZodError): Error {
  const missing = error.issues
    .map((issue) => issue.path.join("."))
    .filter(Boolean)
    .join(", ");

  return new Error(`Missing or invalid environment variables: ${missing}`);
}

export function readPublicEnv(source: EnvSource = process.env): PublicEnv {
  const result = publicEnvSchema.safeParse(source);

  if (!result.success) {
    throw formatEnvError(result.error);
  }

  return {
    supabaseUrl: result.data.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublishableKey: result.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function readServerEnv(source: EnvSource = process.env): ServerEnv {
  const result = serverEnvSchema.safeParse(source);

  if (!result.success) {
    throw formatEnvError(result.error);
  }

  return {
    supabaseUrl: result.data.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublishableKey: result.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    supabaseSecretKey: result.data.SUPABASE_SECRET_KEY,
    fireworksApiKey: result.data.FIREWORKS_API_KEY,
    fireworksModel: result.data.FIREWORKS_MODEL,
    usdaFdcApiKey: result.data.USDA_FDC_API_KEY,
  };
}

export function assertServerEnv(): void {
  readServerEnv();
}
