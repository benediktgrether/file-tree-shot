import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono, Fira_Code, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });
const firaCode = Fira_Code({ variable: "--font-fira-code", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "treeshot — beautiful file tree images",
  description: "Turn ASCII file trees into clean images for blog posts, docs and social media.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fonts = [geistSans, geistMono, jetbrainsMono, firaCode, plexMono].map((f) => f.variable).join(" ");
  return (
    <html lang="en" className={`${fonts} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
