import { Check, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

type Cell = { text: string; mark: "yes" | "no" | "neutral" };

const rows: { label: string; labyrinth: string; classic: Cell; publicDns: Cell }[] = [
  {
    label: "Setup",
    labyrinth: "One binary + setup wizard",
    classic: { text: "Packages + hand-edited config", mark: "neutral" },
    publicDns: { text: "Nothing to run", mark: "neutral" },
  },
  {
    label: "Management",
    labyrinth: "Built-in dashboard",
    classic: { text: "Config files and CLIs", mark: "neutral" },
    publicDns: { text: "Vendor web console", mark: "neutral" },
  },
  {
    label: "Metrics",
    labyrinth: "Prometheus + Zabbix native",
    classic: { text: "Exporters and plugins", mark: "neutral" },
    publicDns: { text: "Not yours to read", mark: "no" },
  },
  {
    label: "Blocklists",
    labyrinth: "Built-in, Pi-hole style",
    classic: { text: "RPZ zones or extra layers", mark: "neutral" },
    publicDns: { text: "Up to the vendor", mark: "no" },
  },
  {
    label: "Encrypted DNS",
    labyrinth: "DoT · DoH · DoH3 built in",
    classic: { text: "Varies — modules or proxies", mark: "neutral" },
    publicDns: { text: "Yes — to them", mark: "neutral" },
  },
  {
    label: "Your queries",
    labyrinth: "Stay on your box",
    classic: { text: "Stay on your box", mark: "yes" },
    publicDns: { text: "Someone else's business", mark: "no" },
  },
];

function Mark({ mark }: { mark: Cell["mark"] }) {
  if (mark === "yes") {
    return <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden="true" />;
  }
  if (mark === "no") {
    return <X className="mt-0.5 size-3.5 shrink-0 text-danger" aria-hidden="true" />;
  }
  return <Minus className="mt-0.5 size-3.5 shrink-0 text-muted" aria-hidden="true" />;
}

export function Comparison() {
  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="06 · Positioning"
            title="Your network. Your rules."
            description="Labyrinth is ideal when you want a self-contained recursive resolver without the operational complexity. Here is how that trade looks next to the usual alternatives."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[720px] border-collapse bg-surface text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th
                    scope="col"
                    className="px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-muted"
                  >
                    Capability
                  </th>
                  <th scope="col" className="bg-primary/5 px-5 py-4">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-fg">Labyrinth</span>
                      <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-primary">
                        This one
                      </span>
                    </span>
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-muted"
                  >
                    Classic resolvers
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-muted"
                  >
                    Public resolvers
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-border/50 last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="px-5 py-4 text-left font-medium text-fg"
                    >
                      {row.label}
                    </th>
                    <td className="bg-primary/5 px-5 py-4 font-medium text-fg">
                      {row.labyrinth}
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex gap-2 text-muted">
                        <Mark mark={row.classic.mark} />
                        {row.classic.text}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "flex gap-2",
                          row.publicDns.mark === "no" ? "text-muted" : "text-muted",
                        )}
                      >
                        <Mark mark={row.publicDns.mark} />
                        {row.publicDns.text}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-5 text-center text-sm text-muted">
            The honest pitch: the control of running your own resolver, without
            the weekend of YAML. Capabilities vary by resolver and version —
            compare against your own setup.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
