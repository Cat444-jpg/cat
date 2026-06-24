import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  GraduationCap, 
  HelpCircle, 
  BookOpen, 
  RotateCcw, 
  Send, 
  ArrowLeft, 
  Sparkles, 
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";
import { Message, TutorResponse } from "./types";
import MathCheatsheet from "./components/MathCheatsheet";
import SocraticExplainer from "./components/SocraticExplainer";
import MathCanvas from "./components/MathCanvas";
import MathTimeline from "./components/MathTimeline";

export default function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [tutorResponse, setTutorResponse] = useState<TutorResponse | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [stepsHistory, setStepsHistory] = useState<{
    stepNumber: number;
    title: string;
    formula: string;
    explanation: string;
  }[]>([]);
  
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever tutor response or chat history updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tutorResponse, chatHistory, isLoading]);

  // Handle problem submissions (either custom text, uploaded image, or ready examples)
  const handleProblemSubmit = async (text: string, imageData: string | null) => {
    setIsLoading(true);
    setError(null);
    setActiveImage(imageData);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: [], // fresh start
          userMessage: text || null,
          image: imageData || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An error occurred while talking to Socrates.");
      }

      const data: TutorResponse = await response.json();
      setTutorResponse(data);
      
      // Initialize chat history with the user starting input and tutor reply
      const initialHistory: Message[] = [];
      if (text) {
        initialHistory.push({ role: "user", text: text });
      } else if (imageData) {
        initialHistory.push({ role: "user", text: "[Uploaded a math problem image]" });
      }
      
      initialHistory.push({ role: "model", text: `${data.stepTitle}\n\nFormula: ${data.mathFormula}\n\nExplanation: ${data.explanation}\n\nQuestion: ${data.socraticQuestion}` });
      
      setChatHistory(initialHistory);
      setIsSessionActive(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please check your network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending text or preset replies
  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    // Local update of student turn
    const updatedHistory: Message[] = [...chatHistory, { role: "user", text: messageText }];
    setChatHistory(updatedHistory);
    setUserMessage("");
    setIsLoading(true);
    setError(null);

    // Save previous step if we detect student is advancing
    // Note: If they click "Why did we do that?", we keep currentStepNumber the same.
    const isAdvancing = !messageText.toLowerCase().includes("why did we do that") && 
                        !messageText.toLowerCase().includes("explain") &&
                        !messageText.toLowerCase().includes("stuck") &&
                        tutorResponse;

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: updatedHistory,
          userMessage: messageText,
          image: null, // Image only uploaded on initiation
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An error occurred.");
      }

      const data: TutorResponse = await response.json();
      
      // If we are indeed moving to a new step, archive the previous step in timeline
      if (isAdvancing && tutorResponse && data.currentStepNumber > tutorResponse.currentStepNumber) {
        setStepsHistory(prev => [
          ...prev,
          {
            stepNumber: tutorResponse.currentStepNumber,
            title: tutorResponse.stepTitle,
            formula: tutorResponse.mathFormula,
            explanation: tutorResponse.explanation,
          }
        ]);
      }

      setTutorResponse(data);
      setChatHistory(prev => [
        ...prev,
        { role: "model", text: `${data.stepTitle}\n\nFormula: ${data.mathFormula}\n\nExplanation: ${data.explanation}\n\nQuestion: ${data.socraticQuestion}` }
      ]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to reach Socrates. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSession = () => {
    setIsSessionActive(false);
    setTutorResponse(null);
    setChatHistory([]);
    setStepsHistory([]);
    setError(null);
    setActiveImage(null);
  };

  return (
    <div id="math-tutor-app" className="min-h-screen bg-bento-bg flex flex-col font-sans text-bento-dark">
      {/* Top Banner/Navigation bar */}
      <header id="top-navbar" className="bg-white/80 backdrop-blur-md border-b border-bento-border sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-bento-primary flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
              Σ
            </div>
            <div>
              <h1 className="font-serif font-extrabold text-bento-dark leading-tight">
                Sigma Socrates
              </h1>
              <p className="text-[9px] text-bento-muted font-mono tracking-wider">COMPASSIONATE MATH COMPANION</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="desk-reference-btn"
              onClick={() => setShowCheatsheet(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-bento-primary hover:bg-bento-highlight rounded-xl transition-all border border-bento-border"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Desk Reference</span>
            </button>

            {isSessionActive && (
              <button
                id="reset-session-btn"
                onClick={handleResetSession}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-rose-100"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Desk</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Area */}
      <main id="main-content-layout" className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!isSessionActive ? (
            /* Welcome / Problem Intake Stage */
            <motion.div
              id="intake-stage-container"
              key="intake-stage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="py-6 flex justify-center"
            >
              <MathCanvas onProblemSubmit={handleProblemSubmit} isLoading={isLoading} />
            </motion.div>
          ) : (
            /* Active Socratic Learning Workspace */
            <motion.div
              id="workspace-stage-container"
              key="workspace-stage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-6xl w-full mx-auto"
            >
              {/* Back button to return to home */}
              <div className="col-span-12 flex justify-start mb-1">
                <button
                  id="nav-back-to-intake"
                  onClick={handleResetSession}
                  className="flex items-center gap-1.5 text-xs font-semibold text-bento-muted hover:text-bento-dark transition-colors py-1.5 px-3 rounded-lg hover:bg-white border border-bento-border/50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Choose Another Problem</span>
                </button>
              </div>

              {/* Left/Main Column - Socratic Tutor Area */}
              <div className="lg:col-span-7 space-y-6">
                {tutorResponse && (
                  <SocraticExplainer response={tutorResponse} isLoading={isLoading} />
                )}

                {/* Socratic Suggested Replies Panels */}
                {tutorResponse && (
                  <div id="suggested-replies-container" className="space-y-2.5">
                    <span className="text-[10px] font-bold text-bento-primary uppercase tracking-widest block pl-2">
                      Socratic Pathways
                    </span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {tutorResponse.suggestedReplies.map((reply, index) => (
                        <button
                          id={`suggested-reply-btn-${index}`}
                          key={index}
                          onClick={() => handleSendMessage(reply)}
                          disabled={isLoading}
                          className="text-left w-full p-4 bg-white border border-bento-border hover:border-bento-primary hover:bg-bento-highlight rounded-[20px] transition-all text-sm font-semibold text-bento-dark flex justify-between items-center group disabled:opacity-60 shadow-xs"
                        >
                          <span className="pr-4">{reply}</span>
                          <ChevronRight className="w-4 h-4 text-bento-primary flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Problem Info, Timeline, and Custom Chat */}
              <div className="lg:col-span-5 space-y-6">
                {/* Active Problem Card */}
                {tutorResponse && (
                  <div id="active-problem-summary-card" className="bg-bento-primary text-white rounded-[32px] p-6 shadow-sm relative overflow-hidden border border-bento-primary/10">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-bento-highlight/80">
                          Active Workspace
                        </span>
                        <h3 className="font-serif font-bold text-lg text-white leading-snug">
                          {tutorResponse.problemTitle}
                        </h3>
                      </div>
                    </div>

                    {/* Step bar */}
                    <div className="space-y-1.5 mt-4">
                      <div className="flex justify-between items-center text-xs text-bento-highlight/90">
                        <span>Problem resolution progress</span>
                        <span className="font-mono text-white font-bold">
                          {Math.round((tutorResponse.currentStepNumber / tutorResponse.totalStepsEstimate) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-white h-full rounded-full transition-all duration-500"
                          style={{ width: `${(tutorResponse.currentStepNumber / tutorResponse.totalStepsEstimate) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Preview of uploaded image if exists */}
                    {activeImage && (
                      <div className="mt-4 pt-4 border-t border-white/15 flex gap-3 items-center">
                        <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-white/10 flex items-center justify-center p-1">
                          <img
                            src={activeImage}
                            alt="Problem Thumbnail"
                            className="object-contain w-full h-full"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">Solving using photo source</p>
                          <p className="text-[10px] text-bento-highlight/80">Image understood by Gemini 3.1 Pro</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Path of Logic (Socratic Completed Steps Tracker) */}
                <MathTimeline stepsHistory={stepsHistory} />

                {/* Socratic Dialogue Chat box */}
                <div id="dialogue-box" className="bg-white border border-bento-border shadow-sm rounded-[32px] p-6 flex flex-col h-[380px]">
                  <div className="border-b border-bento-border/40 pb-3 mb-4">
                    <h4 className="font-serif font-bold text-bento-dark text-sm">Socratic Dialogue</h4>
                  </div>

                  {/* Message scroll container */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                    {chatHistory.map((msg, index) => {
                      if (index === 0 && msg.text.includes("math problem image")) return null; // hide mock upload start msg
                      
                      const isUser = msg.role === "user";
                      // Parse model message to display only custom replies nicely if needed, or simple text representation
                      const displayMsgText = isUser 
                         ? msg.text 
                        : msg.text.split("\n\nExplanation: ")[1]?.split("\n\nQuestion: ")[0] || msg.text;

                      return (
                        <div
                          id={`chat-msg-${index}`}
                          key={index}
                          className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-[20px] p-3.5 leading-relaxed font-sans ${
                              isUser
                                ? "bg-bento-primary text-white rounded-tr-none shadow-xs font-semibold"
                                : "bg-bento-chat-bg text-bento-dark border border-bento-border/40 rounded-tl-none"
                            }`}
                          >
                            <p className="whitespace-pre-line">{displayMsgText}</p>
                          </div>
                        </div>
                      );
                    })}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-bento-chat-bg text-bento-muted rounded-[20px] rounded-tl-none p-3.5 flex items-center gap-2 border border-bento-border/40">
                          <div className="w-1.5 h-1.5 bg-bento-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-1.5 bg-bento-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-1.5 h-1.5 bg-bento-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat input form */}
                  <form
                    id="dialogue-input-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(userMessage);
                    }}
                    className="mt-4 pt-3 border-t border-bento-border/40 flex gap-2"
                  >
                    <input
                      id="dialogue-text-input"
                      type="text"
                      placeholder="Ask Socrates a custom math question..."
                      disabled={isLoading}
                      className="flex-1 rounded-xl border border-bento-border px-4 py-2.5 text-xs text-bento-dark focus:outline-none focus:ring-2 focus:ring-bento-primary focus:border-transparent transition-all bg-bento-spot placeholder-bento-muted-light"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                    />
                    <button
                      id="send-dialogue-btn"
                      type="submit"
                      disabled={isLoading || !userMessage.trim()}
                      className="p-2.5 bg-bento-primary hover:bg-bento-primary-dark text-white rounded-xl transition-all shadow-sm disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Floating Error Alert banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              id="error-banner"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-xl z-50 flex gap-3 items-start"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="font-sans font-bold text-bento-dark text-sm">Deskside Error</h5>
                <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* References Desk Reference Cheatsheet Modal */}
        {showCheatsheet && (
          <MathCheatsheet onClose={() => setShowCheatsheet(false)} />
        )}
      </main>

      {/* Footer info strip */}
      <footer id="bottom-footer-strip" className="bg-white border-t border-bento-border/50 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] text-bento-muted font-mono space-y-1.5">
          <p className="tracking-wider uppercase font-bold">SIGMA SOCRATES MATH TUTOR · DESIGNED FOR MATURE UNDERSTANDING</p>
          <p className="text-[9px] text-bento-muted-light">powered by Google Gemini-3.1-pro-preview with thinking mode HIGH</p>
        </div>
      </footer>
    </div>
  );
}
