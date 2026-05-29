# 🚢 SentinAI 작업 인계 문서 (Handoff)

> **작성일**: 2026-05-29
> **작성자**: 이전 Claude 세션
> **수신자**: 새 Claude 세션 (Ellio가 새 창에서 시작 시)
> **사용법**: 이 파일을 새 창에 첨부하고 "이 인계 문서대로 이어서 진행해줘" 라고 말하면 됨

---

## 👤 사용자 정보 (Ellio)

- **닉네임**: Ellio
- **직책**: 사업기획 (KS인더스트리 / 마린로보틱스연구소)
- **운영 사이트**: https://sentinai.kr
- **GitHub**: https://github.com/ellio70/ksi-homepage
- **Cloudflare 프로젝트명**: `sentinai`
- **응답 스타일 선호**: 재치 있는, 미래 지향적인, 솔직한 / 한국어 (ko-KR)
- **호칭**: 친근하게 "Ellio" 사용

---

## 🎯 즉시 처리 우선순위 (Top 2)

### 1순위: 사이트 속도 진단 + 개선안 (사용자 마지막 요청)
**Ellio의 마지막 메시지**: "센티나이 홈페이지 속도가 느린데, 개선이 가능하니?"

**아직 답변 못 함**. 새 창에서 가장 먼저 답해야 하는 질문.

**진단 시작 명령** (새 창에서 바로 실행):
```bash
# 1. 페이지 사이즈 측정
curl -sI https://sentinai.kr/ | head -20
curl -s -o /dev/null -w "%{size_download} bytes, %{time_total}s total, %{time_starttransfer}s TTFB\n" https://sentinai.kr/

# 2. 정적 자산 사이즈
for f in /static/tailwind.css /static/style.css /static/images/og-sentinai-v2.jpg /static/images/hero-navy-engine.jpg; do
  echo "$f: $(curl -s -o /dev/null -w '%{size_download} bytes' https://sentinai.kr$f)"
done

# 3. PageSpeed Insights (외부 도구)
# https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fsentinai.kr
```

**사전 분석한 속도 개선 후보** (예상 임팩트 순):
1. **이미지 최적화** (가장 큰 효과 예상) — hero-navy-engine.jpg, og-sentinai-v2.jpg 등을 WebP/AVIF 변환 + 사이즈 정리
2. **Google Fonts 정리** — 현재 5개 family(Inter/Noto KR/Noto JP/Noto SC/Space Grotesk) 동시 로드 → Inter + Noto KR만 남기기
3. **FontAwesome CDN(~30KB)** — 사용하는 아이콘만 sub-set으로 로컬 호스팅
4. **Critical CSS 추출** — home.tsx 1098줄 페이지의 above-the-fold만 인라인
5. **이미지 lazy loading** — `<img loading="lazy" decoding="async">` 적용
6. **Cloudflare 캐시 헤더 검토** — `/static/*`에 long-cache 적용 여부

**Ellio에게 먼저 보여줄 형식**:
- 진단 결과를 표로 정리 (현재 vs 목표)
- 개선 방법별 예상 효과 + 작업 시간 (Top 3 선별)
- "이 중 어떤 거부터 갈까?" 로 의사결정 요청

### 2순위: `/defense` 국방 랜딩 페이지 (마린 다음 차례)
Ellio가 명시한 순서: **"일단 조선해양부터 하고, 그 다음 국방으로 가자"**

마린은 완료. 다음은 국방. **국방은 Phase 1 핵심 사업이라 우선순위 더 높음**.

마린(`src/pages/marine.tsx`)을 템플릿으로 사용 가능. 톤은 동일하게 하이브리드(마케팅 위, 기술 아래), 한국어, 공개정보+일반강점만.

**국방 랜딩 페이지에서 강조할 키워드** (SEO):
- 국방 IPS, 함정 MRO, 해군 정비, 무기체계 종합군수지원, 군 정비창, 함정 예지정비, 국방 AI MRO, 함정용 sLM

---

## 📊 현재 상태 (2026-05-29 05:50 UTC 기준)

### ✅ 방금 막 완료한 작업

