export interface Message {
  role: "user" | "model";
  text: string;
}

export interface TutorResponse {
  thoughtProcess: string;
  currentStepNumber: number;
  totalStepsEstimate: number;
  problemTitle: string;
  stepTitle: string;
  explanation: string;
  mathFormula: string;
  socraticQuestion: string;
  suggestedReplies: string[];
}
