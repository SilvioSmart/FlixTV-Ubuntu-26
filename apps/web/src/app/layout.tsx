import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.flixtv.it"),
  title: "FlixTV",
  description: "Live TV, guida programmi e contenuti on demand su FlixTV.",
  alternates: {
    canonical: "https://www.flixtv.it"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08090b"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="dark">
      <body>{children}</body>
    </html>
  );
}
