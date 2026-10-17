"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const projects = [
  { name: "AGEZT", description: "An agentic operating system" },
  { name: "WrongStack", description: "AI coding orchestration" },
  { name: "WrongTrace", description: "Agent observability" },
  { name: "UWAS", description: "Unified web app server" },
];

export function StudioCredit() {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const reduce = useReducedMotion();

  return (
    <section
      ref={ref}
      id="studio"
      aria-labelledby="studio-title"
      className="studio-credit"
    >
      <div className="studio-credit-inner">
        <a
          href="https://oxog.net"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit OXOGNET"
          className="studio-logo-link"
        >
          <svg
            viewBox="0 0 200 130"
            fill="none"
            aria-hidden="true"
            className={`studio-mark ${seen && !reduce ? "studio-mark-draw" : ""}`}
          >
            <path
              pathLength="1"
              d="M93 56 72 35C49 13 14 24 9 53 3 84 23 104 46 103"
              strokeWidth="12"
            />
            <path
              pathLength="1"
              d="M146 25c24-7 45 10 47 34 3 26-16 46-39 44-14-1-24-11-41-27"
              strokeWidth="12"
            />
            <path
              pathLength="1"
              d="M76 18c30-20 75 1 77 40 1 12-1 24-6 33M53 36c-19 41 14 84 50 79 9-1 16-3 22-7"
              className="studio-mark-purple"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <path
              pathLength="1"
              d="m74 87 54-51"
              strokeWidth="12"
              strokeLinecap="square"
            />
          </svg>
        </a>
        <div className="studio-description">
          <p className="studio-kicker">The studio behind the thread</p>
          <p className="studio-byline">
            Labyrinth DNS is built and maintained by
          </p>
          <h2 id="studio-title">
            <a
              href="https://oxog.net"
              target="_blank"
              rel="noopener noreferrer"
            >
              oxog<span className="studio-wordmark-net">net</span>
              <span className="studio-wordmark-dot">.</span>
              <ArrowUpRight size={23} aria-hidden="true" />
            </a>
          </h2>
          <p className="studio-about">
            A small studio in Estonia building AI agents, developer tools and
            the infrastructure behind them. Independent tools, thoughtfully
            connected.
          </p>
          <a
            href="https://oxog.net"
            target="_blank"
            rel="noopener noreferrer"
            className="studio-visit"
          >
            Meet the studio <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
        <nav aria-label="More from OXOGNET" className="studio-projects">
          <p className="studio-kicker">More from the studio</p>
          {projects.map((project) => (
            <a
              key={project.name}
              href="https://oxog.net/projects"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>
                <strong>{project.name}</strong>
                <span>{project.description}</span>
              </span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
