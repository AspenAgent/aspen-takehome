export interface DocumentContent {
  title: string;
  subtitle: string;
  coverTagline: string;
  sections: Section[];
  nextStep: NextStep;
}

export interface Section {
  number: string;
  eyebrow: string;
  title: string;
  body: string;
  callout?: { label: string; text: string };
  keyPoints?: string[];
}

export interface NextStep {
  title: string;
  description: string;
  cta: string;
}
