"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LayoutList, ShieldCheck, Store } from "lucide-react";

const marketplaceItems = [
  { href: "/marketplace", label: "Marketplace", icon: Store, exact: true },
  { href: "/marketplace/listings", label: "My Listings", icon: LayoutList },
  { href: "/marketplace/requests", label: "My Requests", icon: ClipboardList },
  { href: "/marketplace/admin", label: "Admin", icon: ShieldCheck },
];

export function MarketplaceNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Marketplace" className="border-b border-border">
      <div className="flex min-h-12 items-center gap-1 overflow-x-auto">
        {marketplaceItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] ${
                active
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted hover:border-border hover:text-foreground"
              }`}
              href={href}
            >
              <Icon aria-hidden="true" size={16} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
