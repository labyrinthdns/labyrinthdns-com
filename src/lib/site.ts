export const site = {
  name: "Labyrinth DNS",
  url: "https://labyrinthdns.com",
  github: "https://github.com/labyrinthdns/labyrinth",
  releases: "https://github.com/labyrinthdns/labyrinth/releases",
  issues: "https://github.com/labyrinthdns/labyrinth/issues",
  security:
    "https://github.com/labyrinthdns/labyrinth/blob/main/SECURITY.md",
  conduct:
    "https://github.com/labyrinthdns/labyrinth/blob/main/CODE_OF_CONDUCT.md",
  readme: "https://github.com/labyrinthdns/labyrinth",
  version: "v0.8.36",
  stars: 10,
  install: "curl -sSL https://labyrinthdns.com/install.sh | bash",
  uninstall: "curl -sSL https://labyrinthdns.com/uninstall.sh | bash",
  dockerImage: "ghcr.io/labyrinthdns/labyrinth:latest",
  dashboard: "127.0.0.1:9153",
  motto: "Follow the thread through the DNS labyrinth.",
} as const;

// Anchor hrefs are rooted at "/" so the nav works from /docs too.
export const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#dashboard", label: "Dashboard" },
  { href: "/#resolution", label: "Resolution" },
  { href: "/#performance", label: "Performance" },
  { href: "/#rfcs", label: "RFCs" },
  { href: "/docs", label: "Docs" },
  { href: "/#install", label: "Install" },
] as const;

export const docsNav = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/quick-start", label: "Quick start" },
  { href: "/docs/configuration", label: "Configuration" },
  { href: "/docs/dashboard", label: "Web dashboard" },
  { href: "/docs/api", label: "REST API" },
  { href: "/docs/monitoring", label: "Monitoring" },
  { href: "/docs/resolution", label: "Resolution" },
  { href: "/docs/wire-protocol", label: "Wire protocol" },
  { href: "/docs/caching", label: "Caching" },
  { href: "/docs/security", label: "Security" },
  { href: "/docs/daemon-mode", label: "Daemon mode" },
  { href: "/docs/benchmark", label: "Benchmark" },
  { href: "/docs/performance-tuning", label: "Performance tuning" },
  { href: "/docs/troubleshooting", label: "Troubleshooting" },
] as const;
