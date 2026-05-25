# 🚀 SentinAI 검색엔진 등록 가이드

> 작성일: 2026-05-25  
> 대상 사이트: https://sentinai.kr  
> 작업자: Ellio (KS Industry 사업기획)

---

## ⚠️ 사전 작업 (필수!) — Cloudflare robots.txt 토글 끄기

검색엔진 등록 **전에 반드시** 처리:

1. https://dash.cloudflare.com 로그인
2. **sentinai.kr** 도메인 선택
3. 좌측 메뉴 → **AI Crawl Control** (또는 **Bots** → **Manage robots.txt**)
4. **"Add Cloudflare's robots.txt"** 토글 → **OFF**
5. 5분 후 https://sentinai.kr/robots.txt 가 우리가 쓴 내용으로 바뀌었는지 확인

확인 명령(터미널):
```bash
curl https://sentinai.kr/robots.txt
# 첫 줄이 "User-agent: *" 로 시작하면 OK
```

---

## 📋 등록 순서 (우선순위 高 → 低)

### 1️⃣ 네이버 서치어드바이저 (한국 검색 점유율 1위)

#### 등록 URL
👉 https://searchadvisor.naver.com/

#### 단계
1. 네이버 로그인 → "사이트 등록"
2. 사이트 URL: `https://sentinai.kr` 입력 → 확인
3. **소유 확인 방법: "HTML 태그"** 선택
4. 화면에 표시되는 메타태그 복사:
   ```html
   <meta name="naver-site-verification" content="XXXXXXXXXX..." />
   ```
5. **content="" 안의 값(코드)을 Ellio가 복사해서 나한테 알려주기** → 내가 코드에 심고 재배포
6. 재배포 완료 후 네이버 화면에서 "확인" 버튼 클릭

#### 확인 후 해야 할 것
- [ ] 사이트맵 등록: **"요청 → 사이트맵 제출"** → `https://sentinai.kr/sitemap.xml` 입력
- [ ] RSS 등록: (없음, 스킵)
- [ ] 웹마스터 도구에서 "검색반영" → 주요 URL 수동 색인 요청 (최대 50건/일)
  - https://sentinai.kr/
  - https://sentinai.kr/privacy

#### 색인 반영 예상 기간
- 통상 **3~14일** (네이버는 다소 느린 편)

---

### 2️⃣ 구글 서치 콘솔 (해외 + 글로벌 노출)

#### 등록 URL
👉 https://search.google.com/search-console

#### 단계
1. 구글 계정 로그인 → "속성 추가"
2. **"URL 접두어"** 선택 → `https://sentinai.kr/` 입력
3. **소유 확인 방법: "HTML 태그"** 선택
4. 화면에 표시되는 메타태그 복사:
   ```html
   <meta name="google-site-verification" content="XXXXXXXXXX..." />
   ```
5. **content="" 안의 값을 Ellio가 복사해서 나한테 알려주기** → 내가 코드에 심고 재배포
6. 재배포 완료 후 구글 화면에서 "확인" 버튼 클릭

#### 확인 후 해야 할 것
- [ ] 좌측 메뉴 **"Sitemaps"** → `sitemap.xml` 입력 후 제출
- [ ] **"URL 검사"** 도구로 `https://sentinai.kr/` 검사 → "색인 생성 요청"
- [ ] 동일하게 `https://sentinai.kr/privacy` 도 검사

#### 색인 반영 예상 기간
- 통상 **1~3일** (구글이 가장 빠름)

---

### 3️⃣ 다음 검색등록 (Kakao)

#### 등록 URL
👉 https://register.search.daum.net/index.daum

#### 단계
1. 카카오 계정 로그인
2. **"신규 등록"** 클릭
3. 사이트 URL: `https://sentinai.kr`
4. 사이트명: `SentinAI · KS인더스트리 마린로보틱스연구소`
5. 카테고리: **"비즈니스/경제 > IT/기술"** 또는 적절히
6. 사이트 설명 (300자 이내, 아래 템플릿 복붙 OK):
   ```
   KS인더스트리 마린로보틱스연구소가 22년 마린크레인 산업의 노하우 위에 AI를 더해 만든
   엣지 sLM MRO 플랫폼 'SentinAI(센티나이)'. 보고 듣고 판단하는 멀티모달 정비 에이전트로,
   함정·조선·국방·제조 산업의 예지정비를 새롭게 정의합니다. 2027년 상반기 1단계 플랫폼
   공식 출범을 목표로 합니다.
   ```
7. 키워드 (10개 이내, 쉼표 구분):
   ```
   SentinAI, 센티나이, KS인더스트리, 마린로보틱스연구소, MRO, 예지정비, 엣지AI, 함정MRO, 조선MRO, K-MRO
   ```
