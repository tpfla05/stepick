import type { Activity, ActivityCategory, AnalysisResult, UserProfile } from "../types.ts";

const LIST_URL = "https://linkareer.com/list/activity";
const SOURCE = "링커리어";

type CatalogItem = {
  title: string;
  organization: string;
  category: ActivityCategory;
  startDate: string | null;
  endDate: string;
  target: string;
  url: string;
  domains: string[];
  tags: string[];
  reason: string;
};

const ROLE_GROUPS: Array<{ keys: string[]; domains: string[] }> = [
  {
    keys: ["프론트", "백엔드", "풀스택", "개발", "엔지니어", "프로그래머", "소프트웨어", "앱", "웹 개발", "클라이언트"],
    domains: ["개발", "AI"],
  },
  {
    keys: ["데이터", "분석가", "머신러닝", "딥러닝", "데이터사이언스", "데이터 사이언"],
    domains: ["데이터", "AI", "개발"],
  },
  { keys: ["인공지능", "ai 엔지니어", "mlops"], domains: ["AI", "개발", "데이터"] },
  {
    keys: ["마케팅", "마케터", "홍보", "브랜드", "퍼포먼스", "그로스"],
    domains: ["마케팅", "콘텐츠"],
  },
  { keys: ["콘텐츠", "에디터", "영상", "카피", "크리에이터"], domains: ["콘텐츠", "마케팅"] },
  { keys: ["기획", "프로덕트", "pm", "po"], domains: ["기획", "마케팅"] },
  { keys: ["금융", "증권", "회계", "은행", "투자", "핀테크", "애널리스트"], domains: ["금융", "데이터"] },
  { keys: ["영업", "세일즈"], domains: ["영업", "마케팅"] },
  { keys: ["디자인", "ui", "ux"], domains: ["디자인", "콘텐츠"] },
];

/** https://linkareer.com/list/activity 모집 중 공고. 확인: 2026-09-14 */
const CATALOG: CatalogItem[] = [
  {
    title: "2026 주식회사 소프트뱅크(SoftBank) 채용 연계 해커톤 참가자 모집",
    organization: "Progate, KOREC",
    category: "프로젝트/해커톤",
    startDate: "2026-08-01",
    endDate: "2026-09-22",
    target: "학부·대학원 재학생",
    url: "https://linkareer.com/activity/340301",
    domains: ["개발", "AI"],
    tags: ["배포 경험", "협업", "클라우드"],
    reason: "클라우드로 짧은 기간에 만들고 시연까지 가서 구현·협업 공백을 채울 수 있습니다.",
  },
  {
    title: "서울대학교 빅데이터 AI핀테크 고급 전문가 과정",
    organization: "서울대학교 빅데이터 핀테크 과정",
    category: "교육/부트캠프",
    startDate: "2026-09-01",
    endDate: "2026-09-20",
    target: "대학(원) 졸업자·졸업예정자",
    url: "https://linkareer.com/activity/350175",
    domains: ["데이터", "AI", "금융", "개발"],
    tags: ["데이터", "AI", "직무 특화 실무"],
    reason: "빅데이터·AI·핀테크를 수업과 기업 프로젝트로 이어서 직무 실무를 깊게 채울 수 있습니다.",
  },
  {
    title: "[앵콜모집] 무스펙도 OK! AI로 직접 해보는 영업·마케팅 실무 프로젝트",
    organization: "한국대학생인재협회",
    category: "교육/부트캠프",
    startDate: "2026-09-07",
    endDate: "2026-09-16",
    target: "대학생·취준생",
    url: "https://linkareer.com/activity/348634",
    domains: ["마케팅", "영업", "콘텐츠"],
    tags: ["마케팅", "영업", "콘텐츠", "협업"],
    reason: "11주 동안 영업·마케팅 캠페인을 기획하고 실행해 직무 실무 공백을 메울 수 있습니다.",
  },
  {
    title: "링커리어 콘텐츠 에디터 28기 모집",
    organization: "링커리어",
    category: "대외활동",
    startDate: "2026-09-10",
    endDate: "2026-09-17",
    target: "대학 재학생·휴학생·유학생·졸업유예생",
    url: "https://linkareer.com/activity/349663",
    domains: ["콘텐츠", "마케팅"],
    tags: ["콘텐츠", "협업"],
    reason: "카드뉴스 기획·제작이 주 업무라 콘텐츠 실무가 부족한 경우에 맞습니다.",
  },
  {
    title: "[키움증권] 커뮤니티 서포터즈 4기 모집",
    organization: "키움증권(주)",
    category: "대외활동",
    startDate: "2026-09-09",
    endDate: "2026-09-20",
    target: "2~4년제 대학 재학생·휴학생",
    url: "https://linkareer.com/activity/349341",
    domains: ["금융", "기획"],
    tags: ["기획", "금융", "협업"],
    reason: "증권 커뮤니티를 개선하는 미션이라 금융·기획 직무와 맞닿아 있습니다.",
  },
  {
    title: "해커스금융 인강 서포터즈 3기 모집",
    organization: "챔프스터디",
    category: "대외활동",
    startDate: "2026-08-23",
    endDate: "2026-10-12",
    target: "금융·회계 취업 준비생·이직 준비자",
    url: "https://linkareer.com/activity/345031",
    domains: ["금융"],
    tags: ["금융", "콘텐츠"],
    reason: "금융 자격 학습과 포스팅을 같이 하므로 금융 직무 준비에 가깝습니다.",
  },
  {
    title: "제3기 <로드 두드림(Road to dream) 해외연수 프로그램> 참여자 모집",
    organization: "재단법인 자유기업원",
    category: "대외활동",
    startDate: "2026-09-07",
    endDate: "2026-10-16",
    target: "국내 대학 재학생",
    url: "https://linkareer.com/activity/341103",
    domains: ["기획"],
    tags: ["기획", "문제 정의"],
    reason: "연수 계획을 직접 세워 발표하므로 기획·문제 정의가 약한 경우에 가깝습니다.",
  },
  {
    title: "블라인드 캠퍼스 서포터즈 1기 모집",
    organization: "팀블라인드세일즈앤마케팅코리아",
    category: "대외활동",
    startDate: "2026-08-16",
    endDate: "2026-09-15",
    target: "대학생·대학원생",
    url: "https://linkareer.com/activity/345794",
    domains: ["마케팅", "콘텐츠"],
    tags: ["콘텐츠", "마케팅"],
    reason: "서비스 홍보 콘텐츠가 중심이라 마케팅·콘텐츠 직무에 맞습니다.",
  },
  {
    title: "독서 플랫폼 윌라 대학생 서포터즈 '윌프렌즈' 4기 모집",
    organization: "(주)인플루엔셜",
    category: "대외활동",
    startDate: "2026-09-01",
    endDate: "2026-09-15",
    target: "수도권 대학 재학생·휴학생",
    url: "https://linkareer.com/activity/347174",
    domains: ["콘텐츠", "마케팅"],
    tags: ["콘텐츠", "마케팅", "협업"],
    reason: "SNS 콘텐츠와 브랜드 마케팅이 주라 콘텐츠·마케팅 공백에 맞습니다.",
  },
  {
    title: "컨디션 대학생 서포터즈, 컨디션 C.R.E.W 2기 모집",
    organization: "컨디션",
    category: "대외활동",
    startDate: "2026-09-01",
    endDate: "2026-09-20",
    target: "수도권 거주 대학 재학생·휴학생",
    url: "https://linkareer.com/activity/346358",
    domains: ["마케팅", "콘텐츠"],
    tags: ["마케팅", "콘텐츠", "기획"],
    reason: "브랜드 숏폼과 캠퍼스 프로모션이라 마케팅 실무를 채울 때 맞습니다.",
  },
];

