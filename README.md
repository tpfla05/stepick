# Stepick

취업 준비 지원 MVP입니다. 사용자가 입력한 정보와 포트폴리오에서 **확인된 경험만** 근거로 희망 직무 대비 역량을 진단하고, Claude의 웹 검색/원문 조회 기능으로 **지금 실제로 모집 중인** 활동(대외활동·공모전·교육/부트캠프·인턴·프로젝트/해커톤)을 찾아 부족 역량을 얼마나 보완하는지 기준으로 추천합니다.

## 스택

- Vite + React + TypeScript
- Tailwind CSS
- Netlify Functions (`@netlify/functions`)
- Claude API (`@anthropic-ai/sdk`) — 역량 분석, 웹 검색/원문 조회

## 시작하기

Anthropic Console에서 발급한 키가 필요합니다. `VITE_` 접두사는 붙이지 마세요. 붙이면 브라우저에 키가 노출됩니다.

```bash
cp .env.example .env
# .env에 ANTHROPIC_API_KEY= 값을 채우기
npm install
npm run dev
```

## 사용 흐름

1. **기본 정보** — 희망 직무, 전공, 현재 상태(재학/졸업/이직/재직), 준비 상태(포트폴리오 준비 중/이력서 준비 전/지원 중), 포트폴리오 유무, 관심 활동 유형(선택)
2. **포트폴리오 O** — URL / 텍스트 / 파일(PDF·이미지) 중 하나 이상만 받고, 기술·프로젝트 폼은 건너뜁니다.
3. **포트폴리오 X** — 보유 기술, 프로젝트(이름·역할·설명·한 일·기술), 대외활동/교육, 인턴/경력, 자격증을 입력합니다.
4. **`POST /api/analyze`** — 입력·포트폴리오 원문에서 확인된 내용만으로 강점 / 부족 역량(우선순위 포함) / 정보 부족을 구분합니다. 없는 경험을 추측하지 않습니다.
5. **`POST /api/recommend`** — 분석된 부족 역량을 기준으로 Claude가 웹 검색 후 후보 공고의 원문을 직접 조회합니다. 활동명·주최기관·모집 마감일이 원문에서 확인되지 않거나 이미 마감된 활동은 제외합니다.
6. **결과 화면** — 역량 진단 리포트와, 활동명·주최·마감일·추천 점수·추천 이유·보완 역량·원문 링크·확인 날짜가 담긴 활동 카드를 보여줍니다.

## 프로젝트 구조

```
src/
  types.ts                      사용자 프로필 / 분석 결과 / 활동 데이터 모델
  components/
    ProfileForm.tsx             1단계: 기본 정보
    PortfolioFields.tsx         2단계: 포트폴리오 (URL/텍스트/파일)
    ExperienceForm.tsx          2단계: 상세 경력 입력
    AnalysisView.tsx            역량 진단 리포트
    ActivityCard.tsx            추천 활동 카드
  lib/
    api.ts                      /api/analyze, /api/recommend 호출
    files.ts                    파일 -> base64 변환
    storage.ts                  마지막 세션 localStorage 저장/복원

netlify/functions/
  analyze.ts                    POST /api/analyze
  recommend.ts                  POST /api/recommend
  _shared/
    claude.ts                   Claude 클라이언트, 에러 매핑
    prompts.ts                  분석/추천 시스템 프롬프트
    profile.ts                  사용자 입력 검증 + 프롬프트용 텍스트 변환
    parse.ts                    응답 JSON 추출, 날짜/필드 검증
```

## 검증 규칙

- 활동의 `url`은 `http(s)://`로 시작해야 하며, 모집 마감일(`endDate`)이 오늘(KST) 이전이면 제외합니다.
- 원문에서 확인되지 않은 필드는 모델이 추측하지 않고 `null`로 두며, 추천 이유가 없는 활동은 반환하지 않습니다.
- `checkedAt`(모집정보 확인 날짜)은 모델이 아니라 서버가 오늘 날짜(KST)로 채웁니다.

## 스크립트

- `npm run dev` — 로컬 개발 서버 (Netlify 환경 변수/함수 에뮬레이션 포함)
- `npm run build` — 타입 체크 후 프로덕션 빌드
- `npm run preview` — 빌드 결과 미리보기
