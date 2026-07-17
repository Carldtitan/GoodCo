import type { Metadata } from "next";
import { assertServerEnv } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoodCo",
  description: "Pantry inventory and transfer operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  assertServerEnv();

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
