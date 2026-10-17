import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

const answers = [
  {
    question: "Where do my queries go?",
    answer: (
      <>
        Labyrinth runs on your own machine and resolves names by asking root,
        TLD and authoritative servers. You control the resolver and its logs.
        Encrypted client transports protect the connection to your resolver;
        they don’t make every upstream query private.
      </>
    ),
    href: "/docs/resolution",
    label: "Understand resolution",
  },
  {
    question: "Can I host my own DNS zones?",
    answer: (
      <>
        Labyrinth is a recursive resolver. If you also need authoritative DNS,
        zone management and clustering, take a look at NothingDNS.
      </>
    ),
    href: "https://nothingdns.com",
    label: "Explore NothingDNS",
  },
  {
    question: "How do I get to the dashboard?",
    answer: (
      <>
        After installation, open <code>http://127.0.0.1:9153</code> on the host
        to complete setup. The dashboard binds to localhost by default.
        Configure authentication and TLS before exposing it to your network.
      </>
    ),
    href: "/docs/dashboard",
    label: "Dashboard guide",
  },
  {
    question: "Can I reproduce the benchmark numbers?",
    answer: (
      <>
        Yes. Releases include labyrinth-bench. The numbers above are
        single-thread microbenchmarks on an AMD Ryzen 9 9950X3D. Actual DNS
        response times also depend on the network, cache state and upstream
        servers.
      </>
    ),
    href: "/docs/benchmark",
    label: "Run the benchmarks",
  },
];

export function QuickAnswers() {
  return (
    <section id="questions" className="quick-answers-section">
      <div className="site-container">
        <div className="quick-answers-layout">
          <Reveal>
            <SectionHeading
              eyebrow="Before the first query"
              title={
                <>
                  A few good
                  <br />
                  <span className="font-display italic text-primary">
                    questions.
                  </span>
                </>
              }
              description="The practical details that help you decide if Labyrinth belongs on your network."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="quick-answers-list">
              {answers.map(({ question, answer, href, label }, index) => (
                <details key={question}>
                  <summary>
                    <span className="question-index">0{index + 1}</span>
                    <span>{question}</span>
                    <Plus size={18} aria-hidden="true" />
                  </summary>
                  <div className="quick-answer-content">
                    <p className="reading-copy">{answer}</p>
                    {href.startsWith("https://") ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link"
                      >
                        {label}
                        <ArrowUpRight size={14} />
                      </a>
                    ) : (
                      <Link href={href} className="text-link">
                        {label}
                        <ArrowUpRight size={14} />
                      </Link>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
