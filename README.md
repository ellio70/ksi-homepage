# KS Industry · Marine Robotics Lab — Global Website

## 프로젝트 개요
- **이름**: KS Industry · Marine Robotics Lab (마린로보틱스연구소) 공식 글로벌 홈페이지
- **목표**: 2026년 5월 울산정보산업진흥원 입주를 기점으로, **KS Industry 3.0 전략**(하드웨어 → 디지털 → 지능형 산업 OS)과 **AX MRO 플랫폼**(보고·듣고·판단하는 폐쇄망 멀티모달 정비 에이전트)을 글로벌 시장에 알리는 단일 페이지 사이트
- **타깃 시장**: 국방 MRO (Phase 1) → 조선해양·제조 (Phase 2) → 전력·우주항공 (Phase 3) → 향후 스마트그리드/로지스틱스/모빌리티
- **핵심 차별점**: 인물 캐릭터 페르소나 **MARIN**이 24시간 응답하는 AI CRM 에이전트 + 5개국어 즉시 전환

## 라이브 URL (개발 미리보기)
- **Production preview**: https://3000-irhkpilj917zezwyou3ar-8f57ffe2.sandbox.novita.ai
- **헬스체크**: https://3000-irhkpilj917zezwyou3ar-8f57ffe2.sandbox.novita.ai/api/health
- **🛡️ CMS 관리자 패널**: https://3000-irhkpilj917zezwyou3ar-8f57ffe2.sandbox.novita.ai/admin

## CMS — 비주얼 콘텐츠 관리 패널
- 경로: `/admin` (비밀번호 보호)
- 초기 비밀번호: `.dev.vars`의 `ADMIN_PASSWORD` (기본값 `ksi2026` — 첫 사용 후 즉시 변경 권장)
- **📝 콘텐츠 편집**: 5개 언어 동시 편집, 섹션별 그룹화(상단 메뉴/Hero/Industries/SentinAI/Contact/챗봇/푸터), 변경사항 추적, 기본값 복원
- **🖼️ 이미지 관리**: 14개 슬롯별 파일 업로드/교체 (jpg/png/webp/svg, 최대 5MB)
- **🧩 레이아웃 편집 (NEW)**:
  - **섹션 ON/OFF**: 10개 섹션(industries, solutions, sentinai, hardware, forces, kpi, architecture, applications, roadmap, contact) 각각 토글로 페이지에서 통째로 숨김/표시
  - **이미지 위치 교체**: 12개 위치 슬롯(hero_bg, industries_card1~3, hardware_main, architecture_sovereign/core, applications_bg/card1~3, chat_avatar)에 어떤 이미지 파일을 박을지 드롭다운으로 자유 선택 — 같은 이미지를 여러 위치에 동시 사용 가능
  - 변경분만 KV에 저장 (기본값과 같으면 자동 정리), 전체 초기화 한 번에 가능
- 데이터: Cloudflare KV(`CMS_KV` 바인딩) — i18n 오버라이드 + 이미지 blob + 레이아웃 매핑 저장
- 머지 우선순위: **KV 오버라이드 > 기본 `src/i18n.ts` / `home.tsx` 디폴트** — 코드 변경 없이 콘텐츠/레이아웃 실시간 발행

## 완료된 기능 (Currently Completed)
- **11개 섹션 단일 페이지** 글로벌 홈페이지:
  Hero → About → KS 3.0 Vision → Industries → AX MRO Solutions → **Sovereign Edge Architecture** → **In the Field (현장)** → **Production & Facility (생산·시설)** → **Clients (거래처)** → Roadmap → Contact → Footer
- **회사소개서 콘텐츠 통합** — 함안 본사(8,980평/3,634평), 연 720기 생산, 마린크레인 7종 제품 라인업(월 공급능력 포함), 6개 국제 인증, 국내 10대 + 해외 6대 거래처
- **실사 이미지 시각화** — Industries 카드별 사진 배경, Reality 섹션 3장 현장 사진(엔진룸/항만/국방), Architecture 섹션 Sovereign Edge 도식 + Core R&D 아키텍처 도면, Solutions 섹션 Smart MRO Platform UI 스크린샷, Hero 배경 = 한국 해군 엔진룸 정비 장면
- **신규 SVG 로고 자산** — `/static/logos/ksi-mark.svg`(64×64 KSI 마크) + `ksi-wordmark.svg`(KSI 가로 워드마크) + **`mrl-wordmark.svg`(문양 없이 글씨로만 디자인된 Marine Robotics Lab 로고 — 사용자 명시 요구사항)**
- 5개국어 즉시 전환 (한국어·English·中文·日本語·Deutsch) — 우측 상단 언어 셀렉터
- 브라우저 언어 자동 감지 + 로컬스토리지 저장
- **MARIN AI 에이전트 챗봇** — 우측 하단 플로팅 위젯, 회사소개서 사실(생산능력·거래처·인증)이 시스템 프롬프트에 임베드되어 정확한 CRM 응답 가능
- **연락처 폼** — 이름/회사/이메일/관심분야/메시지 POST API 연동
- 스크롤 리빌 애니메이션, 글래스모피즘 UI, 사이언 액센트 다크 모드 디자인
- Responsive (mobile menu, mobile chat sheet, 데스크탑 테이블 → 모바일 카드 자동 전환)
- SEO 메타태그 + Open Graph + SVG favicon

