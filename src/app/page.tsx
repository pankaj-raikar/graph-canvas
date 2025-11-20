"use client";

import { TeachingCanvas } from "@/components/TeachingCanvas";
import { CopilotSidebar } from "@copilotkit/react-ui";

const suggestionPresets = [
  {
    title: "Simple Graph",
    message: "Draw a simple triangle graph with 3 vertices.",
  },
  {
    title: "Complete Graph",
    message: "Show me a complete graph with 4 vertices.",
  },
  {
    title: "Directed Graph",
    message: "Create a directed graph showing a path.",
  },
  {
    title: "Weighted Graph",
    message: "Draw a weighted graph with edge weights.",
  },
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
        initial: "Ask me to draw any graph concept.",
      }}
      suggestions={suggestionPresets}
      className="h-screen"
    >
      <main className="flex h-screen w-full bg-gray-50">
        {/* Canvas Section - Right Side */}
        <section className="flex-1 flex items-center justify-center p-8">
          <div className="w-full h-full max-w-5xl rounded-3xl border-2 border-gray-200 bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Teaching Canvas
                </h2>
                <p className="text-sm text-gray-600">
                  Interactive Graph Visualization
                </p>
              </div>
              <span className="px-4 py-2 rounded-full bg-green-100 border border-green-300 text-green-700 text-sm font-semibold">
                ● Live
              </span>
            </div>
            <div className="flex items-center justify-center h-[calc(100%-76px)] bg-white p-6">
              <TeachingCanvas />
            </div>
          </div>
        </section>
      </main>
    </CopilotSidebar>
  );
}
