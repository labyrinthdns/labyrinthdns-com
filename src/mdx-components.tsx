import type { MDXComponents } from "mdx/types";

/* Typography mapping for the Labyrinth documentation.
   The classes mirror the landing page's SectionHeading / CodeBlock / table
   styles so docs pages read as part of the same product. */

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => (
      <h1
        className="mt-2 mb-8 scroll-mt-24 font-sans text-4xl font-medium tracking-[-0.05em] sm:text-5xl"
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        className="mt-12 scroll-mt-24 border-b border-border pb-3 font-sans text-2xl font-medium tracking-tight"
        {...props}
      />
    ),
    h3: (props) => (
      <h3
        className="mt-8 scroll-mt-24 font-display text-xl font-semibold"
        {...props}
      />
    ),
    p: (props) => <p className="mt-4 leading-relaxed" {...props} />,
    a: (props) => (
      <a
        className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
        {...props}
      />
    ),
    ul: (props) => (
      <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed" {...props} />
    ),
    ol: (props) => (
      <ol
        className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed"
        {...props}
      />
    ),
    blockquote: (props) => (
      <blockquote
        className="mt-6 border-l-2 border-primary bg-surface/40 py-1 pl-4 pr-3 text-muted italic"
        {...props}
      />
    ),
    hr: () => <hr className="my-10 border-border" />,
    strong: (props) => <strong className="font-semibold" {...props} />,
    code: (props) => (
      <code
        className="rounded border border-border bg-raised px-1.5 py-0.5 font-mono text-[0.85em]"
        {...props}
      />
    ),
    pre: (props) => (
      <pre
        tabIndex={0}
        aria-label="Code example"
        className="mdx-pre mt-5 overflow-x-auto rounded-lg border border-border bg-raised/40 p-4 font-mono text-[13px] leading-relaxed"
        {...props}
      />
    ),
    table: (props) => (
      <div tabIndex={0} role="region" aria-label="Documentation table" className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm" {...props} />
      </div>
    ),
    thead: (props) => <thead className="bg-raised/50" {...props} />,
    th: (props) => (
      <th
        scope="col"
        className="border-b border-border px-4 py-2.5 text-left font-mono text-xs font-medium uppercase tracking-wider text-muted"
        {...props}
      />
    ),
    td: (props) => (
      <td
        className="border-b border-border/50 px-4 py-2.5 align-top"
        {...props}
      />
    ),
    ...components,
  };
}
