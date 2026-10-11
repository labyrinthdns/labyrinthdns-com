import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { site } from "@/lib/site";
import { Reveal } from "@/components/reveal";

const notes = [
  [
    "Transport support",
    "DoT, DoH and DoH3 ship today. DoQ (RFC 9250) is not implemented yet.",
  ],
  [
    "Dashboard access",
    "The dashboard binds to 127.0.0.1:9153 by default. Configure web.auth credentials and TLS before exposing it to your network.",
  ],
  [
    "Updating & hosting",
    "Read-only installs update at the host level. Labyrinth is a recursive resolver; it does not serve authoritative zones.",
  ],
];

export function PromoPlate({ version = site.version }: { version?: string }) {
  return (
    <section className="outro-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="outro-invitation">
            <div>
              <p className="eyebrow">
                THE END OF THE THREAD. THE START OF YOUR NETWORK.
              </p>
              <h2>
                Your network.
                <br />
                <em>Your resolver.</em>
              </h2>
            </div>
            <div className="outro-action">
              <p>
                One binary. No middleman.
                <br />A little more independence.
              </p>
              <Link href="/#install" className="editorial-button">
                Make it yours <ArrowUpRight size={20} />
              </Link>
              <span className="font-mono text-[10px]">
                {version} / PURE GO / MIT
              </span>
            </div>
          </div>
        </Reveal>
        <div className="operator-notes">
          <p className="eyebrow">Before you run it / The useful fine print</p>
          <div>
            {notes.map(([title, description]) => (
              <details key={title}>
                <summary>
                  {title}
                  <Plus size={16} />
                </summary>
                <p>{description}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
