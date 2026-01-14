import "./globals.css";
import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import { UserProvider } from "../context/UserContext";
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
  description: "Consapevolezza. Tutela. Acquisti sensati."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={`${sora.variable} ${manrope.variable} font-body`}>
        <UserProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
