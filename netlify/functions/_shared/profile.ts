import type {
  ActivityCategory,
  CurrentStatus,
  PortfolioFile,
  PrepStatus,
  ProjectExperience,
  UserProfile,
} from "../../../src/types.ts";

const CURRENT = new Set<CurrentStatus>(["student", "graduate", "career_change", "employed"]);
const PREP = new Set<PrepStatus>(["portfolio_in_progress", "resume_not_started", "applying"]);
const CATEGORIES = new Set<ActivityCategory>([
  "대외활동",
  "공모전",
  "교육/부트캠프",
  "인턴",
  "프로젝트/해커톤",
]);

const MAX_TEXT = 8000;
const MAX_URLS = 5;
const MAX_FILES = 3;
const MAX_FILE_CHARS = 2_000_000;
const MAX_PAYLOAD_CHARS = 4_500_000;
const MAX_LIST = 20;
const MAX_PROJECTS = 8;

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const DOC_TYPES = new Set(["application/pdf"]);

function asString(value: unknown, max = MAX_TEXT): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function asStringList(value: unknown, maxItems = MAX_LIST): string[] {
  if (!Array.isArray(value)) return [];
  const items: string[] = [];
  for (const entry of value) {
    const text = asString(entry, 500);
    if (text) items.push(text);
    if (items.length >= maxItems) break;
  }
  return items;
}

function parseFiles(value: unknown): PortfolioFile[] | string {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return "파일 형식이 올바르지 않습니다.";
  if (value.length > MAX_FILES) return `파일은 ${MAX_FILES}개까지입니다.`;

  const files: PortfolioFile[] = [];
  let total = 0;
  for (const item of value) {
    if (!item || typeof item !== "object") return "파일 형식이 올바르지 않습니다.";
    const record = item as Record<string, unknown>;
    const name = asString(record.name, 200);
    const mediaType = asString(record.mediaType, 80);
    const data = typeof record.data === "string" ? record.data : "";
    if (!name || !mediaType || !data) return "파일 데이터가 없습니다.";
    if (!IMAGE_TYPES.has(mediaType) && !DOC_TYPES.has(mediaType)) {
      return "PDF 또는 jpeg, png, gif, webp만 첨부할 수 있습니다.";
    }
    if (data.length > MAX_FILE_CHARS) return "파일이 너무 큽니다.";
    total += data.length;
    if (total > MAX_PAYLOAD_CHARS) return "첨부 파일이 너무 큽니다.";
    files.push({ name, mediaType, data });
  }
  return files;
}

function parseProjects(value: unknown): ProjectExperience[] {
  if (!Array.isArray(value)) return [];
  const projects: ProjectExperience[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const name = asString(record.name, 200);
    if (!name) continue;
    projects.push({
      name,
      description: asString(record.description, 2000) ?? "",
      role: asString(record.role, 200) ?? "",
      work: asString(record.work, 2000) ?? "",
      tech: asStringList(record.tech, 20),
    });
    if (projects.length >= MAX_PROJECTS) break;
  }
  return projects;
}

