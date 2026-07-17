import "server-only";

import { redirect } from "next/navigation";
import { getPantryContext } from "@/lib/pantry/context";

export async function requireSignedInPantryContext() {
  const pantryContext = await getPantryContext();

  if (!pantryContext.userId) {
    redirect("/sign-in");
  }

  return pantryContext;
}
