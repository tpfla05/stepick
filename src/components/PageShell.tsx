import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  step?: "profile" | "details" | "loading" | "result";
  detailsLabel?: string;
};

export function PageShell({ children, step, detailsLabel }: Props) {
  const split = step === "profile" || step === "details";

  return (
    <div className="mx-auto min-h-dvh max-w-[1120px] px-5 py-10 text-left lg:px-8 lg:py-14">
      <div
        className={
          split
            ? "grid grid-cols-1 items-start gap-8 lg:grid-cols-[35%_65%] lg:gap-12"
            : "block"
        }
      >
        <header
          className={
            split
              ? "text-center lg:sticky lg:top-10 lg:text-left"
              : "mb-10 text-center"
          }
        >
          <p className="text-xs font-medium tracking-[0.22em] text-lime uppercase">Stepick</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            지금 지원할 활동을
            <br />
            찾아드려요
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted lg:mx-0 lg:max-w-none">
            희망 직무와 경험을 알려주시면 부족한 점을 짚고, 대외활동·공모전·교육을
            추천해요.
          </p>
          {split ? (
            <ol className="mt-6 flex justify-center gap-3 text-xs text-muted lg:justify-start">
              <li className={step === "profile" ? "text-lime" : undefined}>1. 기본 정보</li>
              <li className={step === "details" ? "text-lime" : undefined}>2. {detailsLabel}</li>
            </ol>
          ) : null}
        </header>

        <div className={split ? "min-w-0" : undefined}>{children}</div>
      </div>
    </div>
  );
}
