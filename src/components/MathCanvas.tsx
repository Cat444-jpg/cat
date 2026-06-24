import React, { useRef, useState } from "react";
import { Upload, FileImage, Trash2, HelpCircle, ArrowRight } from "lucide-react";

interface MathCanvasProps {
  onProblemSubmit: (text: string, imageData: string | null) => void;
  isLoading: boolean;
}

export default function MathCanvas({ onProblemSubmit, isLoading }: MathCanvasProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const examples = [
    {
      title: "Calculus: Product Rule Derivative",
      prompt: "Find the derivative of f(x) = x^2 * ln(x) with respect to x.",
      description: "Requires product rule and logarithmic differentiation.",
    },
    {
      title: "Algebra: Quadratic Factoring",
      prompt: "Solve the quadratic equation: 3x^2 - 14x + 8 = 0",
      description: "Solve by factoring or using the quadratic formula.",
    },
    {
      title: "Calculus: Definite Integral",
      prompt: "Evaluate the definite integral of (2x + 3) dx from 1 to 3.",
      description: "Definite integration under a linear function.",
    },
  ];

  // Drag handers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Convert image to base64
  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText && !selectedImage) return;
    onProblemSubmit(customText, selectedImage);
  };

  const triggerExample = (examplePrompt: string) => {
    onProblemSubmit(examplePrompt, null);
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div id="math-canvas-container" className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      {/* Intro greeting */}
      <div id="canvas-intro-box" className="text-center space-y-2 max-w-xl mx-auto">
        <h2 className="font-serif text-3xl font-extrabold text-bento-dark tracking-tight md:text-4xl">
          Socratic Math Desk
        </h2>
        <p className="text-sm md:text-base text-bento-muted font-sans leading-relaxed">
          I will help you solve any algebraic or calculus problem. Upload a photo or type it in, and we will walk through it one step at a time.
        </p>
      </div>

      <form id="problem-form" onSubmit={handleFormSubmit} className="space-y-6">
        {/* Upload panel & Text input area */}
        <div id="upload-panel" className="bg-white border border-bento-border rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
          <div
            id="drag-and-drop-zone"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              dragActive ? "border-bento-primary bg-bento-highlight/50" : "border-bento-muted-light/40 hover:border-bento-primary bg-bento-spot"
            }`}
            onClick={onButtonClick}
          >
            <input
              id="file-upload-input"
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
            />

            {!selectedImage ? (
              <div id="drag-inner-instructions" className="space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-bento-highlight flex items-center justify-center border border-bento-border/50">
                  <Upload className="w-5 h-5 text-bento-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-bento-dark">
                    Drag and drop a photo of your math problem here
                  </p>
                  <p className="text-xs text-bento-muted">
                    Supports PNG, JPEG, or JPG (up to 10MB)
                  </p>
                </div>
                <button
                  id="browse-btn"
                  type="button"
                  className="px-4 py-2 text-xs font-semibold text-bento-primary bg-bento-highlight hover:bg-bento-border/40 rounded-xl transition-all border border-bento-border"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div id="uploaded-image-preview" className="space-y-4 w-full max-w-sm mx-auto" onClick={(e) => e.stopPropagation()}>
                <div className="relative rounded-xl overflow-hidden border border-bento-border shadow-md bg-white max-h-48 flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt="Math Problem Preview"
                    className="object-contain max-h-44 w-auto"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    id="trash-image-btn"
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-md transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 justify-center text-xs text-bento-muted">
                  <FileImage className="w-4 h-4 text-emerald-600" />
                  <span>Image added successfully</span>
                </div>
              </div>
            )}
          </div>

          {/* Text Input area */}
          <div id="text-input-field-group" className="space-y-2">
            <label htmlFor="math-problem-text" className="text-xs font-bold text-bento-muted-light uppercase tracking-wider block">
              Describe your problem (optional if image is uploaded)
            </label>
            <textarea
              id="math-problem-text"
              rows={3}
              placeholder="E.g., Find the integral of x^3 * e^x dx..."
              className="w-full rounded-2xl border border-bento-border p-4 font-sans text-sm text-bento-dark placeholder-bento-muted-light/60 focus:outline-none focus:ring-2 focus:ring-bento-primary focus:border-transparent transition-all bg-[#FDFCFB]"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
            />
          </div>

          {/* Form action submission */}
          <button
            id="start-session-btn"
            type="submit"
            disabled={isLoading || (!customText && !selectedImage)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 font-semibold text-white bg-bento-primary hover:bg-bento-primary-dark rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Philosophizing math problem...</span>
              </div>
            ) : (
              <>
                <span>Sit with Socrates</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Try Examples Section */}
      <div id="try-examples-panel" className="space-y-3">
        <div className="flex items-center gap-2 text-bento-muted-light">
          <HelpCircle className="w-4 h-4 text-bento-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">Try a ready example problem</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {examples.map((item, index) => (
            <button
              id={`example-btn-${index}`}
              key={index}
              type="button"
              onClick={() => triggerExample(item.prompt)}
              disabled={isLoading}
              className="text-left p-5 bg-white border border-bento-border hover:border-bento-primary rounded-[24px] shadow-xs transition-all flex flex-col justify-between group disabled:opacity-60"
            >
              <div>
                <span className="text-[10px] font-bold text-bento-primary uppercase tracking-widest block mb-1">
                  {item.title.split(":")[0]}
                </span>
                <h4 className="font-serif font-bold text-bento-dark text-sm group-hover:text-bento-primary transition-colors">
                  {item.title.split(":")[1]}
                </h4>
                <p className="text-xs text-bento-muted mt-1.5 line-clamp-2 italic font-mono bg-bento-chat-bg p-2 rounded-lg border border-bento-border/20">
                  {item.prompt}
                </p>
              </div>
              <span className="text-[10px] text-bento-muted-light mt-3 block">{item.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