| 항목 | 상태 | 확인 |
|---|---|---|
| `/marine` 페이지 배포 | ✅ 완료 | `curl -I https://sentinai.kr/marine` → HTTP 200 |
| sitemap.xml에 /marine 등록 | ✅ 완료 | `curl https://sentinai.kr/sitemap.xml \| grep marine` |
| 홈에서 /marine 링크 노출 | ✅ 완료 | 홈 페이지 industries 카드 하단 "자세히 보기" |
| git commit (e1b76b0) | ✅ 완료 | 4 files changed, 647+/3- |
| git push to origin/main | ✅ 완료 | 65087cf..e1b76b0 |
| Cloudflare 배포 URL | ✅ 완료 | https://d68822a2.sentinai.pages.dev |

### ⚠️ 마린 페이지의 미세한 결함 (개선 항목)

- **타이틀이 홈 페이지와 동일**: `<title>SentinAI, 보고 듣고 판단하는...</title>`
  - 원인: `src/renderer.tsx`가 전역 타이틀을 강제 중이라 marine.tsx 내부의 `<title>`이 무시됨
  - 영향: SEO에 부정적 (페이지별 차별화 안 됨)
  - 해결책: renderer.tsx를 페이지별 타이틀/description override 가능하게 리팩토링
  - **새 창에서 처리할 항목**

### ⏳ 미완료 작업 (큐)

#### 즉시
- [ ] **사이트 속도 진단 + 개선안** (Ellio 최우선 요청)
- [ ] marine 페이지 타이틀/description 페이지별 커스텀화 (renderer.tsx 리팩토링)
- [ ] Google Search Console에서 `/marine` URL 색인 요청
- [ ] Naver Search Advisor에서 `/marine` 웹페이지 수집 요청

#### 단기
- [ ] `/defense` 국방 랜딩 페이지 작성 (Phase 1 핵심)
- [ ] (추후) `/manufacture` 제조 랜딩 페이지

