import { useState } from "react";
import { AnalysisView } from "./components/AnalysisView.tsx";
import { ActivityCard } from "./components/ActivityCard.tsx";
import { ExperienceForm } from "./components/ExperienceForm.tsx";
import { LoadingView } from "./components/LoadingView.tsx";
import { PageShell } from "./components/PageShell.tsx";
import { PortfolioFields } from "./components/PortfolioFields.tsx";
import { ProfileForm } from "./components/ProfileForm.tsx";
import { analyzeProfile, recommendActivities } from "./lib/api.ts";
import { LIST_URL } from "./lib/linkareerActivities.ts";
import { saveSession } from "./lib/storage.ts";
import type { AnalysisResult, RecommendResult, UserProfile } from "./types.ts";

type Step = "profile" | "details" | "loading" | "result";

const emptyProfile = (): UserProfile => ({
  targetRole: "",
  major: null,
  currentStatus: "graduate",
  prepStatus: "portfolio_in_progress",
  hasPortfolio: false,
  preferredCategories: [],
});

export default function App() {
  const [step, setStep] = useState<Step>("profile");
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [recommend, setRecommend] = useState<RecommendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runPipeline(nextProfile: UserProfile) {
    setError(null);
    setAnalysis(null);
    setRecommend(null);
    setProfile(nextProfile);
    setStep("loading");

    try {
      const nextAnalysis = await analyzeProfile(nextProfile);
      setAnalysis(nextAnalysis);
      try {
        const nextRecommend = await recommendActivities(nextProfile, nextAnalysis);
        setRecommend(nextRecommend);
        saveSession({
          profile: nextProfile,
          analysis: nextAnalysis,
          recommend: nextRecommend,
        });
      } catch (recommendError) {
        setRecommend({ activities: [] });
        setError(recommendError instanceof Error ? recommendError.message : "활동 추천에 실패했습니다.");
        saveSession({
          profile: nextProfile,
          analysis: nextAnalysis,
          recommend: { activities: [] },
        });
      }
      setStep("result");
    } catch (pipelineError) {
      setError(pipelineError instanceof Error ? pipelineError.message : "분석에 실패했습니다.");
      setStep("result");
    }
  }

  function reset() {
    setStep("profile");
    setProfile(emptyProfile());
    setAnalysis(null);
    setRecommend(null);
    setError(null);
  }

  return (
    <PageShell
      step={step}
      detailsLabel={profile.hasPortfolio ? "포트폴리오" : "경험"}
    >
      {step === "profile" ? (
        <ProfileForm value={profile} onChange={setProfile} onNext={() => setStep("details")} />
      ) : null}

      {step === "details" && profile.hasPortfolio ? (
        <PortfolioFields
          value={profile}
          onChange={setProfile}
          onBack={() => setStep("profile")}
          onSubmit={(next) => void runPipeline(next)}
          busy={false}
        />
      ) : null}

      {step === "details" && !profile.hasPortfolio ? (
        <ExperienceForm
          value={profile}
          onChange={setProfile}
          onBack={() => setStep("profile")}
          onSubmit={(next) => void runPipeline(next)}
          busy={false}
        />
      ) : null}

      {step === "loading" ? <LoadingView /> : null}

      {step === "result" ? (
        <div className="space-y-10">
          {analysis ? <AnalysisView profile={profile} analysis={analysis} /> : null}

          <section className="space-y-5">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-lime uppercase">추천</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">지금 지원할 활동</h2>
              <p className="mt-2 text-sm text-muted">
                희망 직무와 부족한 역량에 맞는{" "}
                <a href={LIST_URL} className="text-lime underline" target="_blank" rel="noreferrer">
                  링커리어
                </a>
                공고만 골랐어요. 직무와 먼 서포터즈는 빼요.
              </p>
            </div>
            {recommend && recommend.activities.length === 0 ? (
              <p className="text-sm text-muted">
                원문에서 마감일과 주최를 확인한, 지금 직무와 맞는 모집 활동을 찾지 못했습니다.
              </p>
            ) : null}
            {recommend ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {recommend.activities.slice(0, 3).map((activity) => (
                  <ActivityCard key={`${activity.url}-${activity.title}`} activity={activity} />
                ))}
              </div>
            ) : null}
          </section>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={() => void runPipeline(profile)}>
              다시 분석하기
            </button>
            <button type="button" className="btn-ghost" onClick={reset}>
              처음부터
            </button>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
