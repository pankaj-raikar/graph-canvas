"use client";

import { TeachingCanvas } from "@/components/TeachingCanvas";
import { CopilotSidebar } from "@copilotkit/react-ui";

const suggestionPresets = [
  {
    title: "Plan BFS",
    message: "Walk me through breadth-first search on six labeled nodes.",
  },
  {
    title: "Highlight cycles",
    message: "Detect and highlight all simple cycles in this graph.",
  },
  {
    title: "Explain MST",
    message: "Construct a minimum spanning tree and explain each edge choice.",
  },
  {
    title: "Compare traversals",
    message: "Show the difference between DFS and BFS on the same graph.",
  },
];

const focusChips = [
  "Graph drawings",
  "Proof sketches",
  "Complexity notes",
  "Interactive quizzes",
];

const learningMilestones = [
  {
    title: "Define the challenge",
    detail: "Describe the graph, constraints, or theorem you want to explore.",
  },
  {
    title: "Watch the construction",
    detail: "The teacher draws vertices, edges, and annotations in real time.",
  },
  {
    title: "Review the insight",
    detail: "Get a recap, proof intuition, and next-step recommendations.",
  },
];

const insightCards = [
  { label: "Session focus", value: "Graph pedagogy" },
  { label: "Active learners", value: "24 online" },
  { label: "Canvas actions", value: "Live" },
];

export default function CopilotKitPage() {
  return (
    <CopilotSidebar
      defaultOpen
      disableSystemMessage
      clickOutsideToClose={false}
      instructions="Draw graphs step-by-step with explanations, proofs, and interactive callouts."
      labels={{
        title: "Graph Theory Teacher",
        initial: "Ask me to sketch, simulate, or prove any graph concept.",
      }}
      suggestions={suggestionPresets}
      className="h-dvh bg-slate-900/70"
    >
      <main className="relative flex h-dvh w-full overflow-hidden bg-slate-950 text-slate-100">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-20 h-72 w-72 rounded-full bg-purple-500/30 blur-[140px]" />
          <div className="absolute top-10 right-[-40px] h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto flex h-full w-full flex-col gap-8 px-6 py-8 lg:max-w-7xl lg:flex-row lg:gap-10 lg:px-10">
          <section className="flex h-full w-full flex-col gap-5 lg:max-w-md">
            <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
                Guided learning space
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white">
                Visualize every graph idea with a patient teacher at your side.
              </h1>
              <p className="text-base text-slate-200/80">
                Combine natural language instructions with a live canvas. Ask
                for drawings, transformations, or proofs and watch the agent
                build the intuition one animation at a time.
              </p>
              <div className="flex flex-wrap gap-2">
                {focusChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-wide text-slate-100/90"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                {suggestionPresets.slice(0, 3).map((preset) => (
                  <div
                    key={preset.title}
                    className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 text-sm transition hover:border-white/30"
                  >
                    <span className="text-xs uppercase tracking-wide text-slate-300/70">
                      {preset.title}
                    </span>
                    <p className="mt-1 text-slate-100/90">{preset.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-3xl border border-white/5 bg-slate-900/60 p-5 backdrop-blur md:grid-cols-3">
              {insightCards.map((card) => (
                <div
                  key={card.label}
                  className="space-y-1 border-white/10 md:border-r last:border-none md:last:border-none"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {card.label}
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-5 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Session roadmap
              </p>
              <div className="mt-6 space-y-5">
                {learningMilestones.map((step, index) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-sm font-medium text-white/90">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">
                        {step.title}
                      </p>
                      <p className="text-sm text-slate-300/90">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="relative flex min-h-0 flex-1">
            <div className="flex h-full w-full flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                    Live teaching canvas
                  </p>
                  <p className="text-2xl font-semibold text-white">
                    Build, annotate, and highlight in sync with the agent.
                  </p>
                </div>
                <span className="rounded-full border border-green-300/40 bg-green-300/10 px-4 py-1 text-sm font-semibold text-green-200">
                  Live session
                </span>
              </div>

              <div className="mt-6 flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-slate-950/80 shadow-[0_35px_120px_0_rgba(15,23,42,0.9)]">
                <div className="flex items-center justify-between border-b border-white/5 px-5 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <span>Canvas feed</span>
                  <span>Graph actions render here</span>
                </div>
                <div className="flex flex-1 items-center justify-center bg-slate-950 p-4">
                  <div className="w-full max-w-3xl">
                    <TeachingCanvas />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </CopilotSidebar>
  );
}