function todayKst(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

export function domainsForRole(role: string): string[] {
  const lower = role.toLowerCase();
  return [...new Set(ROLE_GROUPS.filter((group) => group.keys.some((key) => lower.includes(key))).flatMap((group) => group.domains))];
}

export function listOpenLinkareerActivities(today = todayKst()): CatalogItem[] {
  const open = CATALOG.filter((item) => item.endDate >= today);
  return open.length > 0 ? open : CATALOG;
}

function gapHits(item: CatalogItem, gaps: string[]): string[] {
  return gaps.filter((gap) =>
    item.tags.some((tag) => gap.includes(tag) || (tag.length >= 2 && tag.includes(gap.replace(/\s/g, "")))),
  );
}

function scoreItem(item: CatalogItem, profile: UserProfile, gaps: string[]): number {
  const roleDomains = domainsForRole(profile.targetRole);
  const domainHits = item.domains.filter((domain) => roleDomains.includes(domain));
  if (roleDomains.length > 0 && domainHits.length === 0) return 0;

  let score = 48;
  score += domainHits.length * 14;
  score += gapHits(item, gaps).length * 10;

  const preferred = profile.preferredCategories ?? [];
  if (preferred.length > 0 && preferred.includes(item.category)) score += 8;

  const role = profile.targetRole.toLowerCase();
  if (role && item.tags.some((tag) => role.includes(tag.toLowerCase()))) score += 6;

  return Math.min(96, score);
}

export function recommendFromLinkareer(
  profile: UserProfile,
  analysis: AnalysisResult,
): Activity[] {
  const today = todayKst();
  const gaps = analysis.gaps.slice(0, 3).map((gap) => gap.name);
  const open = CATALOG.filter((item) => item.endDate >= today);
  const pool = open.length > 0 ? open : CATALOG;

  return pool
    .map((item) => {
      const hits = gapHits(item, gaps);
      return {
        title: item.title,
        organization: item.organization,
        category: item.category,
        startDate: item.startDate,
        endDate: item.endDate,
        target: item.target,
        url: item.url,
        source: SOURCE,
        relatedSkills: hits,
        recommendationScore: scoreItem(item, profile, gaps),
        recommendationReason: item.reason,
        checkedAt: today,
      } satisfies Activity;
    })
    .filter((item) => item.recommendationScore >= 60)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 3);
}

export { LIST_URL };
