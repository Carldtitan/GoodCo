import { AppShell } from "@/components/app-shell";
import { ReceiveWorkspace } from "@/components/receiving/receive-workspace";
import { getPantryContext } from "@/lib/pantry/context";

export default async function HomePage() {
  const pantryContext = await getPantryContext();

  return (
    <AppShell pantryContext={pantryContext}>
      <ReceiveWorkspace />
    </AppShell>
  );
}
