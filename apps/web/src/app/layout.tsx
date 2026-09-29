import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClientSphere",
  description: "A free, open-source CRM for small businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
