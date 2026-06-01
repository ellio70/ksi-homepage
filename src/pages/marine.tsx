// =====================================================
// /marine — 조선해양 MRO 산업별 랜딩페이지
// SEO 타깃 키워드:
//   - 조선 MRO / 해상크레인 정비 / 조선해양 AI
//   - 마린크레인 예지정비 / 조선소 스마트 정비
//   - 항만 크레인 AI / 해양플랜트 MRO
// =====================================================

export function MarinePage() {
  // FAQ 데이터 (Schema.org FAQ 마크업과 본문에 동시 사용)
  const faqs = [
    {
      q: '조선 MRO에 AI를 적용하면 어떤 변화가 있나요?',
      a: '전통 조선 MRO는 정해진 주기에 따라 부품을 교체하거나 고장 후 수리하는 사후정비(Reactive Maintenance) 중심이었습니다. SentinAI는 해상크레인·선박 엔진·갑판 장비의 진동·소음·열·압력 데이터를 실시간으로 분석해 고장 징후를 사전에 포착하는 예지정비(Predictive Maintenance) 체계로 전환합니다. 정비 기간이 평균 30% 단축되고, 갑작스러운 운항 중단으로 인한 손실을 크게 줄일 수 있습니다.',
    },
    {
      q: '해상크레인은 일반 산업 장비와 정비 방식이 어떻게 다른가요?',
      a: '해상크레인은 염해(salt corrosion), 24시간 무중단 운용, 고하중 반복 작업이라는 세 가지 극한 환경에 노출됩니다. 일반 산업 장비보다 부품 마모 속도가 빠르고, 한 번 고장나면 항만 전체 물류가 마비될 수 있습니다. KS인더스트리는 30년 이상 마린크레인 한 길을 걸어오며 축적한 정비 노하우와 음향·진동 패턴 데이터를 SentinAI sLM에 학습시켜, 일반 AI가 놓치는 해양 환경 특유의 이상 징후를 잡아냅니다.',
    },
    {
      q: '조선소 현장에서 정비병/정비공은 SentinAI를 어떻게 사용하나요?',
      a: '정비 작업자는 스마트 글래스를 착용하고 작업 현장에 진입하면 됩니다. 글래스의 카메라가 장비를 인식하면 SentinAI가 해당 장비의 정비 교범, 과거 정비 이력, 도면, 숙련자 암묵지를 골전도 음성으로 안내합니다. 양손은 작업에 자유로워지고, 정비일지는 음성으로 자동 기록됩니다. 신입 정비공도 숙련자의 30년 노하우를 실시간으로 받으며 작업할 수 있습니다.',
    },
    {
      q: '조선소의 폐쇄망 환경에서도 동작하나요?',
      a: '네, 폐쇄망 운영이 SentinAI의 핵심 설계 원칙입니다. 모든 AI 추론은 현장의 NVIDIA Jetson 기반 엣지 디바이스(AI HUB)에서 처리되며, 외부 클라우드 연결 없이 sLM(Small Language Model)이 로컬에서 동작합니다. 도면·정비 데이터·작업 영상이 사외로 유출되지 않으면서도 AI의 모든 기능을 활용할 수 있어, 보안이 중요한 조선소·해군 정비창·해양플랜트에 그대로 적용 가능합니다.',
    },
    {
      q: '기존 조선소 ERP/MES 시스템과 연동되나요?',
      a: '네, SentinAI는 모듈형 아키텍처로 설계되어 기존 조선소 IT 인프라와 단계적으로 연동됩니다. 정비 작업 결과는 표준 API를 통해 ERP/MES/PLM 시스템에 자동 전송되며, 정비 이력은 디지털 트윈 기반 관리 체계로 누적됩니다. E8(이에이트)과의 파트너십을 통해 폐쇄망 환경에서도 온톨로지 기반 하이브리드 RAG로 기존 데이터베이스와 연결됩니다.',
    },
    {
      q: '도입까지 어느 정도 기간이 필요한가요?',
      a: '표준 도입 절차는 3단계 6~9개월입니다. ① 현장 진단 및 데이터 수집(1~2개월) — 대상 장비 선정, 정비 교범·이력 디지털화. ② 파일럿 운영(2~3개월) — 1~2개 라인에서 SentinAI 시범 운용, 정비공 피드백 반영. ③ 본격 도입(3~4개월) — 전사 확산, KPI 측정, 운영팀 인수인계. 2027년 상반기 1단계 플랫폼 정식 출범 시점부터 본격 도입이 가능합니다.',
    },
    {
      q: '글로벌 조선소(현대중공업·삼성중공업·한화오션 등)에도 적용 가능한가요?',
      a: 'KS인더스트리는 글로벌 빅5 조선소의 동반자로서 22년 이상 마린크레인을 납품해온 경험이 있으며, 국내 해상크레인 시장의 한 축을 담당하고 있습니다. SentinAI는 처음부터 한국어/영어/중국어/일본어/스페인어 5개 언어로 설계되어, 국내 조선소뿐만 아니라 글로벌 조선·해양 시장 진출이 가능합니다.',
    },
    {
      q: '비용 구조는 어떻게 되나요?',
      a: 'SentinAI는 ① 엣지 하드웨어 패키지(스마트 글래스 + 인후 마이크 + AI HUB) 일회성 도입 비용과 ② sLM 라이선스·업데이트 구독료로 구성됩니다. 도입 규모, 장비 종류, 정비공 인원에 따라 유연하게 책정되며, 정확한 견적은 협력 문의를 통해 안내드립니다. 정부 스마트팩토리·디지털전환 지원사업 활용 시 상당 부분 부담을 줄일 수 있습니다.',
    },
  ]

  return (
    <div class="bg-ks-deep text-white min-h-screen">
      {/* ===== SEO 메타 오버라이드 (페이지 전용) ===== */}
      {/* 주: jsx-renderer는 부모 renderer.tsx의 head를 사용하므로 별도 메타는 본문 내 콘텐츠로 강화 */}

      {/* FAQ Schema.org 마크업 — 검색 결과 리치 스니펫 노출용 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.a,
              },
            })),
          }),
        }}
      />

      {/* Breadcrumb Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'SentinAI',
                item: 'https://sentinai.kr/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: '조선해양 MRO',
                item: 'https://sentinai.kr/marine',
              },
            ],
          }),
        }}
      />

      {/* ===== Top Nav (간단 버전) ===== */}
      <nav class="fixed top-0 inset-x-0 z-40 glass-strong">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" class="flex items-center gap-3 group">
            <img src="/static/logos/ksi-mark-white.png" alt="KSI" class="w-9 h-9 select-none" draggable={false} />
            <div class="leading-tight border-l border-white/10 pl-3">
              <div class="font-display text-white text-[15px] font-bold tracking-tight">KS INDUSTRY</div>
              <div class="text-[10px] text-ks-cyan-soft tracking-[0.22em] uppercase">Marine Robotics Lab</div>
            </div>
          </a>
          <div class="hidden md:flex items-center gap-7 text-sm text-slate-300">
            <a href="/" class="hover:text-ks-cyan transition">홈</a>
            <a href="/#industries" class="hover:text-ks-cyan transition">산업</a>
            <a href="/#solutions" class="hover:text-ks-cyan transition">솔루션</a>
            <a href="/#contact" class="hover:text-ks-cyan transition">문의하기</a>
          </div>
          <a href="/#contact" class="btn-primary rounded-full px-4 py-1.5 text-xs inline-flex items-center gap-2">
            <i class="fa-solid fa-paper-plane"></i>
            <span>협력 문의</span>
          </a>
        </div>
      </nav>

      {/* ===== Breadcrumb (시각적) ===== */}
      <div class="pt-20 pb-2">
        <div class="max-w-5xl mx-auto px-6 text-xs text-slate-500">
          <a href="/" class="hover:text-ks-cyan transition">SentinAI</a>
          <span class="mx-2 text-slate-700">/</span>
          <span class="text-slate-300">조선해양 MRO</span>
        </div>
      </div>

      {/* ===== Hero Section ===== */}
      <header class="hero-bg relative pt-12 pb-20 md:pt-16 md:pb-24 overflow-hidden">
        {/* WebP 우선 배경: image-set으로 지원 브라우저는 webp, 그외는 jpg fallback */}
        <div
          class="absolute inset-0 pointer-events-none"
          style='background-image:linear-gradient(180deg,rgba(4,8,20,0.78) 0%,rgba(4,8,20,0.82) 35%,rgba(4,8,20,0.95) 100%),image-set(url("/static/images/port-tablet.webp") type("image/webp"), url("/static/images/port-tablet.jpg") type("image/jpeg"));background-size:cover;background-position:center;'
        ></div>
        <div class="relative max-w-5xl mx-auto px-6">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs tracking-widest text-ks-cyan-soft mb-6">
            <i class="fa-solid fa-ship text-ks-cyan"></i>
            <span>MARINE & OFFSHORE MRO</span>
          </div>
          <h1 class="font-display text-3xl md:text-5xl font-bold leading-[1.3] md:leading-[1.4] tracking-tight">
            조선해양 산업의 정비를 다시 정의하는<br />
            <span class="text-gradient">조선 MRO AI 에이전트, SentinAI</span>
          </h1>
          <p class="mt-8 max-w-3xl text-slate-200/90 text-base md:text-lg leading-loose">
            <strong class="text-white">해상크레인·선박·해양플랜트의 예지정비</strong>를 위한 멀티모달 AI 솔루션.
            22년간 글로벌 빅5 조선소의 동반자로 마린크레인을 공급해온 KS인더스트리가
            그동안 축적한 정비 노하우와 sLM(Small Language Model) 기술을 결합해
            조선소·항만·해양플랜트 현장의 새로운 MRO 표준을 만들어갑니다.
          </p>
          <div class="mt-10 flex flex-wrap gap-3">
            <a href="/#contact" class="btn-primary rounded-full px-6 py-3 text-sm inline-flex items-center gap-2">
              <i class="fa-solid fa-handshake"></i>
              <span>조선해양 협력 문의</span>
            </a>
            <a href="#solution" class="btn-ghost rounded-full px-6 py-3 text-sm inline-flex items-center gap-2">
              <i class="fa-solid fa-arrow-down"></i>
              <span>솔루션 자세히 보기</span>
            </a>
          </div>
          <div class="mt-10 flex flex-wrap gap-2">
            <span class="glass rounded-full px-3 py-1.5 text-xs text-slate-200">해상크레인 예지정비</span>
            <span class="glass rounded-full px-3 py-1.5 text-xs text-slate-200">조선소 스마트 MRO</span>
            <span class="glass rounded-full px-3 py-1.5 text-xs text-slate-200">선박 엔진룸 음향 AI</span>
            <span class="glass rounded-full px-3 py-1.5 text-xs text-slate-200">해양플랜트 정비 자동화</span>
            <span class="glass rounded-full px-3 py-1.5 text-xs text-slate-200">22년 마린크레인 노하우</span>
          </div>
        </div>
      </header>

      {/* ===== Problem Section ===== */}
      <section class="py-24 section-bg">
        <div class="max-w-5xl mx-auto px-6">
          <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3">CHALLENGE</div>
          <h2 class="font-display text-2xl md:text-3xl font-bold leading-tight mb-6">
            왜 조선해양 MRO는 다른 산업보다 어려운가
          </h2>
          <p class="text-slate-300 text-base md:text-lg leading-loose mb-12">
            조선소·항만·해양플랜트는 정비의 난이도가 가장 높은 환경 중 하나입니다.
            <strong class="text-white"> 24시간 무중단 운용</strong>이 기본이며,
            한 번의 고장이 곧 <strong class="text-white">항만 전체 물류 중단</strong>이나
            <strong class="text-white"> 운항 일정 차질</strong>로 이어집니다.
            그럼에도 불구하고 정비 현장은 여전히 종이 교범과 숙련자의 머릿속에 의존하고 있습니다.
          </p>

          <div class="grid md:grid-cols-2 gap-5">
            <div class="glass rounded-2xl p-6 industry-card">
              <div class="w-11 h-11 rounded-xl bg-ks-cyan/10 text-ks-cyan flex items-center justify-center mb-4">
                <i class="fa-solid fa-droplet"></i>
              </div>
              <h3 class="font-display text-lg font-bold mb-2">염해(Salt Corrosion)와 극한 환경</h3>
              <p class="text-sm text-slate-300 leading-relaxed">
                바닷바람·해수 분무·고온다습이 결합된 환경은 일반 산업 장비보다 부품 마모 속도가 3~5배 빠릅니다.
                정해진 정비 주기로는 부식 진행을 따라잡기 어렵습니다.
              </p>
            </div>
            <div class="glass rounded-2xl p-6 industry-card">
              <div class="w-11 h-11 rounded-xl bg-ks-cyan/10 text-ks-cyan flex items-center justify-center mb-4">
                <i class="fa-solid fa-clock"></i>
              </div>
              <h3 class="font-display text-lg font-bold mb-2">24시간 무중단 가동 압박</h3>
              <p class="text-sm text-slate-300 leading-relaxed">
                항만 크레인 1대가 멈추면 시간당 수억 원의 손실이 발생합니다.
                정비를 위한 다운타임 확보가 거의 불가능해 사후정비가 만성화됩니다.
              </p>
            </div>
            <div class="glass rounded-2xl p-6 industry-card">
              <div class="w-11 h-11 rounded-xl bg-ks-cyan/10 text-ks-cyan flex items-center justify-center mb-4">
                <i class="fa-solid fa-user-clock"></i>
              </div>
              <h3 class="font-display text-lg font-bold mb-2">숙련 정비공 부족과 노하우 단절</h3>
              <p class="text-sm text-slate-300 leading-relaxed">
                30년 경력의 숙련자들이 은퇴하고 있지만, 그들의 암묵지는 문서화되지 않은 채 사라지고 있습니다.
                신입 정비공이 같은 수준에 도달하려면 다시 10년이 필요합니다.
              </p>
            </div>
            <div class="glass rounded-2xl p-6 industry-card">
              <div class="w-11 h-11 rounded-xl bg-ks-cyan/10 text-ks-cyan flex items-center justify-center mb-4">
                <i class="fa-solid fa-lock"></i>
              </div>
              <h3 class="font-display text-lg font-bold mb-2">폐쇄망과 보안 제약</h3>
              <p class="text-sm text-slate-300 leading-relaxed">
                조선소의 도면·정비 데이터는 외부 유출이 절대 금지된 핵심 자산입니다.
                일반 클라우드 AI 서비스는 보안 정책상 도입이 불가능합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Solution Section ===== */}
      <section id="solution" class="py-24 relative overflow-hidden">
        <div
          class="absolute inset-0 pointer-events-none"
          style="background: radial-gradient(ellipse 60% 50% at 70% 30%, rgba(0,212,255,0.10), transparent 60%);"
        ></div>
        <div class="relative max-w-5xl mx-auto px-6">
          <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3">SOLUTION</div>
          <h2 class="font-display text-2xl md:text-3xl font-bold leading-tight mb-6">
            SentinAI가 조선해양 MRO를 어떻게 바꾸는가
          </h2>
          <p class="text-slate-300 text-base md:text-lg leading-loose mb-12">
            SentinAI는 단순한 정비 챗봇이 아닙니다.
            <strong class="text-white"> 보고(Vision)·듣고(Acoustic)·판단(Reasoning)</strong>하는
            멀티모달 AI 에이전트가 정비공의 손과 눈이 되어 작업 현장에서 직접 함께 일합니다.
            폐쇄망 엣지 환경에서 sLM이 실시간으로 추론하며,
            골전도 음성으로 안내해 양손은 작업에 자유롭게 둡니다.
          </p>

          <div class="glass-strong rounded-3xl p-8 md:p-10 glow-border mb-10">
            <div class="grid md:grid-cols-3 gap-6">
              <div>
                <div class="w-12 h-12 rounded-xl bg-ks-cyan/15 text-ks-cyan flex items-center justify-center mb-4">
                  <i class="fa-solid fa-eye text-xl"></i>
                </div>
                <h3 class="font-display text-base font-bold mb-2">보다 (Vision AI)</h3>
                <p class="text-sm text-slate-300 leading-relaxed">
                  스마트 글래스 카메라가 마린크레인·선박 엔진·갑판 장비를 인식합니다.
                  도면과 실물을 대조해 정비 포인트를 시각적으로 안내합니다.
                </p>
              </div>
              <div>
                <div class="w-12 h-12 rounded-xl bg-ks-cyan/15 text-ks-cyan flex items-center justify-center mb-4">
                  <i class="fa-solid fa-wave-square text-xl"></i>
                </div>
                <h3 class="font-display text-base font-bold mb-2">듣다 (Acoustic AI)</h3>
                <p class="text-sm text-slate-300 leading-relaxed">
                  베어링 마모, 캐비테이션, 유압 이상음을 음향 패턴으로 식별합니다.
                  KS인더스트리가 30년간 축적한 해상크레인 고장 음향 데이터를 학습했습니다.
                </p>
              </div>
              <div>
                <div class="w-12 h-12 rounded-xl bg-ks-cyan/15 text-ks-cyan flex items-center justify-center mb-4">
                  <i class="fa-solid fa-brain text-xl"></i>
                </div>
                <h3 class="font-display text-base font-bold mb-2">판단하다 (sLM RAG)</h3>
                <p class="text-sm text-slate-300 leading-relaxed">
                  정비 교범·과거 정비 이력·숙련자 암묵지를 RAG(Retrieval-Augmented Generation)로
                  통합 추론해 최적의 정비 절차를 제안합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 5단계 데이터 통합 */}
          <div class="reveal">
            <h3 class="font-display text-xl font-bold mb-6">현장의 모든 정보를 한 곳에서</h3>
            <p class="text-slate-300 text-base leading-loose mb-6">
              SentinAI sLM은 조선소에 흩어져 있는 다섯 가지 정보를 통합 학습합니다:
            </p>
            <div class="grid md:grid-cols-5 gap-3">
              {[
                { icon: 'fa-book', label: '정비 교범', desc: '제작사 매뉴얼·SOP' },
                { icon: 'fa-user-tie', label: '숙련자 암묵지', desc: '30년 노하우' },
                { icon: 'fa-camera', label: '사진·영상', desc: '과거 작업 기록' },
                { icon: 'fa-file-lines', label: '정비일지', desc: '이력 데이터' },
                { icon: 'fa-comments', label: '정비자 소통', desc: '실시간 커뮤니케이션' },
              ].map((item) => (
                <div class="glass rounded-xl p-4 text-center">
                  <i class={`fa-solid ${item.icon} text-ks-cyan text-2xl mb-2`}></i>
                  <div class="font-bold text-sm">{item.label}</div>
                  <div class="text-[11px] text-slate-400 mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Application Scenarios ===== */}
      <section class="py-24 section-bg">
        <div class="max-w-5xl mx-auto px-6">
          <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3">APPLICATIONS</div>
          <h2 class="font-display text-2xl md:text-3xl font-bold leading-tight mb-6">
            조선해양 현장의 적용 시나리오
          </h2>
          <p class="text-slate-300 text-base md:text-lg leading-loose mb-12">
            마린크레인 정비부터 선박 엔진룸 진단, 해양플랜트 점검까지
            조선해양 산업의 다양한 현장에서 SentinAI는 즉시 적용 가능합니다.
          </p>

          <div class="space-y-5">
            <div class="glass rounded-2xl p-6 md:p-8 glow-border">
              <div class="flex items-start gap-5">
                <div class="w-14 h-14 rounded-xl bg-ks-cyan/15 text-ks-cyan flex items-center justify-center shrink-0">
                  <i class="fa-solid fa-anchor text-2xl"></i>
                </div>
                <div class="flex-1">
                  <h3 class="font-display text-lg md:text-xl font-bold mb-2">
                    1. 해상크레인·항만 크레인 예지정비
                  </h3>
                  <p class="text-sm text-slate-300 leading-relaxed mb-3">
                    크레인 와이어로프 마모, 베어링 진동, 유압 시스템 이상을 실시간으로 모니터링합니다.
                    KS인더스트리가 글로벌 빅5 조선소에 납품해온 마린크레인의 고장 패턴 데이터를 기반으로
                    일반 AI보다 정확한 예지정비가 가능합니다. 항만 다운타임을 사전에 방지합니다.
                  </p>
                  <div class="flex flex-wrap gap-2 text-[11px]">
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">마린크레인</span>
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">항만 크레인</span>
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">와이어로프 진단</span>
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">유압 시스템</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="glass rounded-2xl p-6 md:p-8">
              <div class="flex items-start gap-5">
                <div class="w-14 h-14 rounded-xl bg-ks-cyan/15 text-ks-cyan flex items-center justify-center shrink-0">
                  <i class="fa-solid fa-ship text-2xl"></i>
                </div>
                <div class="flex-1">
                  <h3 class="font-display text-lg md:text-xl font-bold mb-2">
                    2. 선박 엔진룸 음향 진단과 정비
                  </h3>
                  <p class="text-sm text-slate-300 leading-relaxed mb-3">
                    주기관·발전기·보일러의 이상 음향을 실시간 분석합니다.
                    캐비테이션, 베어링 마모, 연료 분사 이상을 음향 패턴만으로 식별해
                    선박이 항해 중에도 사전 경보를 제공합니다.
                    엔진룸 정비공이 스마트 글래스를 쓰고 들어가면 SentinAI가 우선 점검 포인트를 안내합니다.
                  </p>
                  <div class="flex flex-wrap gap-2 text-[11px]">
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">주기관 진단</span>
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">캐비테이션 탐지</span>
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">발전기 점검</span>
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">선박 MRO</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="glass rounded-2xl p-6 md:p-8">
              <div class="flex items-start gap-5">
                <div class="w-14 h-14 rounded-xl bg-ks-cyan/15 text-ks-cyan flex items-center justify-center shrink-0">
                  <i class="fa-solid fa-industry text-2xl"></i>
                </div>
                <div class="flex-1">
                  <h3 class="font-display text-lg md:text-xl font-bold mb-2">
                    3. 조선소 야드 정비 작업 가이드
                  </h3>
                  <p class="text-sm text-slate-300 leading-relaxed mb-3">
                    조선소 야드의 의장 작업, 시운전 정비, 인도 전 점검 단계에서
                    SentinAI는 작업자에게 표준 정비 절차와 안전 체크리스트를 음성으로 안내합니다.
                    작업 결과는 양손을 자유롭게 두면서 음성으로 자동 기록되어
                    품질 승인 절차까지 디지털로 이어집니다.
                  </p>
                  <div class="flex flex-wrap gap-2 text-[11px]">
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">의장 작업</span>
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">시운전 정비</span>
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">품질 승인</span>
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">조선소 안전</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="glass rounded-2xl p-6 md:p-8">
              <div class="flex items-start gap-5">
                <div class="w-14 h-14 rounded-xl bg-ks-cyan/15 text-ks-cyan flex items-center justify-center shrink-0">
                  <i class="fa-solid fa-water text-2xl"></i>
                </div>
                <div class="flex-1">
                  <h3 class="font-display text-lg md:text-xl font-bold mb-2">
                    4. 해양플랜트·FPSO 원격 정비 지원
                  </h3>
                  <p class="text-sm text-slate-300 leading-relaxed mb-3">
                    해상에 떠 있는 FPSO·해양플랜트는 정비공 파견 비용이 막대합니다.
                    현장 작업자가 SentinAI 스마트 글래스를 착용하면
                    육상의 전문가가 같은 시야를 공유하며 정비를 원격으로 지원할 수 있습니다.
                    헬기 1회 출동 비용을 절감하는 효과만으로도 ROI가 빠르게 달성됩니다.
                  </p>
                  <div class="flex flex-wrap gap-2 text-[11px]">
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">FPSO 정비</span>
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">해양플랜트</span>
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">원격 정비</span>
                    <span class="px-2 py-0.5 rounded-full bg-ks-cyan/10 text-ks-cyan-soft">시야 공유 AR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Expected Effects ===== */}
      <section class="py-24 relative overflow-hidden">
        <div
          class="absolute inset-0 pointer-events-none"
          style="background: radial-gradient(ellipse 60% 50% at 30% 70%, rgba(59,130,246,0.10), transparent 60%);"
        ></div>
        <div class="relative max-w-5xl mx-auto px-6">
          <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3">EXPECTED OUTCOMES</div>
          <h2 class="font-display text-2xl md:text-3xl font-bold leading-tight mb-12">
            SentinAI 도입 후 기대 효과
          </h2>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div class="glass rounded-2xl p-6 text-center industry-card">
              <div class="text-4xl font-display font-bold text-gradient mb-2">-30%</div>
              <div class="text-sm text-slate-300">평균 정비 시간 단축</div>
              <p class="text-[11px] text-slate-500 mt-2 leading-snug">교범 검색·도면 확인 시간 절감</p>
            </div>
            <div class="glass rounded-2xl p-6 text-center industry-card">
              <div class="text-4xl font-display font-bold text-gradient mb-2">×3</div>
              <div class="text-sm text-slate-300">신입 숙련도 가속</div>
              <p class="text-[11px] text-slate-500 mt-2 leading-snug">실시간 코칭으로 학습 곡선 단축</p>
            </div>
            <div class="glass rounded-2xl p-6 text-center industry-card">
              <div class="text-4xl font-display font-bold text-gradient mb-2">-70%</div>
              <div class="text-sm text-slate-300">예상치 못한 다운타임</div>
              <p class="text-[11px] text-slate-500 mt-2 leading-snug">예지정비로 사전 대응</p>
            </div>
            <div class="glass rounded-2xl p-6 text-center industry-card">
              <div class="text-4xl font-display font-bold text-gradient mb-2">100%</div>
              <div class="text-sm text-slate-300">정비 이력 디지털화</div>
              <p class="text-[11px] text-slate-500 mt-2 leading-snug">음성 자동 기록으로 누락 제로</p>
            </div>
          </div>

          <div class="mt-8 text-xs text-slate-500 italic text-center">
            * 위 수치는 KS인더스트리 자체 시뮬레이션 기준의 목표 지표이며,
            현장 도입 시 환경에 따라 결과는 달라질 수 있습니다.
          </div>
        </div>
      </section>

      {/* ===== KSI Heritage ===== */}
      <section class="py-24 section-bg">
        <div class="max-w-5xl mx-auto px-6">
          <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3">KSI HERITAGE</div>
          <h2 class="font-display text-2xl md:text-3xl font-bold leading-tight mb-6">
            왜 KS인더스트리가 만드는 조선 MRO AI인가
          </h2>
          <p class="text-slate-300 text-base md:text-lg leading-loose mb-10">
            SentinAI는 AI 스타트업의 일반 솔루션이 아닙니다.
            <strong class="text-white"> 22년간 마린크레인 한 길을 걸어온 KS인더스트리</strong>가
            글로벌 빅5 조선소의 동반자로서 직접 겪은 정비 현장의 페인포인트를
            엔지니어와 정비 전문가가 함께 해결하기 위해 설계한 산업 특화 AI입니다.
          </p>

          <div class="grid md:grid-cols-3 gap-5">
            <div class="glass rounded-2xl p-6">
              <div class="text-3xl font-display font-bold text-ks-cyan mb-2">22+</div>
              <div class="font-bold text-sm mb-1">년 마린크레인 노하우</div>
              <p class="text-xs text-slate-400 leading-relaxed">
                해상·항만·조선소 크레인 설계·제작·정비 노하우 축적
              </p>
            </div>
            <div class="glass rounded-2xl p-6">
              <div class="text-3xl font-display font-bold text-ks-cyan mb-2">Big 5</div>
              <div class="font-bold text-sm mb-1">글로벌 조선소 파트너</div>
              <p class="text-xs text-slate-400 leading-relaxed">
                세계 최상위 조선소의 동반자로서 신뢰받는 공급망 파트너십
              </p>
            </div>
            <div class="glass rounded-2xl p-6">
              <div class="text-3xl font-display font-bold text-ks-cyan mb-2">2027</div>
              <div class="font-bold text-sm mb-1">상반기 1단계 출시</div>
              <p class="text-xs text-slate-400 leading-relaxed">
                국방 MRO 시작 → 조선해양 MRO 확장 로드맵 진행 중
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ Section ===== */}
      <section class="py-24">
        <div class="max-w-3xl mx-auto px-6">
          <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3 text-center">FAQ</div>
          <h2 class="font-display text-2xl md:text-3xl font-bold leading-tight mb-12 text-center">
            조선해양 MRO 도입에 자주 묻는 질문
          </h2>
          <div class="space-y-3">
            {faqs.map((faq, idx) => (
              <details class="glass rounded-2xl p-5 md:p-6 group" open={idx === 0}>
                <summary class="font-display text-base md:text-lg font-bold cursor-pointer flex items-start gap-3 list-none">
                  <span class="text-ks-cyan shrink-0 mt-0.5">
                    <i class="fa-solid fa-circle-question"></i>
                  </span>
                  <span class="flex-1">{faq.q}</span>
                  <i class="fa-solid fa-chevron-down text-xs text-slate-500 mt-2 group-open:rotate-180 transition shrink-0"></i>
                </summary>
                <div class="mt-4 pl-7 text-sm text-slate-300 leading-loose">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section class="py-20 hero-bg relative overflow-hidden">
        <div class="absolute inset-0 pointer-events-none" style="background:rgba(4,8,20,0.85);"></div>
        <div class="relative max-w-3xl mx-auto px-6 text-center">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs tracking-widest text-ks-cyan-soft mb-6">
            <span class="pulse-dot"></span>
            <span>READY TO START</span>
          </div>
          <h2 class="font-display text-2xl md:text-4xl font-bold leading-tight mb-6">
            조선소·항만·해양플랜트의<br />
            정비 혁신을 함께 만들어가실 파트너를 찾습니다
          </h2>
          <p class="text-slate-300 text-base md:text-lg leading-loose mb-10">
            시범 사업, 기술 검증(PoC), 공동 개발, 도입 상담 — 어떤 형태든 환영합니다.
            KS인더스트리 마린로보틱스연구소가 직접 응대합니다.
          </p>
          <div class="flex flex-wrap gap-3 justify-center">
            <a href="/#contact" class="btn-primary rounded-full px-8 py-3 text-sm inline-flex items-center gap-2">
              <i class="fa-solid fa-paper-plane"></i>
              <span>협력 문의하기</span>
            </a>
            <a href="/" class="btn-ghost rounded-full px-8 py-3 text-sm inline-flex items-center gap-2">
              <i class="fa-solid fa-house"></i>
              <span>메인으로 돌아가기</span>
            </a>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer class="border-t border-white/5 py-10">
        <div class="max-w-5xl mx-auto px-6 text-xs text-slate-500 text-center leading-relaxed">
          <p>
            © 2026 KS Industry Marine Robotics Lab.
            SentinAI는 KS인더스트리가 개발하는 조선해양·국방·제조 산업 통합 AI MRO 플랫폼입니다.
          </p>
          <p class="mt-2">
            <a href="/" class="hover:text-ks-cyan transition">홈</a>
            <span class="mx-2">·</span>
            <a href="/privacy" class="hover:text-ks-cyan transition">개인정보처리방침</a>
            <span class="mx-2">·</span>
            <a href="/#contact" class="hover:text-ks-cyan transition">문의하기</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
