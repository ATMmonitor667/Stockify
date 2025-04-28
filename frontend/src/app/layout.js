import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: {
    template: '%s | Stockify',
    default: 'Stockify - Your Stock Trading Platform'
  },
  description: "A modern platform for stock trading and market analysis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <Layout>
        {children}
        </Layout>
      </body>
    </html>
  );
}
