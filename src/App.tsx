import { useState } from "react";
import { AnalysisView } from "./components/AnalysisView.tsx";
import { ActivityCard } from "./components/ActivityCard.tsx";
import { ExperienceForm } from "./components/ExperienceForm.tsx";
import { PortfolioFields } from "./components/PortfolioFields.tsx";
import { ProfileForm } from "./components/ProfileForm.tsx";
import { analyzeProfile, recommendActivities } from "./lib/api.ts";
import { saveSession } from "./lib/storage.ts";
import type { AnalysisResult, RecommendResult, UserProfile } from "./types.ts";

type Step = "profile" | "details" | "result";

const emptyProfile = (): UserProfile => ({
  targetRole: "",
  major: null,
  currentStatus: "graduate",
  prepStatus: "portfolio_in_progress",
  hasPortfolio: true,
  preferredCategories: [],
});

export default function App() {
  const [step, setStep] = useState<Step>("profile");
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [recommend, setRecommend] = useState<RecommendResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runPipeline(nextProfile: UserProfile) {
    setError(null);
    setAnalysis(null);
    setRecommend(null);
    setStep("result");
    setAnalyzing(true);

    try {
      const nextAnalysis = await analyzeProfile(nextProfile);
      setAnalysis(nextAnalysis);
      setAnalyzing(false);
      saveSession({ profile: nextProfile, analysis: nextAnalysis, recommend: null });

      setRecommending(true);
      try {
        const nextRecommend = await recommendActivities(nextProfile, nextAnalysis);
        setRecommend(nextRecommend);
        saveSession({
          profile: nextProfile,
          analysis: nextAnalysis,
          recommend: nextRecommend,
        });
      } catch (recommendError) {
        setError(recommendError instanceof Error ? recommendError.message : "추천에 실패했습니다.");
      } finally {
        setRecommending(false);
      }
    } catch (analyzeError) {
      setAnalyzing(false);
      setError(analyzeError instanceof Error ? analyzeError.message : "분석에 실패했습니다.");
    }
  }

  function reset() {
    setStep("profile");
    setProfile(emptyProfile());
    setAnalysis(null);
    setRecommend(null);
    setAnalyzing(false);
    setRecommending(false);
    setError(null);
  }

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-10">
        <p className="text-xs font-medium tracking-[0.22em] text-lime uppercase">Stepick</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          부족한 역량을 메울
          <br />
          지금 모집 중인 활동
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          입력과 포트폴리오에서 확인된 경험만 보고 진단합니다. 활동은 모집공고 원문을 확인한
          뒤에만 추천합니다.
        </p>
      </header>

      {step !== "result" ? (
        <ol className="mb-8 flex gap-3 text-xs text-muted">
          <StepMark n={1} label="기본 정보" active={step === "profile"} />
          <StepMark n={2} label={profile.hasPortfolio ? "포트폴리오" : "경험"} active={step === "details"} />
        </ol>
      ) : null}

      {step === "profile" ? (
        <ProfileForm value={profile} onChange={setProfile} onNext={() => setStep("details")} />
      ) : null}

      {step === "details" && profile.hasPortfolio ? (
        <PortfolioFields
          value={profile}
          onChange={setProfile}
          onBack={() => setStep("profile")}
          onSubmit={(next) => void runPipeline(next)}
          busy={analyzing}
        />
      ) : null}

      {step === "details" && !profile.hasPortfolio ? (
        <ExperienceForm
          value={profile}
          onChange={setProfile}
          onBack={() => setStep("profile")}
          onSubmit={(next) => void runPipeline(next)}
          busy={analyzing}
        />
      ) : null}

      {step === "result" ? (
        <div className="space-y-12">
          {analyzing ? <Status text="자료를 읽고 역량을 나누고 있습니다. 없는 경험은 만들지 않습니다." /> : null}
          {analysis ? <AnalysisView analysis={analysis} /> : null}

          <section className="space-y-5">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-lime uppercase">추천</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">현재 모집 중인 활동</h2>
            </div>
            {recommending ? (
              <Status text="모집공고를 검색한 뒤 원문을 확인하고 있습니다. 확인할 수 없으면 추천하지 않습니다." />
            ) : null}
            {recommend && recommend.activities.length === 0 ? (
              <p className="text-sm text-muted">
                원문에서 마감일과 주최를 확인한, 지금 모집 중인 활동을 찾지 못했습니다.
              </p>
            ) : null}
            {recommend ? (
              <div className="space-y-4">
                {recommend.activities.map((activity) => (
                  <ActivityCard key={`${activity.url}-${activity.title}`} activity={activity} />
                ))}
              </div>
            ) : null}
          </section>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <button type="button" className="btn-ghost" onClick={reset}>
            처음부터
          </button>
        </div>
      ) : null}
    </div>
  );
}

function StepMark({ n, label, active }: { n: number; label: string; active: boolean }) {
  return (
    <li className={active ? "text-lime" : undefined}>
      {n}. {label}
    </li>
  );
}

function Status({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-line bg-ink-2/50 px-4 py-3 text-sm leading-6 text-muted">{text}</p>
  );
}
