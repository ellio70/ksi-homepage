# KS Industry · Marine Robotics Lab — Global Website

## 프로젝트 개요
- **이름**: KS Industry · Marine Robotics Lab (마린로보틱스연구소) 공식 글로벌 홈페이지
- **목표**: 2026년 5월 울산정보산업진흥원 입주를 기점으로, **KS Industry 3.0 전략**(하드웨어 → 디지털 → 지능형 산업 OS)과 **AX MRO 플랫폼**(보고·듣고·판단하는 폐쇄망 멀티모달 정비 에이전트)을 글로벌 시장에 알리는 단일 페이지 사이트
- **타깃 시장**: 국방 MRO (Phase 1) → 조선해양·제조 (Phase 2) → 전력·우주항공 (Phase 3) → 향후 스마트그리드/로지스틱스/모빌리티
- **핵심 차별점**: 인물 캐릭터 페르소나 **MARIN**이 24시간 응답하는 AI CRM 에이전트 + 5개국어 즉시 전환

## 라이브 URL (개발 미리보기)
- **Production preview**: https://3000-irhkpilj917zezwyou3ar-8f57ffe2.sandbox.novita.ai
- **헬스체크**: https://3000-irhkpilj917zezwyou3ar-8f57ffe2.sandbox.novita.ai/api/health

## 완료된 기능 (Currently Completed)
- 단일 페이지 글로벌 홈페이지 (Hero / About / KS3.0 Vision / Industries / AX MRO Solutions / Roadmap / Contact / Footer)
- 5개국어 즉시 전환 (한국어·English·中文·日本語·Deutsch) — 우측 상단 언어 셀렉터
- 브라우저 언어 자동 감지 + 로컬스토리지 저장
- **MARIN AI 에이전트 챗봇** — 우측 하단 플로팅 위젯
  - 페르소나(이름·말투·미션) 시스템 프롬프트 내장
  - 사용자 언어 자동 따라가기
  - 빠른 질문 제안(suggestions) 칩
  - 마크다운 렌더링 + 타이핑 인디케이터
  - CRM 동작: 미팅 예약·파일럿 문의 시 이름/조직/희망 시간 수집
- **연락처 폼** — 이름/회사/이메일/관심분야/메시지 POST API 연동
- 스크롤 리빌 애니메이션, 글래스모피즘 UI, 사이언 액센트 다크 모드 디자인
- Responsive (mobile menu, mobile chat sheet)
- SEO 메타태그 + Open Graph + SVG favicon

## API 엔드포인트 정리
| Method | Path | 설명 |
|---|---|---|
| GET | `/` | 메인 홈페이지 (SSR) |
| GET | `/api/health` | 헬스체크 |
| GET | `/api/i18n` | 5개국어 사전 + 언어 목록 JSON |
| POST | `/api/chat` | MARIN 챗봇 — 본문: `{messages:[{role,content}], lang}` |
| POST | `/api/contact` | 문의 접수 — 본문: `{name, company?, email, topic?, message}` |
| GET | `/static/*` | 정적 자산 (CSS / JS / 이미지 / favicon) |

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
