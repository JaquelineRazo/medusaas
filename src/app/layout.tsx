import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

// Accent face for one or two words per headline (BRAND.md).
const accent = Instrument_Serif({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export const metadata: Metadata = {
  title: "meduSAAS",
  description: "Your digital support, always calm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${accent.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