## API 엔드포인트 정리
| Method | Path | 설명 |
|---|---|---|
| GET | `/` | 메인 홈페이지 (SSR + layout 상태 주입) |
| GET | `/api/health` | 헬스체크 |
| GET | `/api/i18n` | 5개국어 사전 + 언어 목록 JSON (기본 + KV 오버라이드 머지본) |
| GET | `/api/layout` | 현재 layout 상태 (섹션 visibility + 이미지 슬롯 매핑) |
| POST | `/api/chat` | MARIN 챗봇 — 본문: `{messages:[{role,content}], lang}` |
| POST | `/api/contact` | 문의 접수 — 본문: `{name, company?, email, topic?, message}` |
| GET | `/static/*` | 정적 자산 (CSS / JS / 이미지 / favicon) — `/static/images/*`는 KV 오버라이드 우선 |
| **CMS API (인증 필요)** | | |
| POST | `/api/admin/login` | 비밀번호 로그인 → 세션 쿠키 발급 |
| GET | `/api/admin/me` | 인증 상태 확인 |
| GET/PUT/DELETE | `/api/admin/i18n[/:key]` | i18n 오버라이드 CRUD |
| GET/POST/DELETE | `/api/admin/images[/:filename]` | 이미지 슬롯 CRUD |
| GET | `/api/admin/layout` | 현재 layout + 메타데이터 (섹션 정의 + 이미지 풀) |
| PUT | `/api/admin/layout/sections` | 섹션 visibility 일괄 저장 — 본문: `{sections:{id:bool,...}}` |
| PUT | `/api/admin/layout/images` | 이미지 슬롯 리매핑 일괄 저장 — 본문: `{images:{slotId:filename,...}}` |
| DELETE | `/api/admin/layout` | layout 전체 초기화 |

## 데이터 아키텍처
- **사이트 콘텐츠**: 5개국어 사전을 `/src/i18n.ts`에 정적으로 보관 (Edge-friendly, 캐시 친화)
- **챗봇 백엔드**: Genspark LLM 프록시 (OpenAI 호환, `gpt-5-mini`) — `.dev.vars`에 키 보관
- **CRM 리드**: 현재는 서버 로그에 기록 (MVP). 다음 단계에서 Cloudflare D1 또는 Resend 메일 연동 예정
- **상태 저장**: 사용자 언어 선택 → 브라우저 `localStorage`

## 기술 스택
- **백엔드**: Hono 4 (Cloudflare Pages Functions / SSR JSX)
- **프론트엔드**: Vanilla JS + Tailwind CSS (CDN) + FontAwesome + Inter/Noto/Space Grotesk
- **빌드**: Vite 6 + `@hono/vite-build/cloudflare-pages`
- **런타임**: Cloudflare Workers (로컬: `wrangler pages dev` via PM2)
- **AI**: OpenAI 호환 API (Genspark LLM proxy, gpt-5-mini)

## 미구현 / 다음 단계 (Recommended Next Steps)
1. **CRM 데이터 영속화**: Cloudflare D1 바인딩 추가 → `/api/contact`, `/api/chat` 로그 저장
2. **메일·슬랙 알림**: 새 리드 생성 시 Resend / Slack Webhook으로 자동 알림
3. **챗봇 메모리**: 같은 세션 사용자 대화 이력을 KV에 저장 (현재는 브라우저 in-memory)
4. **검색·SEO 강화**: sitemap.xml, robots.txt, structured data (JSON-LD)
5. **콘텐츠 확장**:
   - 연구진 프로필 카드 섹션
   - 미디어·보도자료 페이지
   - 채용 페이지
6. **MARIN 음성 모드**: Web Speech API 기반 TTS/STT 통합 (전시·시연용)
7. **분석**: Cloudflare Web Analytics 또는 Plausible 추가
8. **다국어 추가**: 베트남어, 인도네시아어 (동남아 조선·국방 시장 확장 시)
9. **Production 배포**: `wrangler pages deploy dist` (별도 `setup_cloudflare_api_key` 필요)
10. **이미지 자산 자체호스팅**: 현재 외부 CDN(genspark.ai) 사용 중 → 빌드 자산으로 번들

## 사용자 가이드
1. 사이트 진입 시 브라우저 언어로 자동 전환 (지원: KR/EN/CN/JP/EU)
2. 우측 상단 🌐 버튼으로 언어 수동 변경
3. 우측 하단 MARIN 아이콘 클릭 → AI 에이전트와 대화 시작
   - "연구소 핵심 솔루션이 뭔가요?"
   - "국방 MRO 도입 절차가 궁금합니다"
   - "미팅을 잡고 싶어요" — 자동으로 이름/조직/희망 시간 요청
4. 페이지 하단 Contact 폼으로 정식 문의 접수 (성공 시 안내 메시지 표시)

## 로컬 개발
```bash
cd /home/user/webapp
npm install
npm run build
pm2 start ecosystem.config.cjs
# → http://localhost:3000
```

환경변수 (`.dev.vars`):
```
OPENAI_API_KEY=<gsk-...>
OPENAI_BASE_URL=https://www.genspark.ai/api/llm_proxy/v1
```

## 배포 상태
- **플랫폼**: Cloudflare Pages (예정)
- **현재 상태**: ✅ 로컬 개발 서버 운영 중 (PM2 daemon)
- **마지막 업데이트**: 2026-05-22

---
© 2026 KS Industry · Marine Robotics Lab. Built with Hono on the Edge.
