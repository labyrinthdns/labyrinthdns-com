import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://labyrinthdns.com"),
  title: "Labyrinth DNS — Pure Go Recursive DNS Resolver",
  description:
    "Zero dependencies. Single binary. Web dashboard built in. A pure Go recursive DNS resolver with DNSSEC validation, blocklists, DoT/DoH/DoH3, Prometheus metrics and a real-time dashboard.",
  keywords: [
    "DNS",
    "recursive resolver",
    "Go",
    "DNSSEC",
    "DoH",
    "DoT",
    "self-hosted",
  ],
  openGraph: {
    title: "Labyrinth DNS — Pure Go Recursive DNS Resolver",
    description:
      "Follow the thread through the DNS labyrinth. One 6.8 MB binary: resolver, DNSSEC validation, blocklists, dashboard.",
    url: "https://labyrinthdns.com",
    siteName: "Labyrinth DNS",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Labyrinth DNS — Pure Go Recursive DNS Resolver",
    description:
      "Follow the thread through the DNS labyrinth. One 6.8 MB binary: resolver, DNSSEC validation, blocklists, dashboard.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#181a17" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`}
    >
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
