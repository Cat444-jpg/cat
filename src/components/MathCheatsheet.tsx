import React from "react";
import { BookOpen, X } from "lucide-react";

interface CheatsheetProps {
  onClose: () => void;
}

export default function MathCheatsheet({ onClose }: CheatsheetProps) {
  const categories = [
    {
      title: "Common Derivatives",
      rules: [
        { name: "Power Rule", formula: "d/dx [xⁿ] = n · xⁿ⁻¹" },
        { name: "Sine & Cosine", formula: "d/dx [sin(x)] = cos(x) | d/dx [cos(x)] = -sin(x)" },
        { name: "Exponential", formula: "d/dx [eˣ] = eˣ | d/dx [aˣ] = aˣ · ln(a)" },
        { name: "Product Rule", formula: "d/dx [f · g] = f'g + fg'" },
        { name: "Quotient Rule", formula: "d/dx [f / g] = (f'g - fg') / g²" },
        { name: "Chain Rule", formula: "d/dx [f(g(x))] = f'(g(x)) · g'(x)" },
      ],
    },
    {
      title: "Algebra & Logarithms",
      rules: [
        { name: "Difference of Squares", formula: "a² - b² = (a - b)(a + b)" },
        { name: "Quadratic Formula", formula: "x = (-b ± √(b² - 4ac)) / (2a)" },
        { name: "Product Rule (Log)", formula: "log(x · y) = log(x) + log(y)" },
        { name: "Quotient Rule (Log)", formula: "log(x / y) = log(x) - log(y)" },
        { name: "Power Rule (Log)", formula: "log(xⁿ) = n · log(x)" },
        { name: "Change of Base", formula: "log_a(x) = ln(x) / ln(a)" },
      ],
    },
  ];

  return (
    <div id="math-cheatsheet-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-bento-dark/20 backdrop-blur-xs p-4">
      <div id="math-cheatsheet-container" className="bg-bento-bg border border-bento-border shadow-2xl rounded-[32px] max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col p-6 md:p-8 animate-float-in">
        <div id="math-cheatsheet-header" className="flex items-center justify-between border-b border-bento-border/40 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-bento-primary" />
            <h3 className="font-serif text-xl font-bold text-bento-dark">Socrates' Math Desk Reference</h3>
          </div>
          <button
            id="close-cheatsheet-btn"
            onClick={onClose}
            className="p-1.5 text-bento-muted hover:bg-bento-highlight rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div id="math-cheatsheet-body" className="space-y-6">
          {categories.map((category, idx) => (
            <div id={`cheatsheet-category-${idx}`} key={idx} className="space-y-3">
              <h4 className="font-sans font-bold text-xs text-bento-primary uppercase tracking-wider">
                {category.title}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.rules.map((rule, ruleIdx) => (
                  <div
                    id={`cheatsheet-rule-${idx}-${ruleIdx}`}
                    key={ruleIdx}
                    className="p-4 bg-white border border-bento-border rounded-2xl flex flex-col justify-between"
                  >
                    <span className="text-xs font-semibold text-bento-muted mb-1.5">{rule.name}</span>
                    <code className="text-sm font-mono text-bento-primary-dark bg-bento-highlight/50 p-2 rounded-lg border border-bento-border/30 block overflow-x-auto whitespace-nowrap">
                      {rule.formula}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div id="math-cheatsheet-footer" className="mt-6 pt-4 border-t border-bento-border/40 text-center">
          <p className="text-xs italic text-bento-muted">
            "Education is the kindling of a flame, not the filling of a vessel." — Socrates
          </p>
        </div>
      </div>
    </div>
  );
}
