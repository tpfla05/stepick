import type { AnalysisResult, RecommendResult, UserProfile } from "../types.ts";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockAnalyze(profile: UserProfile): Promise<AnalysisResult> {
  await wait(900);
  const role = profile.targetRole.trim() || "희망 직무";
  return {
    readinessScore: 68,
    summary: `${role} 기준으로 보면, 입력하신 경험에서 확인되는 강점은 분명합니다. 다만 배포·협업·직무 특화 실무는 자료만으로는 아직 얇아서, 그 간격을 메울 활동을 우선 찾는 편이 좋습니다. 이 결과는 확인된 입력만 근거로 한 예시 진단입니다.`,
    requiredCompetencies: ["핵심 구현", "협업", "배포 경험", "문제 정의"],
    strengths: [
      {
        name: "목표 직무가 분명함",
        evidence: profile.targetRole.trim() || null,
        reason: "희망 직무를 구체적으로 적어 주셔서, 부족한 역량을 직무 기준으로 나눌 수 있습니다.",
      },
      {
        name: "기술 또는 프로젝트 흔적이 있음",
        evidence: profile.experience?.skills.slice(0, 3).join(", ") || profile.portfolio?.text?.slice(0, 80) || null,
        reason: "보유 기술이나 포트폴리오 내용이 있어, 아예 빈 경력으로 보지 않았습니다.",
      },
      {
        name: "경험을 직접 정리하려는 태도",
        evidence: null,
        reason: "스스로 입력한 항목을 기준으로 판단했습니다. 없는 경험은 있다고 보지 않았습니다.",
      },
    ],
    gaps: [
      {
        name: "배포 경험",
        evidence: "배포·운영 관련 항목이 입력에 없음",
        reason: "실제 서비스가 사용자에게 나간 기록이 확인되지 않아, 직무 준비에서 우선 보완이 필요합니다.",
        priority: 1,
      },
      {
        name: "팀 협업 경험",
        evidence: "협업 도구·역할 분담이 명시된 프로젝트 없음",
        reason: "혼자 한 일로만 읽히면 협업 역량을 판단할 근거가 부족합니다.",
        priority: 2,
      },
      {
        name: "직무 특화 실무",
        evidence: `${role}에 맞는 심화 과제·인턴 기록이 없음`,
        reason: "희망 직무와 맞닿은 실무 과제가 아직 얇아 보입니다.",
        priority: 3,
      },
    ],
    unknowns: [
      {
        name: "정량 성과",
        evidence: null,
        reason: "사용자 수, 성능, 기여도처럼 숫자로 확인된 결과가 없어 보유 여부를 판단하지 않았습니다.",
      },
    ],
  };
}

export async function mockRecommend(
  profile: UserProfile,
  analysis: AnalysisResult,
): Promise<RecommendResult> {
  await wait(400);
  const gapNames = analysis.gaps.slice(0, 3).map((gap) => gap.name);
  const role = profile.targetRole.trim() || "희망 직무";
  return {
    activities: [
      {
        title: `${role} 팀 프로젝트 부트캠프`,
        organization: "예시 교육기관",
        category: "교육/부트캠프",
        startDate: "2026-09-20",
        endDate: "2026-10-31",
        target: "취업 준비생",
        url: "https://linkareer.com",
        source: "예시 공고",
        relatedSkills: gapNames.slice(0, 2),
        recommendationScore: 92,
        recommendationReason: "배포와 협업을 한 사이클에서 채워 부족한 역량을 동시에 보완할 수 있습니다.",
        checkedAt: "2026-09-12",
      },
      {
        title: "실서비스 아이디어 공모전",
        organization: "예시 주최기관",
        category: "공모전",
        startDate: "2026-09-15",
        endDate: "2026-10-18",
        target: "대학생·졸업예정자",
        url: "https://linkareer.com",
        source: "예시 공고",
        relatedSkills: [gapNames[2] ?? "직무 특화 실무"],
        recommendationScore: 84,
        recommendationReason: "직무와 맞닿은 문제를 기획부터 결과물까지 남길 수 있습니다.",
        checkedAt: "2026-09-12",
      },
      {
        title: "주말 해커톤",
        organization: "예시 커뮤니티",
        category: "프로젝트/해커톤",
        startDate: "2026-09-26",
        endDate: "2026-09-27",
        target: "누구나",
        url: "https://linkareer.com",
        source: "예시 공고",
        relatedSkills: gapNames,
        recommendationScore: 79,
        recommendationReason: "짧은 기간에 팀으로 만들고 시연까지 가는 경험이 부족 역량과 잘 맞습니다.",
        checkedAt: "2026-09-12",
      },
    ],
  };
}
