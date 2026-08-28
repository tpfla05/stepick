export default function App() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <p className="mb-4 text-xs font-medium tracking-[0.22em] text-lime uppercase">
        2026 AI
      </p>
      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">Stepick</h1>
      <p className="mt-4 max-w-md text-center text-muted">
        Vite + React + TypeScript 프로젝트가 준비됐습니다. GitHub 저장소와 연결되어
        있습니다.
      </p>
      <a
        href="https://github.com/tpfla05/stepick"
        className="mt-8 rounded-full bg-moss px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-moss-hover"
      >
        GitHub에서 보기
      </a>
    </main>
  );
}
