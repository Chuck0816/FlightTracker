import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono } from "next/font/google";

import { AppNav } from "@/app/_components/AppNav";

import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Flight Tracker — Route Reliability Analytics",
    template: "%s · Flight Tracker",
  },
  description:
    "Explore U.S. domestic routes and analyze historical reliability, delays, cancellations, airlines, and fares.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${ibmPlexMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <AppNav />
        {children}
      </body>
    </html>
  );
}
