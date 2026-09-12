export type CurrentStatus = "student" | "graduate" | "career_change" | "employed";

export type PrepStatus = "portfolio_in_progress" | "resume_not_started" | "applying";

export type ActivityCategory =
  | "대외활동"
  | "공모전"
  | "교육/부트캠프"
  | "인턴"
  | "프로젝트/해커톤";

export type PortfolioFile = {
  name: string;
  mediaType: string;
  data: string;
};

export type ProjectExperience = {
  name: string;
  description: string;
  role: string;
  work: string;
  tech: string[];
};

export type UserProfile = {
  targetRole: string;
  major: string | null;
  currentStatus: CurrentStatus;
  prepStatus: PrepStatus;
  preferredCategories?: ActivityCategory[];
  hasPortfolio: boolean;
  portfolio?: {
    urls?: string[];
    text?: string;
    files?: PortfolioFile[];
  };
  experience?: {
    skills: string[];
    projects: ProjectExperience[];
    activities: string[];
    internships: string[];
    certificates: string[];
  };
};

export type CompetencyItem = {
  name: string;
  evidence: string | null;
  reason: string;
  priority?: number;
};

export type AnalysisResult = {
  summary: string;
  readinessScore: number;
  requiredCompetencies: string[];
  strengths: CompetencyItem[];
  gaps: CompetencyItem[];
  unknowns: CompetencyItem[];
};

export type Activity = {
  title: string;
  organization: string | null;
  category: ActivityCategory;
  startDate: string | null;
  endDate: string | null;
  target: string | null;
  url: string;
  source: string;
  relatedSkills: string[];
  recommendationScore: number;
  recommendationReason: string;
  checkedAt: string;
};

export type RecommendResult = {
  activities: Activity[];
};

export const CURRENT_STATUS_OPTIONS: Array<{ value: CurrentStatus; label: string }> = [
  { value: "student", label: "대학생·재학" },
  { value: "graduate", label: "졸업·취업 준비" },
  { value: "career_change", label: "이직 준비" },
  { value: "employed", label: "재직 중" },
];

export const PREP_STATUS_OPTIONS: Array<{ value: PrepStatus; label: string }> = [
  { value: "portfolio_in_progress", label: "포트폴리오를 만드는 중" },
  { value: "resume_not_started", label: "이력서는 아직" },
  { value: "applying", label: "이미 지원 중" },
];

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  "대외활동",
  "공모전",
  "교육/부트캠프",
  "인턴",
  "프로젝트/해커톤",
];
