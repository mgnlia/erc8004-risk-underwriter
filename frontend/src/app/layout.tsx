import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERC-8004 Risk Underwriter",
  description: "AI-powered DeFi risk underwriting engine for ERC-8004 compliant protocols",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