#### Ellio 의사결정 대기 중 (이전 세션에서 보류된 항목)
- [ ] KS인더스트리 모회사 홈페이지에 sentinai.kr 링크 추가
- [ ] Google Business Profile 등록
- [ ] Press release v3 최종 승인 + 배포
- [ ] 이미지 평가 피드백 (#1 K-방산, #2 마린, #3 제품샷 v2)
- [ ] Daum 승인 메일 확인 (제출일 기준 1~2주 대기)

---

## 🏗️ 기술 스택 & 프로젝트 구조

### 핵심 스택
- **Hono v4.12** (Cloudflare Pages용 JSX SSR)
- **Cloudflare Pages** + **Wrangler v4**
- **TailwindCSS v3** (CLI 빌드, `/static/tailwind.css` 35KB)
- **Vite v6** (메인 빌드 도구, 단 메모리 부족 시 esbuild 우회)

### 디렉토리 구조 (핵심만)
```
/home/user/webapp/
├── src/
│   ├── index.tsx           # Hono 앱 엔트리, 모든 라우트 정의
│   ├── renderer.tsx        # 전역 HTML 레이아웃 (head/meta/SEO)
│   ├── i18n.ts             # 다국어 (ko/en/zh/ja/es)
│   ├── cms.ts              # 어드민 CMS + KV 이미지 오버라이드
│   ├── notify.ts           # 이메일 (Resend)
│   └── pages/
│       ├── home.tsx        # 메인 (1098줄)
│       ├── privacy.tsx     # 개인정보처리방침
│       └── marine.tsx      # 조선해양 랜딩 (NEW, 575줄, 방금 배포)
├── public/
│   ├── googlee006bde4f01432cf.html  # Google 소유 확인
│   └── static/
│       ├── tailwind.css    # 35KB minified
│       ├── style.css       # 커스텀 CSS (glass, hero-bg 등)
│       ├── favicon.svg
│       ├── images/         # 모든 이미지 자산
│       └── logos/
├── dist/                   # 빌드 산출물 (Cloudflare 배포 대상)
├── vite.config.ts          # @hono/vite-build/cloudflare-pages 사용
├── build-esbuild.mjs       # NEW! Vite OOM 우회 빌드 (0.9초)
├── wrangler.jsonc          # Cloudflare 설정
└── HANDOFF_TO_NEXT_SESSION.md   # ← 이 파일
```

### 라우트 맵 (`src/index.tsx`)
```
GET  /                              → HomePage (홈)
GET  /privacy                       → PrivacyPage (개인정보)
GET  /marine                        → MarinePage (조선해양) [NEW]
GET  /robots.txt                    → 검색엔진 크롤러 정책
GET  /sitemap.xml                   → 사이트맵 (/, /marine, /privacy)
GET  /googlee006bde4f01432cf.html   → Google 소유 확인
GET  /static/images/:filename       → CMS 이미지 오버라이드 (KV 우선)
GET  /static/*                      → 정적 자산 (Cloudflare Pages 자동)
/admin + /api/admin/*               → CMS 모듈 (src/cms.ts)
/api/*                              → CORS 활성화
```

---

## 🐛 알려진 환경 이슈 & 해결책

### 이슈 1: `npm run build` (Vite) → OOM Killed
- **원인**: 샌드박스 RAM 987MB 중 800MB+를 Jupyter/envd 등이 점유
- **언제 발생**: home.tsx(1098줄) + marine.tsx(575줄) 등 큰 JSX 파일 동시 번들 시
- **해결책 (검증됨)**: `node build-esbuild.mjs` 사용
  - 0.9초 만에 336.9KB worker 빌드
  - vite의 모든 기능을 재현하진 않지만 Cloudflare Pages 배포에는 충분
  - `dist/_worker.js`, `dist/_routes.json`, `dist/static/*` 생성

**새 창에서는**:
```bash
# 먼저 메모리 확인
free -h
# available > 300MB 이면 vite 시도, 아니면 esbuild
cd /home/user/webapp && npm run build              # vite (정상 시)
cd /home/user/webapp && node build-esbuild.mjs     # esbuild 우회 (OOM 시)
```

### 이슈 2: `wrangler pages deploy` 타임아웃
- 이전 세션에서 메모리 부족 + 누적 프로세스로 인해 발생
- 현재 세션에서는 14초만에 정상 완료됨 (메모리 회복 후)
- 발생 시 `ResetSandbox` 후 재시도

### 이슈 3: GitHub push 인증 실패
- 한 번 끊기면 `setup_github_environment` 재호출 필요
- 토큰이 1시간 후 만료될 수 있음

---

## 📦 핵심 파일 빠른 참조

### `src/pages/marine.tsx` (방금 배포)
- 575줄, 35KB
- export: `export function MarinePage()`
- 구조:
  1. FAQ Schema.org JSON-LD (8개 Q&A)
  2. Breadcrumb Schema.org JSON-LD
  3. Top Nav (KSI 로고)
  4. Visual Breadcrumb
  5. Hero (port-tablet.jpg 배경)
  6. Problem (4 카드: 염해/24시간/숙련공/폐쇄망)
  7. Solution (Vision/Acoustic/sLM + 5-source 통합)
  8. Applications (4 시나리오: 해상크레인/선박엔진/조선소야드/FPSO)
  9. Expected Outcomes (4 stats: -30%, ×3, -70%, 100%)
  10. KSI Heritage (22년+/Big5/2027)
  11. FAQ (details/summary)
  12. CTA
  13. Footer
- SEO 키워드: 조선 MRO, 해상크레인 정비, 마린크레인 예지정비, 조선소 스마트 MRO, FPSO 정비, 해양플랜트 MRO

### `src/index.tsx` 핵심 라인
```typescript
// Line ~5
import { MarinePage } from './pages/marine'

// Line ~63
app.get('/marine', (c) => c.render(<MarinePage />))

// Line ~199 sitemap.xml urls 배열
{
  loc: `${base}/marine`,
  lastmod: today,
  changefreq: 'weekly',
  priority: '0.9',
  alt: '',
}
```

### `src/pages/home.tsx` industries 카드 수정 (line ~275)
```typescript
{[
  { key: 'defense',     ..., href: '' },        // 비활성 (페이지 없음)
  { key: 'marine',      ..., href: '/marine' }, // 활성 (NEW)
  { key: 'manufacture', ..., href: '' },        // 비활성
].map(...)

// 카드 하단 조건부 표시:
{it.href && (
  <div class="mt-5 pt-4 border-t border-white/10">
    <a href={it.href} ...>산업별 솔루션 자세히 보기 →</a>
  </div>
)}
```

### `build-esbuild.mjs` (메모리 부족 시 사용)
- 위치: `/home/user/webapp/build-esbuild.mjs`
- 명령: `node build-esbuild.mjs`
- 산출물: `dist/_worker.js` (336KB), `dist/_routes.json`, `dist/static/*`

---

## 🔍 이전 세션에서 완료한 주요 작업 이력

### 2026-05-25 ~ 05-29
1. **카메라 권한 수정**: home.tsx iframe `allow=` 속성에 `camera` 추가
2. **Tailwind CDN → CLI 마이그레이션**: 200KB+ JIT → 35KB 정적 (gzip 8KB)
3. **4개 검색엔진 등록 완료**:
   - Google: `/googlee006bde4f01432cf.html` 파일 방식 ✅
   - Naver: `f2f26700746a8589f1d06e1069c26f79af29cecc` 메타 태그 ✅
   - Bing: `F770B5B30ADE1B894D4AE2F0F9E2DD23` 메타 태그 ✅
   - Daum: 수동 제출 (1-2주 승인 대기 중)
4. **SEO 인프라**: robots.txt, sitemap.xml, Schema.org (Organization/WebSite/SoftwareApplication)
5. **HTTPS 301 리다이렉트 + HSTS** 활성화
6. **/marine 페이지 배포** (방금 완료) ✅

---

## 💬 Ellio 응답 스타일 가이드

- **언어**: 한국어 (영어 단어 자연스럽게 섞여도 OK)
- **톤**: 솔직하게, 재치 있게, 미래 지향적으로
- **이모지**: 의미 있게 가끔 사용 (🚢, 🎯, 🚀, ✅ 등) — 남발 금지
- **거리감**: 친근하지만 너무 캐주얼하지 않게
- **호칭**: "Ellio"로 부름
- **결정 요청**: 옵션 제시 → 디폴트 추천 → "OK면 'go' 한 마디만" 패턴

**예시**:
> "자, 가시죠 Ellio. 🚢
>
> A안 (빠름): ...
> B안 (정석): ...
>
> 제 추천은 B. 30분이면 끝나고 SEO 임팩트는 1주일 안에 옵니다.
> 'go' 한 마디면 바로 시작합니다."

---

## ⚡ 새 창에서 첫 명령 (복붙용)

```
이 인계 문서대로 이어서 진행해줘.

먼저 아래 명령으로 현재 상태 확인하고:
1. cd /home/user/webapp && git log --oneline -3
2. free -h
3. curl -I https://sentinai.kr/marine

그 다음 Ellio의 최우선 요청 처리:
**"사이트 속도가 느린데 개선 가능하니?"** → 진단 + Top 3 개선안 제시
```

---

## 🎁 Bonus: 빠른 명령 모음

```bash
# 메모리 확인
free -h

# 빌드 (vite 정상 시)
cd /home/user/webapp && npm run build

# 빌드 (vite OOM 시)
cd /home/user/webapp && node build-esbuild.mjs

# 배포
cd /home/user/webapp && npx wrangler pages deploy dist --project-name sentinai --branch main

# git commit + push 패턴
cd /home/user/webapp && git add -A && git commit -m "..." && git push origin main

# 사이트 검증
curl -I https://sentinai.kr/marine
curl -s https://sentinai.kr/sitemap.xml | head -30

# 검색엔진 색인 요청 (외부 도구)
# - Google: https://search.google.com/search-console (URL 검사)
# - Naver: https://searchadvisor.naver.com (웹페이지 수집)
```

---

**끝.**

이 문서 한 장으로 새 세션이 전체 컨텍스트를 100% 복원할 수 있어야 합니다. 빠진 정보가 있으면 Ellio에게 물어보세요.

— 이전 세션 Claude 드림 ✋
