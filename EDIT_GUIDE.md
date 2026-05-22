# ✏️ Ellio의 메인페이지 직접 수정 가이드

> 이 문서는 사업기획 직무의 Ellio가 **개발자 도움 없이 GitHub 웹에서 직접** 홈페이지 콘텐츠를 수정할 수 있도록 만든 실전 매뉴얼입니다.

---

## 🎯 30초 요약 (TL;DR)

1. **저장소 열기**: https://github.com/ellio70/ksi-homepage
2. **수정할 파일 클릭** → 우측 상단 **✏️ 연필 아이콘** 클릭
3. **텍스트 수정** → 페이지 하단 **[Commit changes...]** 초록 버튼 클릭
4. **1-2분 대기** → Cloudflare Pages가 자동 재배포 (연동 후)
5. **사이트에서 확인** → 새로고침 (Ctrl/Cmd + Shift + R)

---

## 📁 어떤 파일에서 무엇을 수정하나? (지도)

### 🥇 가장 자주 수정할 파일 — `src/i18n.ts`
**모든 화면 텍스트가 여기 있습니다.** 5개 언어(ko/en/zh/ja/de) 전부.

| 무엇을 바꾸려면 | 어떤 키를 찾으면 되나 |
|---|---|
| Hero 메인 타이틀 | `hero.title` |
| Hero 부제 | `hero.subtitle` |
| Hero CTA 버튼 | `hero.cta_primary`, `hero.cta_secondary` |
| 상단 메뉴 4개 | `nav.about`, `nav.industries`, `nav.solutions`, `nav.contact` |
| Industries 섹션 타이틀 | `industries.title` |
| 국방 MRO 카드 (제목/설명/불릿/슬로건) | `industries.defense_*` |
| 조선해양 MRO 카드 | `industries.marine_*` |
| 제조생산 MRO 카드 | `industries.manufacture_*` |
| SentinAI 섹션 타이틀 | `solution.title`, `solution.subtitle` |
| 8대 모듈 카드 | `solution.m1_*` ~ `solution.m8_*` |
| See/Hear/Decide 트리오 | `solution.see_*`, `solution.hear_*`, `solution.decide_*` |
| 차별화 비교표 (구 챗봇 vs SentinAI) | `solution.diff1_*` ~ `solution.diff4_*` |
| 푸터 회사 정보 | `footer.*` |
| 연락처 폼 | `contact.*` |
| 챗봇 인사말 | `chat.welcome`, `chat.placeholder` |

### 🥈 이미지 교체 — `public/static/images/`
사진을 바꾸려면 같은 파일명으로 새 이미지를 업로드하세요.

| 화면 위치 | 파일명 |
|---|---|
| Hero 배경 (해군 엔진룸) | `hero-navy-engine.jpg` |
| SentinAI 아바타 (Hero 우측) | `sentinai-avatar-female.jpg`, `sentinai-avatar-male.jpg` |
| 국방 MRO 카드 사진 | `nvidia-jetson.jpg` |
| 조선해양 MRO 카드 사진 | `port-tablet.jpg` |
| 제조생산 MRO 카드 사진 | `mro-dashboard.jpg` |
| SentinAI 하드웨어 | `sentinai-hardware.jpg` |

### 🥉 거의 안 건드리는 파일들 (개발자 영역)
- `src/pages/home.tsx` — 페이지 구조/레이아웃 (HTML 구조)
- `src/index.tsx` — 라우팅 + 챗봇 시스템 프롬프트
- `public/static/style.css` — 디자인/색상
- `package.json`, `wrangler.jsonc`, `vite.config.ts` — 빌드 설정 (절대 건드리지 마세요)

---

## 🔍 실전 시나리오 — 텍스트 수정하기

### 시나리오 1: 국방 MRO 슬로건 바꾸기

**Before**: "현장의 정비병이 곧 최고의 정비관이 됩니다."
**After**: "전장의 가장 든든한 정비 파트너"

#### 단계별 실행

**Step 1.** GitHub 저장소 열기
```
https://github.com/ellio70/ksi-homepage
```

**Step 2.** `src/` 폴더 클릭 → `i18n.ts` 파일 클릭

