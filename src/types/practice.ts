export interface PracticeStep {
  title: string;
  explanation: string;
  command?: string;
  codeSnippet?: {
    filename: string;
    language: string;
    code: string;
  };
  tip?: string;
}

export interface PracticeWorkshop {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  estimatedTime: string;
  iconName: string;
  realWorldContext: string;
  learningObjectives: string[];
  steps: PracticeStep[];
  verificationChecklist: string[];
}