8. 신청 → 카카오 심사 대기

#### 색인 반영 예상 기간
- 통상 **5~14일** (수동 심사 진행)

#### 참고
- 다음은 별도 메타태그 인증이 필요 없음 (URL/설명 기반 심사)
- 심사 결과는 등록한 이메일로 통보

---

### 4️⃣ 빙 웹마스터 (Microsoft + ChatGPT 검색용)

#### 등록 URL
👉 https://www.bing.com/webmasters

#### 단계 (꿀팁: 구글 서치콘솔에서 import 가능)
1. Microsoft 계정 로그인
2. **"사이트 가져오기"** → **"Google Search Console에서 가져오기"** 선택
   - 구글 인증으로 한 번에 등록 + 사이트맵 자동 가져옴 ⚡
3. 만약 수동 등록:
   - URL: `https://sentinai.kr/`
   - 소유 확인: **"메타 태그"** → 화면에 표시되는 코드:
     ```html
     <meta name="msvalidate.01" content="XXXXXXXXXX..." />
     ```
   - **content="" 안의 값을 Ellio가 복사해서 나한테 알려주기** → 내가 코드에 심고 재배포

#### 확인 후 해야 할 것
- [ ] Sitemap 제출: `https://sentinai.kr/sitemap.xml` (구글에서 import했으면 자동)
- [ ] **IndexNow 기능 활성화** (즉시 색인 푸시) — 옵션

#### 색인 반영 예상 기간
- 통상 **1~7일**
- 빙 색인은 **ChatGPT 검색**, **DuckDuckGo**, **Edge 브라우저 기본 검색**에도 영향

---

## 🎁 보너스 — 추가 노출 채널 (선택사항)

### 📌 한국 특화 추가 등록처
- **줌(ZUM)**: https://help.zum.com/openpage — 한국 토종 검색 (점유율 미미하지만 SEO 백링크 효과)
- **NATE**: 별도 등록 불필요 (다음/네이버 결과 활용)

### 📌 글로벌 추가 등록처
- **Yandex** (러시아·CIS): https://webmaster.yandex.com/
- **Baidu** (중국 시장 진입 시): https://ziyuan.baidu.com/ — 중국 사업 본격화 시점에 등록 권장

### 📌 비즈니스 디렉토리 (백링크 + 신뢰도 ↑)
- **Google 비즈니스 프로필**: https://www.google.com/business — KS인더스트리(함안 본사) 등록
- **네이버 플레이스**: 마린로보틱스연구소(울산 IPA 입주 후) 등록 가능

---

## 📊 등록 후 모니터링 일정 제안

| 기간 | 할 일 |
|---|---|
| **D+1일** | 구글 서치 콘솔 — 색인 상태 확인 |
| **D+3일** | 네이버 서치어드바이저 — 사이트맵 처리 결과 확인 |
| **D+7일** | 빙 웹마스터 — 색인 보고서 확인 |
| **D+14일** | 다음 — 심사 결과 메일 확인, 색인 안 됐으면 재요청 |
| **D+30일** | 4곳 통합 — 키워드별 노출 순위 점검 (`SentinAI`, `센티나이`, `KS인더스트리 마린로보틱스` 등) |

---

## 🤝 Ellio가 나한테 알려줘야 할 인증 코드 (재배포 필요)

각 사이트 등록 과정에서 발급받는 인증 코드를 모아서 알려주면 한 번에 심고 재배포할게:

```
1. naver-site-verification:    [여기에 코드 붙여넣기]
2. google-site-verification:   [여기에 코드 붙여넣기]
3. msvalidate.01 (빙):         [여기에 코드 붙여넣기]
```

(다음은 메타태그 인증이 필요 없으니 스킵)

---

## ✅ 최종 체크리스트

### 사전 조건
- [x] sentinai.kr DNS 정상 (Cloudflare Pages 연결)
- [x] HTTPS 인증서 활성 (Cloudflare 자동)
- [x] sitemap.xml 정상 응답 (https://sentinai.kr/sitemap.xml)
- [x] OG 이미지 노출 (https://sentinai.kr/static/images/og-sentinai.jpg)
- [x] JSON-LD 구조화 데이터 임베드 완료
- [ ] **Cloudflare 자체 robots.txt 토글 OFF** ← 사용자 액션 필요

### 등록
- [ ] 네이버 서치어드바이저
- [ ] 구글 서치 콘솔
- [ ] 다음 검색등록
- [ ] 빙 웹마스터

### 등록 후
- [ ] 4곳 모두 사이트맵 제출 완료
- [ ] 주요 페이지 수동 색인 요청
- [ ] D+7일 색인 결과 확인
