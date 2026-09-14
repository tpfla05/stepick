export function LoadingView() {
  return (
    <section className="rounded-[20px] border border-line bg-ink-2 px-8 py-16 text-center">
      <p className="text-xs font-medium tracking-[0.18em] text-lime uppercase">분석 중</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">경험을 읽고 지금 지원할 활동을 찾고 있어요</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
        Claude가 입력만 근거로 역량을 나눈 뒤, 모집 중인 링커리어 공고를 고릅니다. 1분 정도 걸릴 수 있어요.
      </p>
    </section>
  );
}
