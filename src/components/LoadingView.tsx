export function LoadingView() {
  return (
    <section className="rounded-[20px] border border-line bg-ink-2 px-8 py-16 text-center">
      <p className="text-xs font-medium tracking-[0.18em] text-lime uppercase">분석 중</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">경험을 읽고 역량을 나누고 있어요</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
        입력하신 내용만 근거로 봅니다. 없는 경험은 만들지 않아요. 잠시만 기다려 주세요.
      </p>
    </section>
  );
}