**Step 3.** 우측 상단 **✏️ (연필 아이콘)** 클릭 → "Edit this file"

**Step 4.** `Ctrl + F` (Mac: `Cmd + F`) 누르고 **`defense_slogan`** 검색

**Step 5.** 5번 매칭됩니다 (5개 언어 모두). 각각 수정:

```js
// 한국어 블록
'industries.defense_slogan': '전장의 가장 든든한 정비 파트너',

// English 블록
'industries.defense_slogan': 'The most reliable maintenance partner on the battlefield.',

// 中文 블록
'industries.defense_slogan': '战场上最值得信赖的维护伙伴。',

// 日本語 블록
'industries.defense_slogan': '戦場で最も信頼できる整備パートナー。',

// Deutsch 블록
'industries.defense_slogan': 'Der zuverlässigste Wartungspartner auf dem Schlachtfeld.',
```

**Step 6.** 페이지 맨 아래 스크롤 → **[Commit changes...]** 초록 버튼

**Step 7.** 다이얼로그가 뜨면:
- **Commit message**: `feat: 국방 MRO 슬로건 변경` (자유롭게 작성)
- **Commit directly to the main branch** 선택
- **[Commit changes]** 클릭

**Step 8.** 1-2분 대기 후 사이트 새로고침 → 변경 확인 ✅

---

### 시나리오 2: 이미지 교체

**예: 국방 MRO 카드 사진을 새 이미지로 교체**

**Step 1.** 새 이미지 준비 — 파일명을 정확히 **`nvidia-jetson.jpg`**로 (확장자 포함)

**Step 2.** GitHub에서 `public/static/images/` 폴더 열기

**Step 3.** 기존 `nvidia-jetson.jpg` 클릭 → 우측 상단 **🗑️ 휴지통** 클릭 → 삭제 커밋

**Step 4.** 다시 `public/static/images/` 폴더로 이동

**Step 5.** **[Add file ▼]** → **[Upload files]** 클릭

**Step 6.** 새 이미지 드래그&드롭 → **[Commit changes]**

**Step 7.** 1-2분 후 사이트 새로고침 → 새 이미지 반영 ✅

> 💡 **팁**: 이미지 권장 사이즈
> - Hero 배경: 1920×1080 (16:9, 200KB 이하)
> - 카드 사진: 1200×800 (3:2, 150KB 이하)
> - 아바타: 800×800 (1:1, 100KB 이하)

---

## ⚠️ 실수 방지 체크리스트

### 절대 건드리지 말 것
- ❌ **따옴표** `'` 와 `"` — 키와 값 양옆의 따옴표는 그대로
- ❌ **콤마** `,` — 줄 끝의 콤마를 지우면 빌드 실패
- ❌ **콜론** `:` — 키와 값 사이의 콜론
- ❌ **중괄호** `{` `}` — 블록 시작/끝
- ❌ **이스케이프** `\'` — 영어 문장의 `today\'s` 같은 부분의 백슬래시

### 안전한 수정 패턴
```js
// 원본
'industries.defense_slogan': '현장의 정비병이 곧 최고의 정비관이 됩니다.',

// ✅ 좋은 수정 (따옴표/콤마 그대로)
'industries.defense_slogan': '새로 바꾼 문구',

// ❌ 나쁜 수정 (콤마 빠짐 → 빌드 실패)
'industries.defense_slogan': '새로 바꾼 문구'

// ❌ 나쁜 수정 (따옴표 빠짐)
'industries.defense_slogan': 새로 바꾼 문구,
```

### HTML 줄바꿈
- 한 줄에 너무 길면 `<br/>` 태그로 줄바꿈
```js
'industries.title': '엣지 sLM MRO 특화 솔루션으로<br/>국방·조선해양·제조·전력·우주항공까지 확장합니다',
```

### 따옴표가 본문에 있을 때
- 작은따옴표(`'`) 안에서 작은따옴표를 쓰려면 `\'`로 이스케이프
```js
// ✅ 올바른 예
'solution.m5_desc': 'Decomposes natural-language commands such as \"write today\'s work completion report\" into...',
```
- 또는 큰따옴표(`"`)로 감싸기 — 단, **반드시 둘 중 하나로 통일**해야 함

