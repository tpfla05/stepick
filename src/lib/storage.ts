import type { AnalysisResult, RecommendResult, UserProfile } from "../types.ts";

const KEY = "stepick:last-session";

export type StoredSession = {
  profile: UserProfile;
  analysis: AnalysisResult | null;
  recommend: RecommendResult | null;
};

export function saveSession(session: StoredSession): void {
  const stored: StoredSession = {
    ...session,
    profile: {
      ...session.profile,
      portfolio: session.profile.portfolio
        ? {
            urls: session.profile.portfolio.urls,
            text: session.profile.portfolio.text,
          }
        : undefined,
    },
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // ignore quota / private mode
  }
}

export function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}
