import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteBackground } from "@/components/site-background";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
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
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Labyrinth DNS — Every query. A clear path. Pure Go, self-hosted, zero dependencies.",
      },
    ],
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
    { media: "(prefers-color-scheme: light)", color: "#f7f5fa" },
    { media: "(prefers-color-scheme: dark)", color: "#17131f" },
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
      className={`${spaceGrotesk.variable} ${jetbrains.variable}`}
    >
      <body className="font-sans">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
