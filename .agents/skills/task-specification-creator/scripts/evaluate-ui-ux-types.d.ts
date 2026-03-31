export interface SemanticTestResult {
  ariaLabels: Array<{ tag: string; label: string | null; role: string | null }>;
  accessibilitySnapshot: unknown;
  tabIndexElements: Array<{
    tag: string;
    tabIndex: number;
    role: string | null;
  }>;
  keyboardFocus: string | undefined;
}

export interface UXEvaluationResult {
  usabilityIssues: UXIssue[];
  accessibilityConcerns: A11yConcern[];
  improvements: Improvement[];
}

export interface UXIssue {
  id: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

export interface A11yConcern {
  id: string;
  concern: string;
  wcagCriteria: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

export interface Improvement {
  priority: number;
  suggestion: string;
  effort: "LOW" | "MEDIUM" | "HIGH";
}
