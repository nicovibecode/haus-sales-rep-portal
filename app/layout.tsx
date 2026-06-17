import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BSD Haus – Sales Rep Portal",
  description: "Internal sales portal for BSD Haus LLC representatives",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
