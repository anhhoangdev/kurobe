import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kurobe Platform",
  description: "Advanced analytics platform with real-time insights and AI-powered reporting",
  keywords: ["analytics", "dashboard", "insights", "reporting", "data visualization"],
  authors: [{ name: "Kurobe Team" }],
  creator: "Kurobe",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nexus-analytics.com",
    title: "Kurobe Platform",
    description: "Advanced analytics platform with real-time insights and AI-powered reporting",
    siteName: "Kurobe",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kurobe Platform",
    description: "Advanced analytics platform with real-time insights and AI-powered reporting",
    creator: "@nexusanalytics",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            {children}
            <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
