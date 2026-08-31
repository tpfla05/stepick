import type { FormEvent, ReactNode } from "react";
import {
  ACTIVITY_CATEGORIES,
  CURRENT_STATUS_OPTIONS,
  PREP_STATUS_OPTIONS,
  type ActivityCategory,
  type CurrentStatus,
  type PrepStatus,
  type UserProfile,
} from "../types.ts";

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
    <form onSubmit={submit} className="space-y-7">
      <Field label="희망 직무" hint="예: 프론트엔드 개발자, AI 서비스 기획">
        <input
          required
          value={value.targetRole}
          onChange={(event) => patch({ targetRole: event.target.value })}
          className="field-input"
          placeholder="목표 직무를 적어 주세요"
        />
      </Field>

      <Field label="전공" hint="선택">
        <input
          value={value.major ?? ""}
          onChange={(event) => patch({ major: event.target.value || null })}
          className="field-input"
          placeholder="전공이 있다면 적어 주세요"
        />
      </Field>

      <fieldset>
        <legend className="field-label">현재 상태</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
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
      </fieldset>

      <fieldset>
        <legend className="field-label">준비 상태</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
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
      </fieldset>

      <fieldset>
        <legend className="field-label">포트폴리오</legend>
        <p className="mt-1 text-sm text-muted">있으면 상세 경력은 건너뛰고 여기서 경험을 읽습니다.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Choice
            name="hasPortfolio"
            checked={value.hasPortfolio}
            onChange={() => patch({ hasPortfolio: true, experience: undefined })}
            label="있음"
          />
          <Choice
            name="hasPortfolio"
            checked={!value.hasPortfolio}
            onChange={() => patch({ hasPortfolio: false, portfolio: undefined })}
            label="없음"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label">관심 활동 유형</legend>
        <p className="mt-1 text-sm text-muted">선택. 추천 범위만 좁힙니다.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ACTIVITY_CATEGORIES.map((category) => {
            const on = value.preferredCategories?.includes(category) ?? false;
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  on
                    ? "border-lime/40 bg-lime/15 text-lime"
                    : "border-line text-muted hover:border-paper/20 hover:text-paper"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </fieldset>

      <button type="submit" className="btn-primary w-full sm:w-auto">
        다음
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {hint ? <span className="ml-2 text-xs text-muted">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Choice({
  name,
  checked,
  onChange,
  label,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
        checked ? "border-lime/40 bg-lime/10 text-paper" : "border-line text-muted hover:border-paper/20"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="accent-lime" />
      {label}
    </label>
  );
}
