import type { AnalysisResult, CompetencyItem } from "../types.ts";

type Props = {
  analysis: AnalysisResult;
};

export function AnalysisView({ analysis }: Props) {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-lime uppercase">분석</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">역량 진단</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-paper/85">{analysis.summary}</p>
      </div>

      {analysis.requiredCompetencies.length > 0 ? (
        <div>
          <h3 className="field-label">직무 핵심 역량</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {analysis.requiredCompetencies.map((item) => (
              <li key={item} className="rounded-full border border-line px-3 py-1 text-sm text-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Group title="강점" empty="확인된 강점이 없습니다." items={analysis.strengths} tone="strength" />
      <Group
        title="부족한 역량"
        empty="자료 기준으로 단정할 부족 역량은 없습니다."
        items={analysis.gaps}
        tone="gap"
        showPriority
      />
      <Group
        title="정보 부족"
        empty="추가로 확인할 항목이 없습니다."
        items={analysis.unknowns}
        tone="unknown"
      />
    </section>
  );
}

function Group({
  title,
  empty,
  items,
  tone,
  showPriority,
}: {
  title: string;
  empty: string;
  items: CompetencyItem[];
  tone: "strength" | "gap" | "unknown";
  showPriority?: boolean;
}) {
  return (
    <div>
      <h3 className="field-label">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={`${item.name}-${item.reason}`} className="rounded-2xl border border-line bg-ink-2/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                {showPriority && item.priority != null ? (
                  <span className="rounded-full bg-lime/15 px-2 py-0.5 text-xs text-lime">
                    우선 {item.priority}
                  </span>
                ) : null}
                <span className={`text-sm font-medium ${toneClass(tone)}`}>{item.name}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-paper/80">{item.reason}</p>
              {item.evidence ? (
                <p className="mt-2 text-xs leading-5 text-muted">근거: {item.evidence}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function toneClass(tone: "strength" | "gap" | "unknown"): string {
  if (tone === "strength") return "text-lime";
  if (tone === "gap") return "text-paper";
  return "text-muted";
}
