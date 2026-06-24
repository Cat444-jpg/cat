import React, { useState } from "react";
import { Sparkles, BrainCircuit, ChevronDown, ChevronUp, AlertCircle, HelpCircle } from "lucide-react";
import { TutorResponse } from "../types";

interface SocraticExplainerProps {
  response: TutorResponse;
  isLoading: boolean;
}

export default function SocraticExplainer({ response, isLoading }: SocraticExplainerProps) {
  const [showThoughts, setShowThoughts] = useState(false);

  // Helper to format text with simple inline math $...$ highlighted as a span
  const formatText = (text: string) => {
    if (!text) return "";
    
    // Split by $ to detect inline math expressions
    const parts = text.split("$");
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <code key={index} className="px-1.5 py-0.5 font-mono text-sm font-semibold bg-bento-highlight text-bento-primary-dark rounded-md border border-bento-border/50">
            {part}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div id="socratic-explainer-card" className="flex flex-col gap-6 bg-white border border-bento-border shadow-sm rounded-[32px] p-6 md:p-8 relative overflow-hidden transition-all duration-300">
      {/* Absolute background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-bento-highlight rounded-bl-full -z-0 pointer-events-none" />

      {/* Header section with Tutor Persona */}
      <div id="tutor-header-bar" className="flex items-center justify-between gap-4 border-b border-bento-border/40 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-bento-primary border border-bento-primary/10 flex items-center justify-center shadow-sm relative overflow-hidden">
            <span className="text-2xl font-serif font-bold text-white select-none">Σ</span>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" title="Socrates is active" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-serif font-bold text-bento-dark text-lg leading-none">Socrates</h4>
              <span className="px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wider bg-bento-highlight text-bento-primary rounded-full border border-bento-border/60">
                Patient Tutor
              </span>
            </div>
            <p className="text-xs text-bento-muted mt-0.5">Guided math companion</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-bento-primary bg-bento-highlight px-3 py-1 rounded-full border border-bento-border/50">
            Step {response.currentStepNumber} of {response.totalStepsEstimate}
          </span>
        </div>
      </div>

      {/* Main explanation content */}
      <div id="tutor-explanation-content" className="space-y-5 relative z-10">
        <div>
          <span className="text-[10px] font-bold text-bento-muted-light uppercase tracking-wider block mb-1">
            Current Action
          </span>
          <h3 className="font-serif font-bold text-bento-dark text-xl leading-snug">
            {response.stepTitle}
          </h3>
        </div>

        {/* The Math Formula Focus Box */}
        <div
          id="math-formula-focus-box"
          className="p-6 bg-bento-spot border border-bento-border rounded-2xl flex flex-col items-center justify-center text-center shadow-xs group hover:bg-white transition-all duration-300"
        >
          <span className="text-[10px] font-bold text-bento-muted-light uppercase tracking-widest mb-3 select-none">
            Mathematical Expression
          </span>
          <div className="w-full overflow-x-auto py-2 flex justify-center">
            <code className="text-lg md:text-2xl font-mono font-medium text-bento-primary-dark whitespace-pre">
              {response.mathFormula}
            </code>
          </div>
        </div>

        {/* The Narrative Explanation */}
        <div id="tutor-narrative" className="text-bento-muted leading-relaxed text-[15px] space-y-3 font-sans">
          <p className="whitespace-pre-line">{formatText(response.explanation)}</p>
        </div>

        {/* Socrates' Leading Question */}
        <div
          id="socratic-question-box"
          className="p-5 bg-bento-highlight border border-bento-border/60 rounded-2xl flex gap-3 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-12 h-12 bg-bento-border/20 rounded-bl-full pointer-events-none flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-bento-primary" />
          </div>
          <div className="flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-bento-primary animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-bento-primary uppercase tracking-wider block">
              Socrates' Thought Provoker
            </span>
            <p className="font-serif font-semibold text-bento-dark text-base leading-relaxed">
              {response.socraticQuestion}
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible thoughts / pedagogical reasoning section */}
      <div id="pedagogical-thoughts-section" className="border-t border-bento-border/40 pt-4 relative z-10">
        <button
          id="toggle-thoughts-btn"
          onClick={() => setShowThoughts(!showThoughts)}
          className="flex items-center justify-between w-full py-1.5 px-3 rounded-lg text-bento-muted hover:text-bento-dark hover:bg-bento-chat-bg transition-all text-xs font-medium"
        >
          <div className="flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 text-bento-primary" />
            <span>Socrates' Pedagogical Strategy</span>
          </div>
          {showThoughts ? <ChevronUp className="w-4 h-4 text-bento-primary" /> : <ChevronDown className="w-4 h-4 text-bento-primary" />}
        </button>

        {showThoughts && (
          <div
            id="pedagogical-thoughts-panel"
            className="mt-3 p-4 bg-bento-spot border border-bento-border rounded-xl text-xs text-bento-muted leading-relaxed space-y-2 animate-fade-in"
          >
            <div className="flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-bento-primary flex-shrink-0 mt-0.5" />
              <p className="italic">
                "As a teacher, I don't give answers; I trigger curiosity so you build a solid math foundation inside your own mind."
              </p>
            </div>
            <p className="pl-6 border-l border-bento-primary text-bento-dark">
              {response.thoughtProcess}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
