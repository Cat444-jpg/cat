import React from "react";
import { CheckCircle2, ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import { TutorResponse } from "../types";

interface MathTimelineProps {
  stepsHistory: {
    stepNumber: number;
    title: string;
    formula: string;
    explanation: string;
  }[];
}

export default function MathTimeline({ stepsHistory }: MathTimelineProps) {
  if (stepsHistory.length === 0) return null;

  return (
    <div id="math-timeline-container" className="bg-white border border-bento-border shadow-sm rounded-[32px] p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-bento-border/40 pb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-bento-primary animate-pulse" />
        <h4 className="font-serif font-bold text-bento-dark text-sm">Path of Logic</h4>
      </div>

      <div className="relative border-l-2 border-bento-border/50 ml-3.5 pl-5 space-y-4">
        {stepsHistory.map((step, idx) => (
          <div id={`timeline-step-${idx}`} key={idx} className="relative">
            {/* Absolute Dot/Indicator */}
            <div className="absolute -left-[27px] top-0 bg-white p-0.5 rounded-full z-10 border border-bento-border/60">
              <CheckCircle2 className="w-4 h-4 text-bento-primary" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-bento-primary bg-bento-highlight px-1.5 py-0.5 rounded border border-bento-border/50 uppercase tracking-wider">
                  Step {step.stepNumber}
                </span>
                <h5 className="font-sans font-bold text-bento-dark text-xs">
                  {step.title}
                </h5>
              </div>

              {/* Collapsed view formula */}
              <code className="text-xs font-mono text-bento-primary-dark bg-bento-highlight/40 p-1.5 rounded-lg border border-bento-border/20 block overflow-x-auto whitespace-nowrap">
                {step.formula}
              </code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
