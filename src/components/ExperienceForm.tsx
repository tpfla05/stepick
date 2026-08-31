import { useState, type FormEvent } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import type { ProjectExperience, UserProfile } from "../types.ts";

type Props = {
  value: UserProfile;
  onChange: (next: UserProfile) => void;
  onBack: () => void;
  onSubmit: (profile: UserProfile) => void;
  busy: boolean;
};

const emptyProject = (): ProjectExperience => ({
  name: "",
  description: "",
  role: "",
  work: "",
  tech: [],
});

export function ExperienceForm({ value, onChange, onBack, onSubmit, busy }: Props) {
  const exp = value.experience ?? {
    skills: [],
    projects: [emptyProject()],
    activities: [],
    internships: [],
    certificates: [],
  };

  function setExp(next: NonNullable<UserProfile["experience"]>) {
    onChange({ ...value, experience: next });
  }

  function ready() {
    return (
      exp.skills.length > 0 ||
      exp.projects.some((project) => project.name.trim()) ||
      exp.activities.length > 0 ||
      exp.internships.length > 0 ||
      exp.certificates.length > 0
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready() || busy) return;
    const next: UserProfile = {
      ...value,
      experience: {
        ...exp,
        projects: exp.projects.filter((project) => project.name.trim()),
      },
    };
    onChange(next);
    onSubmit(next);
  }

  return (
    <form onSubmit={submit} className="space-y-7">
      <p className="text-sm text-muted">확인된 경험만 적으세요. 없는 항목은 비워 두면 정보 부족으로 분류됩니다.</p>

      <ListField
        label="보유 기술"
        hint="쉼표로 구분"
        value={exp.skills.join(", ")}
        onChange={(text) => setExp({ ...exp, skills: splitList(text) })}
        placeholder="TypeScript, React, SQL"
      />

      <div>
        <div className="flex items-center justify-between">
          <span className="field-label">프로젝트</span>
          {exp.projects.length < 8 ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm text-lime hover:underline"
              onClick={() => setExp({ ...exp, projects: [...exp.projects, emptyProject()] })}
            >
              <Plus size={14} />
              추가
            </button>
          ) : null}
        </div>
        <div className="mt-3 space-y-4">
          {exp.projects.map((project, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-line p-4">
              <div className="flex items-start justify-between gap-3">
                <input
                  value={project.name}
                  onChange={(event) => updateProject(index, { name: event.target.value })}
                  className="field-input"
                  placeholder="프로젝트명"
                />
                {exp.projects.length > 1 ? (
                  <button
                    type="button"
                    className="btn-ghost shrink-0"
                    onClick={() =>
                      setExp({ ...exp, projects: exp.projects.filter((_, i) => i !== index) })
                    }
                    aria-label="프로젝트 삭제"
                  >
                    <Trash size={16} />
                  </button>
                ) : null}
              </div>
              <input
                value={project.role}
                onChange={(event) => updateProject(index, { role: event.target.value })}
                className="field-input"
                placeholder="역할"
              />
              <textarea
                value={project.description}
                onChange={(event) => updateProject(index, { description: event.target.value })}
                className="field-input min-h-20 resize-y"
                placeholder="설명"
              />
              <textarea
                value={project.work}
                onChange={(event) => updateProject(index, { work: event.target.value })}
                className="field-input min-h-20 resize-y"
                placeholder="한 일"
              />
              <TechInput
                key={index}
                value={project.tech}
                onChange={(tech) => updateProject(index, { tech })}
              />
            </div>
          ))}
        </div>
      </div>

      <ListField
        label="대외활동 / 교육"
        hint="항목은 줄바꿈 또는 쉼표"
        value={exp.activities.join("\n")}
        onChange={(text) => setExp({ ...exp, activities: splitLines(text) })}
        placeholder="부트캠프, 동아리, 봉사 등"
        multiline
      />
      <ListField
        label="인턴 / 경력"
        value={exp.internships.join("\n")}
        onChange={(text) => setExp({ ...exp, internships: splitLines(text) })}
        placeholder="회사, 기간, 한 일"
        multiline
      />
      <ListField
        label="자격증"
        hint="쉼표로 구분"
        value={exp.certificates.join(", ")}
        onChange={(text) => setExp({ ...exp, certificates: splitList(text) })}
        placeholder="정보처리기사, SQLD"
      />

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-ghost" onClick={onBack} disabled={busy}>
          이전
        </button>
        <button type="submit" className="btn-primary" disabled={!ready() || busy}>
          {busy ? "분석 중…" : "역량 분석하기"}
        </button>
      </div>
    </form>
  );

  function updateProject(index: number, partial: Partial<ProjectExperience>) {
    const projects = exp.projects.map((project, i) =>
      i === index ? { ...project, ...partial } : project,
    );
    setExp({ ...exp, projects });
  }
}

function splitList(text: string): string[] {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLines(text: string): string[] {
  return text
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function ListField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  // 입력값을 그대로 보여주는 로컬 상태를 따로 둔다. 매 입력마다 부모가 배열로
  // 잘라 다시 join한 값을 그려주면, 방금 입력한 "," 가 filter(Boolean)에 걸려
  // 사라져 버려서 쉼표를 입력할 수 없게 된다.
  const [text, setText] = useState(value);

  function handleChange(next: string) {
    setText(next);
    onChange(next);
  }

  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {hint ? <span className="ml-2 text-xs text-muted">{hint}</span> : null}
      {multiline ? (
        <textarea
          value={text}
          onChange={(event) => handleChange(event.target.value)}
          className="field-input mt-2 min-h-24 resize-y"
          placeholder={placeholder}
        />
      ) : (
        <input
          value={text}
          onChange={(event) => handleChange(event.target.value)}
          className="field-input mt-2"
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function TechInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tech: string[]) => void;
}) {
  const [text, setText] = useState(value.join(", "));

  return (
    <input
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        onChange(splitList(event.target.value));
      }}
      className="field-input"
      placeholder="사용 기술 (쉼표로 구분)"
    />
  );
}
