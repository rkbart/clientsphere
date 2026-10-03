import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { Providers } from "@/components/providers";
import { ThemeEffect } from "@/components/layout/theme-effect";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "ClientSphere",
  description: "A free, customizable CRM for small businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="antialiased">
        <ThemeEffect />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