---

## 🚨 빌드 실패했을 때 — 복구법

### 증상
- GitHub 저장소 상단에 **🟥 빨간 X** 표시
- Cloudflare Pages에서 새 버전이 안 올라옴

### 복구 방법 1 — 직전 커밋으로 롤백 (가장 빠름)

**Step 1.** GitHub 저장소 → **Commits** 탭

**Step 2.** 문제 없던 직전 커밋 클릭 (초록 ✓ 표시)

**Step 3.** 우측 상단 **`<>` Browse files** 버튼

**Step 4.** 우측의 **[ ⋯ ]** → **Revert** 또는 **Reset**
- 또는 새 커밋으로 덮어쓰기

### 복구 방법 2 — 어떤 줄이 문제인지 확인

**Step 1.** 저장소 → **Actions** 탭

**Step 2.** 빨간 X 표시된 워크플로우 클릭

**Step 3.** 에러 로그에서 다음 같은 문구 찾기:
```
src/i18n.ts:341: Expected ',' but found ...
                  ^^^^
```
→ 341줄에 콤마 빠진 것

**Step 4.** 해당 줄 수정 → 새 커밋

### 복구 방법 3 — Claude에게 도움 요청
빌드 실패 후 복구가 어려우면 채팅에서:
> "GitHub에서 직접 수정했는데 빌드가 깨졌어. 복구해줘"

→ 제가 코드 보고 자동 수정해드립니다.

---

## 🎁 보너스 — 자주 쓸 만한 i18n 키 빠른 참조

### Hero 섹션 (스크롤 맨 위)
```js
'hero.tag': 'KS INDUSTRY 3.0 · MARINE ROBOTICS LAB',
'hero.title': '보고 듣고 판단하는<br/>멀티모달 MRO 에이전트, <span class="text-gradient">SentinAI</span>',
'hero.subtitle': '엣지 sLM AI 기술과 스마트 글래스 융합으로 MRO 현장의 새로운 미래를 열어갑니다.',
'hero.cta_primary': 'SentinAI 솔루션 보기',
'hero.cta_secondary': 'SentinAI와 대화하기',
'hero.badge1': '울산정보산업진흥원 입주 · 2026.05',
'hero.badge2': '해상크레인·조선기자재 30+ 년 노하우',
'hero.badge3': 'sLM · 엣지 AI · 폐쇄망 인증 트랙',
```

### Industries — 국방 MRO 카드
```js
'industries.defense_title': '국방 MRO',
'industries.defense_desc': '폐쇄망·오프라인 환경에서...',
'industries.defense_b1': '완전 폐쇄망 온디바이스 추론 (Jetson Orin 급)',
'industries.defense_b2': '다중모달 입력: 텍스트·음성·정비 도면·환경음',
'industries.defense_b3': '근거잠금 RAG로 정비교범 추적성 100% 보장',
'industries.defense_b4': '작전현장 스마트 글래스 핸즈프리 워크플로우',
'industries.defense_slogan': '현장의 정비병이 곧 최고의 정비관이 됩니다.',
```

### 챗봇 (MARIN/SentinAI 페르소나)
```js
'chat.welcome': '안녕하세요! SentinAI 에이전트입니다...',
'chat.placeholder': '무엇이든 물어보세요',
'chat.send': '전송',
```

---

## 📚 참고 링크

- **저장소**: https://github.com/ellio70/ksi-homepage
- **Cloudflare Pages** (배포 후): `https://ksi-homepage.pages.dev` (예정)
- **개발 미리보기**: 샌드박스 URL (Claude에게 요청)

---

## 💬 막히면 채팅으로 요청

Ellio가 직접 수정하다 막히면, 언제든 채팅으로:
- "○○ 섹션 텍스트 한 번에 수정해줘"
- "빌드 깨졌어, 복구해줘"
- "새 섹션 추가하고 싶어"

→ 제가 5개 언어 동시 처리 + 빌드 + 배포까지 처리합니다. 🚀

---

**Last updated**: 2026-05-22
**Maintainer**: Ellio (ellio70) + Claude
