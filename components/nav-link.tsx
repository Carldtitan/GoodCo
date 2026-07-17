"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  ClipboardCheck,
  Download,
  GitBranch,
  LayoutDashboard,
  PackagePlus,
  Store,
} from "lucide-react";

const icons = {
  audit: GitBranch,
  expiring: ClipboardCheck,
  exports: Download,
  inventory: Archive,
  marketplace: Store,
  receive: PackagePlus,
  review: LayoutDashboard,
};

export type NavIconKey = keyof typeof icons;

export function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: NavIconKey;
}) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
  const Icon = icons[icon];

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={[
        "inline-flex min-h-10 items-center gap-2 rounded-panel px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        isActive
          ? "bg-foreground text-surface"
          : "text-muted hover:bg-background hover:text-foreground",
      ].join(" ")}
    >
      <Icon aria-hidden="true" size={17} strokeWidth={2} />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
