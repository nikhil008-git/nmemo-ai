"use client";

import { ChevronDown } from "@/components/landing/icons";
import { cn } from "@/lib/utils";
import { useState } from "react";

const questions = [
  [
    "What is nmemo?",
    "A multi-source context engine for AI agents. It retrieves relevant evidence, selects what fits the task and token budget, and returns one inspectable context package.",
  ],
  [
    "What does my agent receive?",
    "A ranked prompt package with citations, source status, token usage, retrieval diagnostics, and the evidence behind every selection.",
  ],
  [
    "Can I see why context was selected?",
    "Yes. You can inspect which sources responded, what was ranked or discarded, the scores behind each result, and how the token budget was used.",
  ],
  [
    "Which sources can I connect?",
    "The launch surface supports documents, memory, Slack, Notion, GitHub, and Qdrant retrieval. The shared retriever contract keeps the source layer extensible.",
  ],
  [
    "Do I have to switch agent frameworks?",
    "No. Keep your current model and framework. Use the Context API or SDK inside the agent stack you already run.",
  ],
  [
    "How is this different from a vector database?",
    "A vector database retrieves stored data. nmemo coordinates sources, ranks evidence, controls the prompt budget, and shows exactly what enters the model.",
  ],
  [
    "Is there an SDK?",
    "Yes. The workspace SDK exposes getContext() and getContextFast(), alongside the Context API for direct HTTP integration.",
  ],
] as const;

export function FaqAccordion() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  return (
    <div className="space-y-1 font-sans">
      {questions.map(([question, answer], index) => {
        const open = openQuestion === index;
        const contentId = `faq-answer-${index}`;

        return (
          <div key={question}>
            <button
              type="button"
              onClick={() => setOpenQuestion(open ? null : index)}
              aria-expanded={open}
              aria-controls={contentId}
              className="flex w-full items-center gap-5 py-4 text-left text-[17px] font-medium tracking-[-0.01em] text-ink/75 transition-colors duration-200 hover:text-ink"
            >
              <span>{question}</span>
              <ChevronDown
                className={cn(
                  "ml-auto size-[17px] shrink-0 text-ink/30 transition-transform duration-300 ease-out",
                  open && "rotate-180",
                )}
              />
            </button>
            <div
              id={contentId}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                open
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-[62ch] pb-5 pr-10 text-[15px] leading-relaxed text-ink/45">
                  {answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
