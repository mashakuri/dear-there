import type { Metadata } from "next";
import { Caveat, DM_Sans } from "next/font/google";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-dear",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dear, There",
  description:
    "Pin postcards and letters to the map: memory-keeping, pen pals, and community stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="text-ink min-h-full flex flex-col">
        <Header />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
