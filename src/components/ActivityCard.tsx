import { ArrowSquareOut } from "@phosphor-icons/react";
import type { Activity } from "../types.ts";

type Props = {
  activity: Activity;
};

export function ActivityCard({ activity }: Props) {
  return (
    <article className="flex h-full flex-col rounded-[20px] border border-line bg-ink-2 p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted">{activity.category}</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">{activity.title}</h3>
          <p className="mt-1 text-sm text-muted">{activity.organization ?? "주최 미확인"}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-semibold tabular-nums text-lime">{activity.recommendationScore}</p>
          <p className="text-[11px] tracking-wide text-muted">추천 점수</p>
        </div>
      </div>

      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-muted">모집 마감</dt>
          <dd>{formatDate(activity.endDate)}</dd>
        </div>
        {activity.target ? (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-muted">대상</dt>
            <dd>{activity.target}</dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-4 text-sm leading-6 text-paper/85">{activity.recommendationReason}</p>

      {activity.relatedSkills.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {activity.relatedSkills.map((skill) => (
            <li key={skill} className="rounded-full bg-selected px-2.5 py-1 text-xs text-lime">
              {skill}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <a
          href={activity.url}
          target="_blank"
          rel="noreferrer"
          className="btn-primary inline-flex items-center gap-1.5"
        >
          원문 보기
          <ArrowSquareOut size={16} />
        </a>
        <p className="text-xs text-muted">{formatChecked(activity.checkedAt)} 기준 모집정보 확인</p>
      </div>
    </article>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "원문에서 확인 불가";
  return value.replaceAll("-", ".");
}

function formatChecked(value: string): string {
  return value.replaceAll("-", ".");
}
