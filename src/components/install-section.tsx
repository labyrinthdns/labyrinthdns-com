"use client";

import { useState } from "react";
import { Tabs } from "radix-ui";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { site } from "@/lib/site";
import { CopyButton } from "@/components/copy-command";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

function CodeBlock({
  title,
  code,
  className,
}: {
  title?: string;
  code: string;
  className?: string;
}) {
  return (
    <div className={`relative rounded-lg border border-border bg-raised/40 ${className ?? ""}`}>
      {title ? (
        <div className="border-b border-border px-4 py-2 font-mono text-xs text-muted">
          {title}
        </div>
      ) : null}
      <pre className="overflow-x-auto p-4 pr-14 font-mono text-[13px] leading-relaxed text-fg">
        <code>{code}</code>
      </pre>
      <div className="absolute right-2.5 top-2.5">
        <CopyButton text={code} />
      </div>
    </div>
  );
}

type Tab = {
  id: string;
  label: string;
  body: React.ReactNode;
};

function buildTabs(version: string): Tab[] {
  return [
  {
    id: "script",
    label: "Install script",
    body: (
      <div className="space-y-4">
        <CodeBlock
          title="one-line install (Linux/macOS, as root)"
          code={site.install}
        />
        <CodeBlock
          title="installer flags"
          code={`# Pin a specific release
curl -sSL https://labyrinthdns.com/install.sh | \\
  bash -s -- --version ${version}

# Install without the systemd service
curl -sSL https://labyrinthdns.com/install.sh | \\
  bash -s -- --no-service`}
        />
        <p className="text-sm leading-relaxed text-muted">
          Downloads the latest release to{" "}
          <code className="font-mono text-xs text-fg">/opt/labyrinth/bin</code>,
          installs a default config, sets up a systemd service and starts
          Labyrinth. Then open{" "}
          <code className="font-mono text-xs text-fg">
            http://{site.dashboard}
          </code>{" "}
          on the installed host to complete the setup wizard.
        </p>
        <CodeBlock
          title="verify"
          code={`labyrinth -version
dig @127.0.0.1 example.com`}
        />
      </div>
    ),
  },
  {
    id: "docker",
    label: "Docker",
    body: (
      <div className="space-y-4">
        <CodeBlock
          title="GHCR image — DNS ports only by default"
          code={`docker pull ${site.dockerImage}
docker run -p 53:53/udp -p 53:53/tcp \\
  -v "$PWD/labyrinth.yaml:/etc/labyrinth/labyrinth.yaml:ro" \\
  ${site.dockerImage} \\
  -config /etc/labyrinth/labyrinth.yaml`}
        />
        <p className="text-sm leading-relaxed text-muted">
          Or check in the compose file and{" "}
          <code className="font-mono text-xs text-fg">docker compose up -d</code>
          . The admin port 9153 is intentionally not published: configure
          non-empty <code className="font-mono text-xs text-fg">web.auth</code>{" "}
          credentials and TLS before you expose the dashboard — preferably
          behind an authenticated reverse proxy.
        </p>
      </div>
    ),
  },
  {
    id: "source",
    label: "From source",
    body: (
      <div className="space-y-4">
        <CodeBlock
          title="prerequisites: Go 1.26.5+ · Node 22+ and npm"
          code={`git clone https://github.com/labyrinthdns/labyrinth.git
cd labyrinth

# Build the embedded dashboard first
cd web/ui && npm ci && npm run build && cd ../..

# Static binary, no cgo
CGO_ENABLED=0 go build -ldflags="-s -w" -o labyrinth .`}
        />
        <p className="text-sm leading-relaxed text-muted">
          The dashboard SPA is embedded into the binary at build time, so build{" "}
          <code className="font-mono text-xs text-fg">web/ui</code> before the
          Go build. Release binaries are also available on the GitHub releases
          page with checksums.
        </p>
      </div>
    ),
  },
  ];
}

export function InstallSection({
  version = site.version,
}: {
  version?: string;
}) {
  const tabs = buildTabs(version);
  const [active, setActive] = useState(tabs[0].id);
  const reduce = useReducedMotion();

  return (
    <section id="install" className="scroll-mt-24 border-t border-border section-space">
      <div className="site-container section-split">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="07 · Install"
            title="Up and running in one line."
            description="Choose the method that fits your environment. Zero-config start with sane defaults, an interactive setup wizard on first run, and everything configurable from labyrinth.yaml."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <Tabs.Root
            value={active}
            onValueChange={setActive}
            className="section-panel"
          >
            <Tabs.List
              aria-label="Installation methods"
              className="flex justify-center gap-1 rounded-lg border border-border bg-surface p-1"
            >
              {tabs.map((tab) => (
                <Tabs.Trigger
                  key={tab.id}
                  value={tab.id}
                  className="flex-1 rounded-md px-4 py-2 text-sm text-muted transition-colors hover:text-fg data-[state=active]:bg-raised data-[state=active]:text-fg"
                >
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {tabs.map((tab) => (
              <Tabs.Content key={tab.id} value={tab.id} className="mt-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={tab.id}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
                  >
                    {tab.body}
                  </motion.div>
                </AnimatePresence>
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </Reveal>
      </div>
    </section>
  );
}
