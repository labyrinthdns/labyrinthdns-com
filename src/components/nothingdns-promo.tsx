import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import { Reveal } from "@/components/reveal";

export function NothingDnsPromo() {
  return (
    <section
      id="nothingdns"
      className="nothingdns-section"
      aria-labelledby="nothingdns-title"
    >
      <div className="site-container">
        <Reveal>
          <div className="nothingdns-promo">
            <div className="nothingdns-brand-column">
              <p className="nothingdns-eyebrow">Also in the DNS toolbox</p>
              <Image
                src="/brands/nothingdns/logo.svg"
                alt="NothingDNS"
                width={1124}
                height={174}
                className="nothingdns-wordmark"
              />
              <h2 id="nothingdns-title">
                Less noise.
                <br />
                More <em>network.</em>
              </h2>
              <span className="nothingdns-signoff">
                YOUR INFRASTRUCTURE. YOUR RULES.
              </span>
            </div>
            <div className="nothingdns-copy-column">
              <p className="nothingdns-eyebrow">
                Looking for authoritative DNS, too?
              </p>
              <p className="nothingdns-description">
                Labyrinth focuses on recursive resolution.{" "}
                <strong>NothingDNS</strong> takes on the wider DNS stack: serve
                your own zones, resolve queries and shape traffic policies in a
                self-contained, open-source Go binary.
              </p>
              <ul className="nothingdns-capabilities">
                {[
                  "Authoritative & recursive DNS",
                  "Zone management & clustering",
                  "Blocklists & response policies",
                ].map((item) => (
                  <li key={item}>
                    <Check size={14} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://nothingdns.com"
                target="_blank"
                rel="noopener noreferrer"
                className="nothingdns-link"
              >
                Explore NothingDNS <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <p className="nothingdns-fineprint">
                Self-hosted · MIT licensed · nothingdns.com
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
