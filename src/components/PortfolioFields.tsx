import type { FormEvent } from "react";
import { FilePdf, Link, Trash, UploadSimple } from "@phosphor-icons/react";
import { readPortfolioFiles } from "../lib/files.ts";
import type { UserProfile } from "../types.ts";

type Props = {
  value: UserProfile;
  onChange: (next: UserProfile) => void;
  onBack: () => void;
  onSubmit: (profile: UserProfile) => void;
  busy: boolean;
};

export function PortfolioFields({ value, onChange, onBack, onSubmit, busy }: Props) {
  const portfolio = value.portfolio ?? {};
  const urls = portfolio.urls ?? [""];
  const files = portfolio.files ?? [];

  function setPortfolio(next: NonNullable<UserProfile["portfolio"]>) {
    onChange({ ...value, portfolio: next });
  }

  function updateUrl(index: number, url: string) {
    const next = [...urls];
    next[index] = url;
    setPortfolio({ ...portfolio, urls: next });
  }

  async function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const added = await readPortfolioFiles(list);
    setPortfolio({ ...portfolio, files: [...files, ...added].slice(0, 3) });
  }

  function ready() {
    const hasUrl = urls.some((url) => /^https?:\/\//i.test(url.trim()));
    const hasText = Boolean(portfolio.text?.trim());
    return hasUrl || hasText || files.length > 0;
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready() || busy) return;
    const next: UserProfile = {
      ...value,
      portfolio: {
        urls: urls.map((url) => url.trim()).filter((url) => /^https?:\/\//i.test(url)),
        text: portfolio.text?.trim() || undefined,
        files: files.length > 0 ? files : undefined,
      },
    };
    onChange(next);
    onSubmit(next);
  }

  return (
    <form onSubmit={submit} className="space-y-7 rounded-[20px] border border-line bg-ink-2 p-8 text-left">
      <p className="text-sm text-muted">
        URL, 텍스트, 파일 중 하나만 있어도 됩니다. 확인된 내용만 경험으로 읽습니다.
      </p>

      <div>
        <span className="field-label">포트폴리오 URL</span>
        <div className="mt-2 space-y-2">
          {urls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <div className="relative flex-1">
                <Link className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" size={16} />
                <input
                  value={url}
                  onChange={(event) => updateUrl(index, event.target.value)}
                  className="field-input pl-9"
                  placeholder="https://notion.so/... 또는 GitHub"
                  inputMode="url"
                />
              </div>
              {urls.length > 1 ? (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    setPortfolio({ ...portfolio, urls: urls.filter((_, i) => i !== index) })
                  }
                  aria-label="URL 삭제"
                >
                  <Trash size={16} />
                </button>
              ) : null}
            </div>
          ))}
        </div>
        {urls.length < 5 ? (
          <button
            type="button"
            className="mt-2 text-sm text-lime hover:underline"
            onClick={() => setPortfolio({ ...portfolio, urls: [...urls, ""] })}
          >
            URL 추가
          </button>
        ) : null}
      </div>

      <label className="block">
        <span className="field-label">텍스트로 붙여넣기</span>
        <textarea
          value={portfolio.text ?? ""}
          onChange={(event) => setPortfolio({ ...portfolio, text: event.target.value })}
          className="field-input mt-2 min-h-36 resize-y"
          placeholder="자기소개서, 프로젝트 요약, 이력 텍스트"
        />
      </label>

      <div>
        <span className="field-label">파일</span>
        <p className="mt-1 text-xs text-muted">PDF 또는 이미지, 최대 3개</p>
        <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line px-4 py-4 text-sm text-muted hover:border-lime/40 hover:text-paper">
          <UploadSimple size={20} />
          파일 선택
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/gif,image/webp"
            multiple
            className="sr-only"
            onChange={(event) => {
              void addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        {files.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-lg bg-ink px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <FilePdf size={16} className="text-lime" />
                  {file.name}
                </span>
                <button
                  type="button"
                  className="text-muted hover:text-paper"
                  onClick={() =>
                    setPortfolio({
                      ...portfolio,
                      files: files.filter((_, i) => i !== index),
                    })
                  }
                  aria-label={`${file.name} 제거`}
                >
                  <Trash size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

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
}
