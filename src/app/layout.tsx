import type { Metadata } from "next";
import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadataBase = process.env.APP_URL ? new URL(process.env.APP_URL) : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: "Valterra | Propiedades e inversión inmobiliaria",
  description: "Propiedades e inversión inmobiliaria en CDMX, Estado de Mexico y Riviera Maya con criterio comercial, selección curada y acompañamiento personalizado.",
  icons: {
    apple: "/apple-touch-icon.jpg",
    icon: [
      { url: "/icons/icon-192.jpg", sizes: "192x192", type: "image/jpeg" },
      { url: "/icons/icon-512.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#171310",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#171310] text-[#f5ede2]">{children}</body>
    </html>
  );
}
