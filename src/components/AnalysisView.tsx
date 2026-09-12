import type { AnalysisResult, CompetencyItem, UserProfile } from "../types.ts";
import { Card } from "./ui.tsx";

type Props = {
  profile: UserProfile;
  analysis: AnalysisResult;
};

export function AnalysisView({ profile, analysis }: Props) {
  const strengths = analysis.strengths.slice(0, 3);
  const gaps = analysis.gaps.slice(0, 3);

  return (
    <section className="space-y-5">
      <Card title="목표 직무">
        <p className="text-xl font-semibold tracking-tight">{profile.targetRole || "미입력"}</p>
        {profile.major ? <p className="mt-2 text-sm text-muted">전공 {profile.major}</p> : null}
      </Card>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <Card title="종합 분석">
            <p className="text-[15px] leading-7 text-paper/85">{analysis.summary}</p>
          </Card>
          <Group title="강점" empty="확인된 강점이 없습니다." items={strengths} tone="strength" />
        </div>
        <div className="space-y-5">
          <Card title="직무 준비도">
            <p className="text-4xl font-semibold tabular-nums text-lime">{analysis.readinessScore}</p>
            <p className="mt-2 text-sm text-muted">입력에서 확인된 경험만으로 본 예시 점수입니다.</p>
          </Card>
          <Group
            title="보완이 필요한 역량"
            empty="자료 기준으로 단정할 부족 역량은 없습니다."
            items={gaps}
            tone="gap"
            showEvidence
          />
        </div>
      </div>
    </section>
  );
}

function Group({
  title,
  empty,
  items,
  tone,
  showEvidence,
}: {
  title: string;
  empty: string;
  items: CompetencyItem[];
  tone: "strength" | "gap";
  showEvidence?: boolean;
}) {
  return (
    <Card title={title}>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={`${item.name}-${item.reason}`} className="rounded-xl border border-line bg-ink p-4">
              <div className="flex flex-wrap items-center gap-2">
                {item.priority != null && tone === "gap" ? (
                  <span className="rounded-full bg-selected px-2 py-0.5 text-xs text-lime">
                    우선 {item.priority}
                  </span>
                ) : null}
                <span className={`text-sm font-medium ${tone === "strength" ? "text-lime" : "text-paper"}`}>
                  {item.name}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-paper/80">{item.reason}</p>
              {showEvidence && item.evidence ? (
                <p className="mt-2 text-xs leading-5 text-muted">판단 근거: {item.evidence}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