export function parseUserProfile(
  body: unknown,
  options?: { requireDetails?: boolean },
): UserProfile | string {
  if (!body || typeof body !== "object") return "요청 형식이 올바르지 않습니다.";
  const source =
    "profile" in body && (body as { profile?: unknown }).profile
      ? (body as { profile: unknown }).profile
      : body;
  if (!source || typeof source !== "object") return "프로필이 없습니다.";
  const record = source as Record<string, unknown>;

  const targetRole = asString(record.targetRole, 200);
  if (!targetRole) return "희망 직무를 입력해 주세요.";

  const currentStatus = asString(record.currentStatus, 40);
  if (!currentStatus || !CURRENT.has(currentStatus as CurrentStatus)) {
    return "현재 상태가 올바르지 않습니다.";
  }
  const prepStatus = asString(record.prepStatus, 40);
  if (!prepStatus || !PREP.has(prepStatus as PrepStatus)) {
    return "준비 상태가 올바르지 않습니다.";
  }

  const hasPortfolio = record.hasPortfolio === true;
  const preferredCategories = asStringList(record.preferredCategories, 5).filter((item) =>
    CATEGORIES.has(item as ActivityCategory),
  ) as ActivityCategory[];

  const profile: UserProfile = {
    targetRole,
    major: asString(record.major, 200),
    currentStatus: currentStatus as CurrentStatus,
    prepStatus: prepStatus as PrepStatus,
    hasPortfolio,
    preferredCategories: preferredCategories.length > 0 ? preferredCategories : undefined,
  };

  if (hasPortfolio) {
    const rawPortfolio =
      record.portfolio && typeof record.portfolio === "object"
        ? (record.portfolio as Record<string, unknown>)
        : {};
    const urls = asStringList(rawPortfolio.urls, MAX_URLS).filter((url) =>
      /^https?:\/\//i.test(url),
    );
    const text = asString(rawPortfolio.text, MAX_TEXT) ?? undefined;
    const files = parseFiles(rawPortfolio.files);
    if (typeof files === "string") return files;
    if (
      (options?.requireDetails ?? true) &&
      urls.length === 0 &&
      !text &&
      files.length === 0
    ) {
      return "포트폴리오 URL, 텍스트, 파일 중 하나 이상을 넣어 주세요.";
    }
    profile.portfolio = {
      urls: urls.length > 0 ? urls : undefined,
      text,
      files: files.length > 0 ? files : undefined,
    };
    return profile;
  }

  const rawExp =
    record.experience && typeof record.experience === "object"
      ? (record.experience as Record<string, unknown>)
      : {};
  const experience = {
    skills: asStringList(rawExp.skills),
    projects: parseProjects(rawExp.projects),
    activities: asStringList(rawExp.activities),
    internships: asStringList(rawExp.internships),
    certificates: asStringList(rawExp.certificates),
  };
  const hasAny =
    experience.skills.length > 0 ||
    experience.projects.length > 0 ||
    experience.activities.length > 0 ||
    experience.internships.length > 0 ||
    experience.certificates.length > 0;
  if ((options?.requireDetails ?? true) && !hasAny) {
    return "보유 경험(기술, 프로젝트, 활동, 인턴, 자격증) 중 하나 이상을 입력해 주세요.";
  }
  profile.experience = experience;
  return profile;
}

const STATUS_LABEL: Record<CurrentStatus, string> = {
  student: "재학",
  graduate: "졸업/취업 준비",
  career_change: "이직/전직",
  employed: "재직 중",
};

const PREP_LABEL: Record<PrepStatus, string> = {
  portfolio_in_progress: "포트폴리오 준비 중",
  resume_not_started: "이력서 준비 전",
  applying: "지원 중",
};

export function profileToText(profile: UserProfile): string {
  const lines = [
    `희망 직무: ${profile.targetRole}`,
    `전공: ${profile.major ?? "미입력"}`,
    `현재 상태: ${STATUS_LABEL[profile.currentStatus]}`,
    `준비 상태: ${PREP_LABEL[profile.prepStatus]}`,
  ];
  if (profile.preferredCategories?.length) {
    lines.push(`관심 활동 유형: ${profile.preferredCategories.join(", ")}`);
  }
  if (profile.hasPortfolio && profile.portfolio) {
    lines.push("포트폴리오: 있음 (상세 경력 폼은 제출하지 않음. 포트폴리오에서만 경험을 추출할 것.)");
    if (profile.portfolio.text) {
      lines.push(`포트폴리오 텍스트:\n${profile.portfolio.text}`);
    }
    if (profile.portfolio.files?.length) {
      lines.push(`첨부 파일: ${profile.portfolio.files.map((file) => file.name).join(", ")}`);
    }
    return lines.join("\n");
  }

  const exp = profile.experience;
  lines.push("포트폴리오: 없음. 아래 입력된 경험만 사용.");
  lines.push(`보유 기술: ${exp?.skills.join(", ") || "미입력"}`);
  if (exp?.projects.length) {
    lines.push("프로젝트:");
    for (const project of exp.projects) {
      lines.push(
        `- ${project.name} / 역할: ${project.role || "미입력"} / 기술: ${project.tech.join(", ") || "미입력"}`,
      );
      if (project.description) lines.push(`  설명: ${project.description}`);
      if (project.work) lines.push(`  한 일: ${project.work}`);
    }
  } else {
    lines.push("프로젝트: 미입력");
  }
  lines.push(`대외활동/교육: ${exp?.activities.join(" | ") || "미입력"}`);
  lines.push(`인턴/경력: ${exp?.internships.join(" | ") || "미입력"}`);
  lines.push(`자격증: ${exp?.certificates.join(", ") || "미입력"}`);
  return lines.join("\n");
}
