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
import { clearSession, loadSession, saveSession } from "./lib/storage.ts";
import type { AnalysisResult, RecommendResult, UserProfile } from "./types.ts";

type Step = "profile" | "details" | "loading" | "result";
type LoadPhase = "analyze" | "recommend";

const emptyProfile = (): UserProfile => ({
  targetRole: "",
  major: null,
  currentStatus: "graduate",
  prepStatus: "portfolio_in_progress",
  hasPortfolio: false,
  preferredCategories: [],
});

function hasEnoughInput(profile: UserProfile): boolean {
  if (profile.hasPortfolio) {
    const portfolio = profile.portfolio;
    const hasUrl = Boolean(portfolio?.urls?.some((url) => /^https?:\/\//i.test(url.trim())));
    const hasText = Boolean(portfolio?.text?.trim());
    const hasFile = Boolean(portfolio?.files?.length);
    return hasUrl || hasText || hasFile;
  }
  const experience = profile.experience;
  if (!experience) return false;
  return (
    experience.skills.length > 0 ||
    experience.projects.some((project) => project.name.trim()) ||
    experience.activities.length > 0 ||
    experience.internships.length > 0 ||
    experience.certificates.length > 0
  );
}

function initialSession() {
  const saved = loadSession();
  if (!saved?.analysis) return null;
  return saved;
}

export default function App() {
  const saved = initialSession();
  const [step, setStep] = useState<Step>(saved ? "result" : "profile");
  const [profile, setProfile] = useState<UserProfile>(saved?.profile ?? emptyProfile);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(saved?.analysis ?? null);
  const [recommend, setRecommend] = useState<RecommendResult | null>(saved?.recommend ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loadPhase, setLoadPhase] = useState<LoadPhase>("analyze");
  const [hadPortfolioFiles, setHadPortfolioFiles] = useState(Boolean(saved?.hadPortfolioFiles));

  async function runPipeline(nextProfile: UserProfile) {
    if (!hasEnoughInput(nextProfile)) {
      const filesDropped =
        hadPortfolioFiles && nextProfile.hasPortfolio && !nextProfile.portfolio?.files?.length;
      setError(
        filesDropped
          ? "첨부 파일은 이 기기에 저장하지 않아요. 다시 분석할 때 파일을 올려 주세요."
          : "경험이나 포트폴리오를 하나 이상 입력한 뒤에 분석할 수 있어요.",
      );
      if (step === "result") setStep("details");
      return;
    }

    const usedFiles = Boolean(nextProfile.portfolio?.files?.length);
    setError(null);
    setAnalysis(null);
    setRecommend(null);
    setProfile(nextProfile);
    setHadPortfolioFiles(usedFiles);
    setLoadPhase("analyze");
    setStep("loading");

    try {
      const nextAnalysis = await analyzeProfile(nextProfile);
      setAnalysis(nextAnalysis);
      setLoadPhase("recommend");
      try {
        const nextRecommend = await recommendActivities(nextProfile, nextAnalysis);
        setRecommend(nextRecommend);
        saveSession({
          profile: nextProfile,
          analysis: nextAnalysis,
          recommend: nextRecommend,
          hadPortfolioFiles: usedFiles,
        });
      } catch (recommendError) {
        setRecommend({ activities: [] });
        setError(recommendError instanceof Error ? recommendError.message : "활동 추천에 실패했습니다.");
        saveSession({
          profile: nextProfile,
          analysis: nextAnalysis,
          recommend: { activities: [] },
          hadPortfolioFiles: usedFiles,
        });
      }
      setStep("result");
    } catch (pipelineError) {
      setError(pipelineError instanceof Error ? pipelineError.message : "분석에 실패했습니다.");
      setStep("result");
    }
  }

  function reset() {
    clearSession();
    setStep("profile");
    setProfile(emptyProfile());
    setAnalysis(null);
    setRecommend(null);
    setError(null);
    setLoadPhase("analyze");
    setHadPortfolioFiles(false);
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
          error={error}
        />
      ) : null}

      {step === "details" && !profile.hasPortfolio ? (
        <ExperienceForm
          value={profile}
          onChange={setProfile}
          onBack={() => setStep("profile")}
          onSubmit={(next) => void runPipeline(next)}
          busy={false}
          error={error}
        />
      ) : null}

      {step === "loading" ? <LoadingView phase={loadPhase} /> : null}

      {step === "result" ? (
        <div className="space-y-10">
          {analysis ? <AnalysisView profile={profile} analysis={analysis} /> : null}

          <section className="space-y-5">
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-lime uppercase">추천</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">지금 지원할 활동</h2>
              <p className="mt-2 text-sm text-muted">
                희망 직무와 맞는, 지금 모집 중인{" "}
                <a href={LIST_URL} className="text-lime underline" target="_blank" rel="noreferrer">
                  링커리어
                </a>
                {" "}공고만 골랐어요.
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

          {hadPortfolioFiles ? (
            <p className="text-sm text-muted">
              첨부 파일은 이 기기에 저장하지 않아요. 다시 분석할 때 파일을 올려 주세요.
            </p>
          ) : null}

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
