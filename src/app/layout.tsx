import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: "Eidos8004 | AI Attribution & Royalty Platform for Designers",
  description:
    "Decentralized portfolio platform where designers earn royalties when AI agents use their work for inspiration. Powered by ERC-8004, x402, and on-chain attribution.",
  keywords: [
    "AI attribution",
    "designer royalties",
    "ERC-8004",
    "x402",
    "decentralized portfolio",
    "NFT",
    "Web3",
    "ETHMumbai",
  ],
  openGraph: {
    title: "Eidos8004 | AI Attribution & Royalty Platform",
    description:
      "Artists deserve royalties when AI takes inspiration from their work. Eidos8004 makes it happen on-chain.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Navbar />
        <main style={{ paddingTop: "72px" }}>{children}</main>
      </body>
    </html>
  );
}
