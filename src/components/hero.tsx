"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import { site } from "@/lib/site";
import { CopyCommand } from "@/components/copy-command";
import { MazeMap } from "@/components/maze-map";

export function Hero({ version = site.version }: { version?: string }) {
  const reduce = useReducedMotion();
  const [running, setRunning] = useState(true);
  const [record, setRecord] = useState<"A" | "AAAA">("A");
  return (
    <section id="top" className="site-container hero-section">
      <div className="hero-kicker">
        <span>
          <i /> Independent by design.
        </span>
        <span className="font-mono">PURE GO / {version}</span>
      </div>
      <div className="hero-layout">
        <motion.div
          className="hero-copy"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow">A recursive DNS resolver. Entirely yours.</p>
          <h1>
            Every query.
            <br />
            <em>A clear path.</em>
          </h1>
          <p className="hero-description">
            From the root to the answer. Labyrinth resolves, validates and
            protects your DNS — in one small binary you control.
          </p>
          <div className="hero-actions">
            <Link href="/#install" className="editorial-button">
              Run your own DNS <ArrowUpRight size={18} />
            </Link>
            <Link href="/docs" className="text-link">
              Read the docs <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="hero-install">
            <span className="eyebrow">One command. Then you’re in.</span>
            <CopyCommand command={site.install} />
            <p>Linux & macOS · run as root · includes setup wizard</p>
          </div>
          <div className="hero-footnotes">
            <span>01 / Zero dependencies</span>
            <span>02 / Self-hosted</span>
            <span>03 / MIT licensed</span>
          </div>
        </motion.div>
        <motion.div
          className="resolver-art"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.15 }}
        >
          <div className="art-topline">
            <span>
              <i /> THE RESOLUTION LABYRINTH
            </span>
            <span>FIG. 001</span>
          </div>
          <div className="art-query">
            <span>example.com</span>
            <div className="record-switch" aria-label="Example DNS record type">
              {(["A", "AAAA"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setRecord(type)}
                  aria-pressed={record === type}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div className="maze-stage">
            <MazeMap running={running} />
            <span className="maze-coordinate coordinate-start">
              ROOT / ENTRY
            </span>
            <span className="maze-coordinate coordinate-end">
              ANSWER / EXIT
            </span>
          </div>
          <div className="art-result" aria-live="polite">
            <span>
              <i /> NOERROR
            </span>
            <code>
              {record === "A" ? "93.184.216.34" : "2606:2800:220:1::"}
            </code>
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              aria-label={
                running
                  ? "Pause labyrinth animation"
                  : "Play labyrinth animation"
              }
            >
              {running ? <Pause size={15} /> : <Play size={15} />}
            </button>
          </div>
          <div className="art-caption">
            <span>Root → TLD → Authoritative → You</span>
            <span>Illustrated query</span>
          </div>
        </motion.div>
      </div>
      <a className="hero-scroll" href="#features">
        <ArrowDown size={15} /> FOLLOW THE THREAD{" "}
        <span>Built for the curious. Made for the network.</span>
      </a>
    </section>
  );
}
