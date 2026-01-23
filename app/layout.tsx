import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Manrope, Sora } from "next/font/google";
import { UserProvider } from "../context/UserContext";
import { CartProvider } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Obaldi",
  description: "Consapevolezza. Tutela. Acquisti sensati.",
  metadataBase: process.env.APP_BASE_URL
    ? new URL(process.env.APP_BASE_URL)
    : new URL("http://localhost:3000"),
  openGraph: {
    title: "Obaldi",
    description: "Consapevolezza. Tutela. Acquisti sensati.",
    type: "website",
    siteName: "Obaldi",
    images: [
      {
        url: "/media/Hero_Home.png",
        width: 1200,
        height: 630,
        alt: "Obaldi"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Obaldi",
    description: "Consapevolezza. Tutela. Acquisti sensati.",
    images: ["/media/Hero_Home.png"]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const plausibleSrc =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js";

  return (
    <html lang="it">
      <body className={`${sora.variable} ${manrope.variable} font-body`}>
        <UserProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main id="top" className="flex-grow">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </UserProvider>
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src={plausibleSrc}
          />
        ) : null}
      </body>
    </html>
  );
}
