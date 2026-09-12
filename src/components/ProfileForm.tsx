import type { FormEvent } from "react";
import {
  ACTIVITY_CATEGORIES,
  CURRENT_STATUS_OPTIONS,
  PREP_STATUS_OPTIONS,
  type ActivityCategory,
  type CurrentStatus,
  type PrepStatus,
  type UserProfile,
} from "../types.ts";
import { Card, Choice, Question } from "./ui.tsx";

type Props = {
  value: UserProfile;
  onChange: (next: UserProfile) => void;
  onNext: () => void;
};

export function ProfileForm({ value, onChange, onNext }: Props) {
  function patch(partial: Partial<UserProfile>) {
    onChange({ ...value, ...partial });
  }

  function toggleCategory(category: ActivityCategory) {
    const current = value.preferredCategories ?? [];
    const next = current.includes(category)
      ? current.filter((item) => item !== category)
      : [...current, category];
    patch({ preferredCategories: next });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!value.targetRole.trim()) return;
    onNext();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Card title="목표">
        <div className="grid gap-4 lg:grid-cols-2">
          <Question label="어떤 직무를 목표로 하고 있나요?">
            <input
              required
              value={value.targetRole}
              onChange={(event) => patch({ targetRole: event.target.value })}
              className="field-input"
              placeholder="예: 프론트엔드 개발자, AI 서비스 기획"
            />
          </Question>
          <Question label="전공이 있다면 알려주세요" hint="없어도 괜찮아요">
            <input
              value={value.major ?? ""}
              onChange={(event) => patch({ major: event.target.value || null })}
              className="field-input"
              placeholder="전공이 있다면 적어 주세요"
            />
          </Question>
        </div>
      </Card>

      <Card title="지금 상황">
        <Question label="지금은 어떤 상황인가요?">
          <div className="grid gap-2 sm:grid-cols-2">
            {CURRENT_STATUS_OPTIONS.map((option) => (
              <Choice
                key={option.value}
                name="currentStatus"
                checked={value.currentStatus === option.value}
                onChange={() => patch({ currentStatus: option.value as CurrentStatus })}
                label={option.label}
              />
            ))}
          </div>
        </Question>
        <Question label="취업 준비는 어디까지 왔나요?">
          <div className="grid gap-2 sm:grid-cols-3">
            {PREP_STATUS_OPTIONS.map((option) => (
              <Choice
                key={option.value}
                name="prepStatus"
                checked={value.prepStatus === option.value}
                onChange={() => patch({ prepStatus: option.value as PrepStatus })}
                label={option.label}
              />
            ))}
          </div>
        </Question>
        <Question label="포트폴리오가 있나요?">
          <div className="grid gap-2 sm:grid-cols-2">
            <Choice
              name="hasPortfolio"
              checked={value.hasPortfolio}
              onChange={() => patch({ hasPortfolio: true, experience: undefined })}
              label="있어요"
              hint="다음에서 자료를 볼게요"
            />
            <Choice
              name="hasPortfolio"
              checked={!value.hasPortfolio}
              onChange={() => patch({ hasPortfolio: false, portfolio: undefined })}
              label="없어요"
              hint="경험만 적을게요"
            />
          </div>
        </Question>
      </Card>

      <Card title="관심 활동">
        <Question label="관심 있는 활동이 있나요?" hint="선택이에요. 고르면 추천 범위만 좁혀요.">
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_CATEGORIES.map((category) => {
              const on = value.preferredCategories?.includes(category) ?? false;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    on
                      ? "border-lime bg-selected text-lime"
                      : "border-line text-muted hover:border-lime/40 hover:text-paper"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </Question>
      </Card>

      <button type="submit" className="btn-primary w-full sm:w-auto">
        {value.hasPortfolio ? "다음: 포트폴리오 확인하기" : "다음: 경험 입력하기"}
      </button>
    </form>
  );
}
