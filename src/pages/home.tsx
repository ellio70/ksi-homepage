// Home page — Single-page composition for KS Industry Marine Robotics Lab
// All visible text uses data-i18n attributes so the client can switch languages instantly.

// CMS Layout 타입 — buildLayoutState() 반환값과 일치
export type LayoutState = {
  sections: Record<string, boolean>  // sectionId → visible?
  images: Record<string, string>     // slotId → filename (확장자 포함)
}

// 기본 layout (KV/오버라이드 없을 때의 폴백 — buildLayoutState() 디폴트와 동일해야 함)
const DEFAULT_LAYOUT: LayoutState = {
  sections: {
    industries: true, solutions: true, sentinai: true, hardware: true,
    forces: true, kpi: true, architecture: true, applications: true,
    roadmap: true, contact: true,
  },
  images: {
    hero_bg: 'hero-navy-engine.jpg',
    industries_card1: 'nvidia-jetson.jpg',
    industries_card2: 'port-tablet.jpg',
    industries_card3: 'mro-dashboard.jpg',
    hardware_main: 'sentinai-hardware.jpg',
    architecture_sovereign: 'sovereign-edge.jpg',
    architecture_core: 'core-arch.jpg',
    applications_bg: 'integrated-mro.jpg',
    applications_card1: 'engine-room-mro.jpg',
    applications_card2: 'port-tablet.jpg',
    applications_card3: 'nvidia-jetson.jpg',
    chat_avatar: 'sentinai-avatar-female.jpg',
  },
}

// 이미지 슬롯 → 실제 URL 변환 헬퍼
function imgUrl(layout: LayoutState, slotId: string): string {
  const filename = layout.images[slotId] || DEFAULT_LAYOUT.images[slotId]
  return `/static/images/${filename}`
}

// SentinAI 기본 아바타 (헤더 등 layout과 무관한 위치)
const MARIN_IMG = '/static/images/sentinai-avatar.jpg'

// 로고 SVG (직접 작성한 자산)
const LOGO_KSI_MARK = '/static/logos/ksi-mark-white.png'
const LOGO_KSI_WORDMARK = '/static/logos/ksi-wordmark-white.png'
const LOGO_MRL_WORDMARK = '/static/logos/mrl-wordmark.svg'

const DOMESTIC_CLIENTS = [
  { name: '현대중공업', sub: 'HHI' },
  { name: '현대미포', sub: 'HMD' },
  { name: '현대삼호', sub: 'HSHI' },
  { name: '한화오션', sub: 'Hanwha Ocean' },
  { name: '삼성중공업', sub: 'SHI' },
  { name: 'STX 조선', sub: 'STX' },
  { name: '성동조선', sub: 'Sungdong' },
  { name: '신안중공업', sub: 'Shinan' },
  { name: '웅진', sub: 'Woongjin' },
  { name: '흥우', sub: 'Heungwoo' },
]

const OVERSEAS_CLIENTS = [
  { name: 'EAS', sub: 'Brazil' },
  { name: 'VARD', sub: 'Brazil' },
  { name: 'New YZJ', sub: 'China' },
  { name: 'Liaoning Hongguan', sub: 'China' },
  { name: 'Wuhu Xinlian', sub: 'China' },
  { name: 'TECHNIP', sub: 'Europe' },
]

const PRODUCTS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']

export const HomePage = ({ layout = DEFAULT_LAYOUT }: { layout?: LayoutState } = {}) => {
  const L = layout
  const isVisible = (id: string) => L.sections[id] !== false
  const chatAvatar = imgUrl(L, 'chat_avatar')
  return (
    <>
      {/* ============== NAVBAR ============== */}
      <nav class="fixed top-0 inset-x-0 z-40 glass-strong">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo: KSI mark + KSI / MRL wordmark */}
          <a href="#top" class="flex items-center gap-3 group">
            <img src={LOGO_KSI_MARK} alt="KSI" class="w-9 h-9 select-none" draggable={false} />
            <div class="leading-tight border-l border-white/10 pl-3">
              <div class="font-display text-white text-[15px] font-bold tracking-tight">KS INDUSTRY</div>
              <div class="text-[10px] text-ks-cyan-soft tracking-[0.22em] uppercase">Marine Robotics Lab</div>
            </div>
          </a>

          {/* Desktop nav — 6 items */}
          <div class="hidden md:flex items-center gap-7 text-sm text-slate-300">
            <a href="#industries" class="hover:text-ks-cyan transition" data-i18n="nav.slm_mro">sLM MRO</a>
            <a href="#hardware" class="hover:text-ks-cyan transition" data-i18n="nav.edge_hw">엣지 HW</a>
            <a href="#contact" class="hover:text-ks-cyan transition" data-i18n="nav.contact">문의하기</a>
          </div>

          {/* Language switch */}
          <div class="flex items-center gap-3">
            <div class="relative" id="lang-switch">
              <button id="lang-button" class="btn-ghost rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-2">
                <i class="fa-solid fa-globe text-ks-cyan"></i>
                <span id="lang-current">KR</span>
                <i class="fa-solid fa-chevron-down text-[10px]"></i>
              </button>
              <div id="lang-menu" class="hidden absolute right-0 mt-2 w-44 glass rounded-xl py-2 text-sm">
                {/* options injected via JS */}
              </div>
            </div>
            <button id="mobile-menu-btn" class="md:hidden btn-ghost rounded-full w-9 h-9 text-sm">
              <i class="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>

        {/* Mobile menu — 6 items */}
        <div id="mobile-menu" class="hidden md:hidden border-t border-white/5">
          <div class="px-6 py-4 flex flex-col gap-3 text-sm text-slate-200">
            <a href="#industries" data-i18n="nav.slm_mro" class="py-2">sLM MRO</a>
            <a href="#hardware" data-i18n="nav.edge_hw" class="py-2">엣지 HW</a>
            <a href="#contact" data-i18n="nav.contact" class="py-2">문의하기</a>
          </div>
        </div>
      </nav>

      {/* ============== HERO ============== */}
      <header id="top" class="hero-bg relative pt-24 pb-24 md:pt-28 md:pb-28 overflow-hidden">
        {/* Background photo — Korean Navy engine room (Edge MRO in action) */}
        <div
          class="absolute inset-0 pointer-events-none"
          style={`background-image:linear-gradient(180deg,rgba(4,8,20,0.78) 0%,rgba(4,8,20,0.82) 35%,rgba(4,8,20,0.95) 100%),url(${imgUrl(L, 'hero_bg')});background-size:cover;background-position:center;`}
        ></div>
        {/* Cyan accent overlay */}
        <div class="absolute inset-0 pointer-events-none"
             style="background:radial-gradient(ellipse 60% 40% at 75% 35%,rgba(0,212,255,0.18),transparent 60%),radial-gradient(ellipse 50% 40% at 15% 80%,rgba(59,130,246,0.14),transparent 60%);"></div>

        <div class="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10 items-start">
          {/* Left: Headline */}
          <div class="lg:col-span-6 reveal">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs tracking-widest text-ks-cyan-soft mb-6">
              <span class="pulse-dot"></span>
              <span data-i18n="hero.tag">KS INDUSTRY 3.0 · MARINE ROBOTICS LAB</span>
            </div>
            <h1 class="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.4] md:leading-[1.5] tracking-tight">
              <span class="text-white" data-i18n-html="hero.title">보고 듣고 판단하는<br/>멀티모달 MRO 에이전트, <span class="text-gradient">SentinAI</span></span>
            </h1>
            <p class="mt-8 max-w-2xl text-slate-200/90 text-base md:text-lg leading-loose" data-i18n="hero.subtitle">
              엣지 sLM AI 기술과 스마트 글래스 융합으로 MRO 현장의 새로운 미래를 열어갑니다.
            </p>

            <div class="mt-10 flex flex-wrap gap-3">
              <a href="#solutions" class="btn-primary rounded-full px-6 py-3 text-sm inline-flex items-center gap-2">
                <i class="fa-solid fa-rocket"></i>
                <span data-i18n="hero.cta_primary">SentinAI 솔루션 보기</span>
              </a>
              <button id="open-chat-hero" class="btn-ghost rounded-full px-6 py-3 text-sm inline-flex items-center gap-2">
                <i class="fa-solid fa-comments"></i>
                <span data-i18n="hero.cta_secondary">SentinAI와 대화하기</span>
              </button>
            </div>

            <div class="mt-12 flex flex-wrap gap-2">
              <span class="glass rounded-full px-3 py-1.5 text-xs text-slate-200" data-i18n="hero.badge1">울산정보산업진흥원 입주 · 2026.05</span>
              <span class="glass rounded-full px-3 py-1.5 text-xs text-slate-200" data-i18n="hero.badge2">해상크레인·조선기자재 30+ 년 노하우</span>
              <span class="glass rounded-full px-3 py-1.5 text-xs text-slate-200" data-i18n="hero.badge3">sLM · 엣지 AI · 폐쇄망 인증 트랙</span>
            </div>
          </div>

          {/* Right: SentinAI Live Demo — Feature tags (left column) + Phone frame */}
          <div class="lg:col-span-6 reveal">
            <div class="flex items-center justify-center gap-3 lg:gap-4">
              {/* Left: Feature tag vertical stack (desktop only) */}
              <div class="hidden lg:flex flex-col gap-3 shrink-0">
                <div class="glass rounded-xl px-3 py-2 text-xs text-ks-cyan-soft flex items-center gap-2 shadow-lg whitespace-nowrap">
                  <i class="fa-solid fa-microphone-lines text-ks-cyan"></i> Voice + STT
                </div>
                <div class="glass rounded-xl px-3 py-2 text-xs text-ks-cyan-soft flex items-center gap-2 shadow-lg whitespace-nowrap">
                  <i class="fa-solid fa-wave-square text-ks-cyan"></i> Acoustic AI
                </div>
                <div class="glass rounded-xl px-3 py-2 text-xs text-ks-cyan-soft flex items-center gap-2 shadow-lg whitespace-nowrap">
                  <i class="fa-solid fa-shield-halved text-ks-cyan"></i> Closed-Network
                </div>
                <div class="glass rounded-xl px-3 py-2 text-xs text-ks-cyan-soft flex items-center gap-2 shadow-lg whitespace-nowrap">
                  <i class="fa-solid fa-robot text-ks-cyan"></i> Agent Workflow
                </div>
              </div>

              {/* Right: Phone frame (sized to mil-mro native 375x812 viewport) */}
              <div class="relative" style="max-width: 380px;">
                {/* Glow background */}
                <div class="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-ks-cyan/20 via-transparent to-ks-cyan/10 blur-2xl pointer-events-none"></div>
                <div class="absolute -inset-4 rounded-[3rem] compass-ring opacity-20 blur-[1px] pointer-events-none"></div>

                {/* Phone frame */}
                <div class="relative phone-frame">
                  <div class="phone-notch"></div>
                  <div class="phone-screen">
                    <iframe
                      src="https://mil-mro-2opx.onrender.com/m/"
                      title="SentinAI Live Demo"
                      loading="lazy"
                      class="phone-iframe bg-ks-deep"
                      allow="accelerometer; autoplay; camera; clipboard-write; encrypted-media; gyroscope; microphone"
                      referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                  <div class="phone-side-btn phone-btn-power"></div>
                  <div class="phone-side-btn phone-btn-vol-up"></div>
                  <div class="phone-side-btn phone-btn-vol-dn"></div>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet: horizontal scrolling feature chips (below phone) */}
            <div class="mt-5 flex flex-wrap justify-center gap-2 lg:hidden">
              <div class="glass rounded-full px-3 py-1.5 text-[11px] text-ks-cyan-soft flex items-center gap-1.5">
                <i class="fa-solid fa-microphone-lines text-ks-cyan"></i> Voice + STT
              </div>
              <div class="glass rounded-full px-3 py-1.5 text-[11px] text-ks-cyan-soft flex items-center gap-1.5">
                <i class="fa-solid fa-wave-square text-ks-cyan"></i> Acoustic AI
              </div>
              <div class="glass rounded-full px-3 py-1.5 text-[11px] text-ks-cyan-soft flex items-center gap-1.5">
                <i class="fa-solid fa-shield-halved text-ks-cyan"></i> Closed-Network
              </div>
              <div class="glass rounded-full px-3 py-1.5 text-[11px] text-ks-cyan-soft flex items-center gap-1.5">
                <i class="fa-solid fa-robot text-ks-cyan"></i> Agent Workflow
              </div>
            </div>

            <div class="mt-5 flex flex-col items-center gap-2">
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[11px] text-ks-cyan-soft">
                <span class="pulse-dot"></span>
                <span data-i18n="hero.demo_live">LIVE DEMO · SentinAI 정비병 모드</span>
              </div>
              <a href="https://mil-mro-2opx.onrender.com/m/" target="_blank" rel="noopener"
                 class="text-xs text-slate-400 hover:text-ks-cyan transition inline-flex items-center gap-1.5">
                <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                <span data-i18n="hero.demo_open">새 창에서 전체화면 체험</span>
              </a>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div class="relative mt-16 overflow-hidden border-y border-white/5 py-4 bg-white/[0.02]">
          <div class="marquee text-xs md:text-sm text-slate-400 tracking-[0.3em] uppercase whitespace-nowrap">
            <span class="flex items-center gap-3"><i class="fa-solid fa-anchor text-ks-cyan"></i> KS Industry 3.0</span>
            <span class="flex items-center gap-3"><i class="fa-solid fa-shield-halved text-ks-cyan"></i> Defense · MRO</span>
            <span class="flex items-center gap-3"><i class="fa-solid fa-ship text-ks-cyan"></i> Marine · Offshore</span>
            <span class="flex items-center gap-3"><i class="fa-solid fa-industry text-ks-cyan"></i> Smart Manufacturing</span>
            <span class="flex items-center gap-3"><i class="fa-solid fa-bolt text-ks-cyan"></i> Power · Energy</span>
            <span class="flex items-center gap-3"><i class="fa-solid fa-rocket text-ks-cyan"></i> Aerospace</span>
            <span class="flex items-center gap-3"><i class="fa-solid fa-anchor text-ks-cyan"></i> KS Industry 3.0</span>
            <span class="flex items-center gap-3"><i class="fa-solid fa-shield-halved text-ks-cyan"></i> Defense · MRO</span>
            <span class="flex items-center gap-3"><i class="fa-solid fa-ship text-ks-cyan"></i> Marine · Offshore</span>
            <span class="flex items-center gap-3"><i class="fa-solid fa-industry text-ks-cyan"></i> Smart Manufacturing</span>
            <span class="flex items-center gap-3"><i class="fa-solid fa-bolt text-ks-cyan"></i> Power · Energy</span>
            <span class="flex items-center gap-3"><i class="fa-solid fa-rocket text-ks-cyan"></i> Aerospace</span>
          </div>
        </div>
      </header>

      {/* ============== INDUSTRIES ============== */}
      {isVisible('industries') && (
      <section id="industries" class="section-bg py-28">
        <div class="max-w-7xl mx-auto px-6">
          <div class="max-w-4xl reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="industries.kicker">INDUSTRY FOCUS</div>
            <h2 class="font-display text-xl md:text-3xl font-bold leading-[1.2]" data-i18n="industries.title">
              엣지 sLM MRO 특화 솔루션으로<br/>국방·조선해양·제조·전력·우주항공까지 확장합니다
            </h2>
            <p class="mt-5 text-slate-400 text-base md:text-lg leading-relaxed" data-i18n="industries.subtitle">
              SentinAI는 보고·듣고·판단하는 멀티모달 MRO 에이전트입니다. 국방 MRO를 시작으로 3대 핵심 산업에 단계적으로 확장합니다.
            </p>
          </div>

          <div class="mt-14 grid sm:grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              { key: 'defense',     icon: 'fa-shield-halved', tag: 'PHASE 1', accent: true,  img: imgUrl(L, 'industries_card1'), href: '' },
              { key: 'marine',      icon: 'fa-ship',          tag: 'PHASE 2', accent: false, img: imgUrl(L, 'industries_card2'), href: '/marine' },
              { key: 'manufacture', icon: 'fa-industry',      tag: 'PHASE 2', accent: false, img: imgUrl(L, 'industries_card3'), href: '' },
            ].map((it) => (
              <div class={`reveal industry-card glass rounded-3xl overflow-hidden flex flex-col ${it.accent ? 'glow-border' : ''}`}>
                <div class="relative h-40 overflow-hidden">
                  <img src={it.img} alt="" class="absolute inset-0 w-full h-full object-cover" />
                  <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(4,8,20,0.30) 0%,rgba(4,8,20,0.55) 60%,rgba(4,8,20,0.95) 100%);"></div>
                  <div class="absolute top-3 left-3 flex items-center gap-2">
                    <div class={`w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur ${it.accent ? 'bg-ks-cyan/30 text-white' : 'bg-black/40 text-ks-cyan-soft'}`}>
                      <i class={`fa-solid ${it.icon} text-sm`}></i>
                    </div>
                  </div>
                  <span class="absolute top-3 right-3 text-[10px] font-bold tracking-widest px-2 py-1 rounded-full bg-black/50 text-slate-200 backdrop-blur">{it.tag}</span>
                </div>
                <div class="p-6 pt-5 flex-1 flex flex-col">
                  <div class="font-display text-xl font-bold" data-i18n={`industries.${it.key}_title`}></div>
                  <p class="mt-2 text-sm text-slate-300 leading-relaxed" data-i18n={`industries.${it.key}_desc`}></p>

                  {/* Extended feature bullets */}
                  <div class="mt-4 pt-4 border-t border-white/10 space-y-2">
                    {[1, 2, 3, 4].map((n) => (
                      <div class="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <i class="fa-solid fa-check text-ks-cyan text-[10px] mt-1 shrink-0"></i>
                        <span data-i18n={`industries.${it.key}_b${n}`}></span>
                      </div>
                    ))}
                  </div>

                  {/* Slogan */}
                  <div class="mt-4 pt-4 border-t border-white/10">
                    <div class="text-[11px] tracking-widest text-ks-cyan-soft uppercase mb-1">SLOGAN</div>
                    <p class="text-xs text-ks-cyan leading-snug italic" data-i18n={`industries.${it.key}_slogan`}></p>
                  </div>

                  {/* Industry detail link (활성화된 산업만) */}
                  {it.href && (
                    <div class="mt-5 pt-4 border-t border-white/10">
                      <a href={it.href} class="inline-flex items-center gap-2 text-sm font-semibold text-ks-cyan hover:text-white transition group">
                        <span>산업별 솔루션 자세히 보기</span>
                        <i class="fa-solid fa-arrow-right text-xs transition group-hover:translate-x-1"></i>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ============== SOLUTIONS / SentinAI ============== */}
      {isVisible('solutions') && (
      <section id="solutions" class="py-28 relative overflow-hidden">
        <div class="absolute inset-0 pointer-events-none"
             style="background: radial-gradient(ellipse 60% 50% at 80% 30%, rgba(0,212,255,0.10), transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(59,130,246,0.10), transparent 60%);"></div>

        <div class="relative max-w-7xl mx-auto px-6">
          <div class="max-w-3xl reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="solution.kicker">SENTINAI PLATFORM</div>
            <h2 class="font-display text-xl md:text-3xl font-bold leading-[1.1]" data-i18n="solution.title">
              단순 챗봇이 아닙니다. 보고·듣고·판단하는 정비 에이전트입니다.
            </h2>
            <p class="mt-5 text-slate-400 text-lg" data-i18n="solution.subtitle">
              폐쇄망 엣지에서 동작하는 멀티모달 AI가 정비 현장의 의사결정을 가속합니다.
            </p>
          </div>

          {/* One-line definition card */}
          <div class="mt-12 reveal glass-strong rounded-3xl p-8 md:p-10 glow-border">
            <div class="flex items-start gap-4">
              <i class="fa-solid fa-quote-left text-ks-cyan text-2xl shrink-0 mt-1"></i>
              <p class="text-base md:text-lg text-slate-200 leading-relaxed" data-i18n="solution.definition">
                SentinAI는 국방·조선해양·제조생산 현장에서 정비요원이 장비를 <strong class="text-white">보고</strong>, 소리를 <strong class="text-white">듣고</strong>, 데이터를 <strong class="text-white">판단</strong>해 정비절차·부품·안전·기록·품질승인까지 연결하는 <span class="text-gradient font-bold">엣지 sLM 기반 멀티모달 MRO 에이전트</span>입니다.
              </p>
            </div>
          </div>

          {/* 8 core modules grid */}
          <div class="mt-14 reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan-soft uppercase mb-6" data-i18n="solution.modules_label">CORE MODULES · 8</div>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { k: 'm1', i: 'fa-list-check' },
                { k: 'm2', i: 'fa-lock' },
                { k: 'm3', i: 'fa-layer-group' },
                { k: 'm4', i: 'fa-shield-halved' },
                { k: 'm5', i: 'fa-robot' },
                { k: 'm6', i: 'fa-heart-pulse' },
                { k: 'm7', i: 'fa-user-graduate' },
                { k: 'm8', i: 'fa-pen-to-square' },
              ].map((m) => (
                <div class="glass rounded-2xl p-5 industry-card">
                  <div class="w-11 h-11 rounded-xl bg-ks-cyan/10 text-ks-cyan flex items-center justify-center mb-3">
                    <i class={`fa-solid ${m.i}`}></i>
                  </div>
                  <div class="font-display text-base font-bold" data-i18n={`solution.${m.k}_title`}></div>
                  <p class="mt-2 text-xs text-slate-300 leading-relaxed" data-i18n={`solution.${m.k}_desc`}></p>
                </div>
              ))}
            </div>
          </div>

          {/* See / Hear / Decide trio (강조 — 빨간 하이라이트) */}
          <div class="mt-14 grid md:grid-cols-3 gap-5">
            {[
              { k: 'see',    i: 'fa-eye',                 label: 'SEE' },
              { k: 'hear',   i: 'fa-headphones-simple',   label: 'HEAR' },
              { k: 'decide', i: 'fa-brain',               label: 'DECIDE' },
            ].map((p) => (
              <div
                class="reveal rounded-3xl p-7 industry-card backdrop-blur-sm transition-all duration-300"
                style="background:linear-gradient(180deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.06) 100%); border:2px solid rgba(239,68,68,0.55); box-shadow:0 0 30px rgba(239,68,68,0.18), inset 0 1px 0 rgba(255,255,255,0.04);"
              >
                <div class="flex items-center justify-between mb-5">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                       style="background:rgba(239,68,68,0.18); color:#fca5a5;">
                    <i class={`fa-solid ${p.i}`}></i>
                  </div>
                  <div class="text-[10px] tracking-[0.3em]" style="color:#fca5a5;">{p.label}</div>
                </div>
                <div class="font-display text-lg font-bold" data-i18n={`solution.${p.k}_title`}></div>
                <p class="mt-2 text-sm text-slate-300 leading-relaxed" data-i18n={`solution.${p.k}_desc`}></p>
              </div>
            ))}
          </div>

        </div>
      </section>
      )}

      {/* ============== SENTINAI 3-PILLAR (See / Hear / Decide) ============== */}
      {isVisible('sentinai') && (
      <section id="sentinai" class="section-bg py-28 relative">
        <div class="max-w-7xl mx-auto px-6">
          <div class="max-w-3xl reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="sentinai.kicker">SENTINAI · MULTIMODAL MAINTENANCE AGENT</div>
            <h2 class="font-display text-xl md:text-3xl font-bold leading-[1.15]" data-i18n-html="sentinai.title">
              <span class="text-gradient">SentinAI</span>는<br/>파수꾼이자 동반자입니다.
            </h2>
            <p class="mt-5 text-slate-400 text-lg" data-i18n="sentinai.subtitle">
              Sentinel(파수꾼) + AI. 장비 상태를 감시하고, 정비사의 안전과 작업 효율을 극대화하는 멀티모달 정비 에이전트.
            </p>
          </div>

          <div class="mt-14 grid md:grid-cols-3 gap-6">
            {[
              { i: 'fa-eye',        k: 'pillar1' },
              { i: 'fa-headphones-simple', k: 'pillar2' },
              { i: 'fa-brain',      k: 'pillar3' },
            ].map((p) => (
              <div class="reveal glass rounded-3xl p-8 industry-card">
                <div class="w-14 h-14 rounded-2xl bg-ks-cyan/10 text-ks-cyan flex items-center justify-center mb-6 text-2xl">
                  <i class={`fa-solid ${p.i}`}></i>
                </div>
                <div class="font-display text-lg md:text-xl font-bold" data-i18n={`sentinai.${p.k}_title`}></div>
                <p class="mt-3 text-sm text-slate-300 leading-relaxed" data-i18n={`sentinai.${p.k}_desc`}></p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ============== SENTINAI EDGE HARDWARE PACKAGE ============== */}
      {isVisible('hardware') && (
      <section id="hardware" class="py-28 relative bg-gradient-to-b from-ks-navy to-ks-navy2">
        <div class="max-w-7xl mx-auto px-6">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div class="reveal">
              <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="hardware.kicker">SENTINAI EDGE HARDWARE PACKAGE</div>
              <h2 class="font-display text-xl md:text-3xl font-bold leading-[1.15]" data-i18n-html="hardware.title">
                고소음 폐쇄공간의 극한환경에서도<br/>엣지 sLM MRO 에이전트는 멈추지 않습니다.
              </h2>
              <div class="mt-8 reveal glass rounded-2xl p-6 glow-border">
                <div class="font-display text-base md:text-lg font-bold text-ks-cyan" data-i18n="hardware.bundle_title">sLM MRO 일체형 패키지</div>
                <p class="mt-2 text-sm text-slate-300 leading-relaxed" data-i18n="hardware.bundle_desc"></p>
              </div>
            </div>
            <div class="reveal">
              <div class="rounded-3xl overflow-hidden glow-border">
                <img src={imgUrl(L, 'hardware_main')} alt="SentinAI Edge Hardware Package — Smart Glasses + Throat Mic + AI HUB" class="w-full h-auto block" />
              </div>
              <div class="mt-3 text-xs text-slate-500 text-center">
                SentinAI Edge Hardware · Smart Glasses + Throat Mic + AI HUB
              </div>
            </div>
          </div>

          <div class="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { i: 'fa-glasses', k: 'c1' },
              { i: 'fa-camera',  k: 'c2' },
              { i: 'fa-microphone-lines', k: 'c3' },
              { i: 'fa-microchip', k: 'c4' },
            ].map((c) => (
              <div class="reveal glass rounded-2xl p-6 industry-card">
                <div class="w-12 h-12 rounded-xl bg-ks-cyan/10 text-ks-cyan flex items-center justify-center mb-4 text-xl">
                  <i class={`fa-solid ${c.i}`}></i>
                </div>
                <div class="font-display text-base md:text-lg font-bold" data-i18n={`hardware.${c.k}_title`}></div>
                <p class="mt-2 text-xs text-slate-300 leading-relaxed" data-i18n={`hardware.${c.k}_spec`}></p>
                <div class="mt-3 pt-3 border-t border-white/10">
                  <p class="text-xs text-ks-cyan/80 leading-relaxed" data-i18n={`hardware.${c.k}_effect`}></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ============== FORCES — Ground / Marine / Aero ============== */}
      {isVisible('forces') && (
      <section id="forces" class="section-bg py-28 relative">
        <div class="max-w-7xl mx-auto px-6">
          <div class="max-w-3xl reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="forces.kicker">PRODUCT SEGMENTATION</div>
            <h2 class="font-display text-xl md:text-3xl font-bold leading-[1.15]" data-i18n-html="forces.title">
              육·해·공군 MRO 정비 절차와 단계에 따라,<br/>SentinAI도 최적화 기능을 제공합니다.
            </h2>
            <p class="mt-5 text-slate-400 text-lg" data-i18n="forces.subtitle">
              대형 화력 장비의 육군, 폐쇄 격실의 해군, 무결점 항공정비의 공군 — 군 MRO 규정에 의한 별도의 라인업을 제공합니다.
            </p>
          </div>

          <div class="mt-14 grid md:grid-cols-3 gap-6">
            {[
              { k: 'ground', i: 'fa-tank',          accent: 'from-amber-500/20 to-amber-500/0',  badgeCol: 'text-amber-300' },
              { k: 'marine', i: 'fa-anchor',         accent: 'from-cyan-500/20 to-cyan-500/0',    badgeCol: 'text-cyan-300' },
              { k: 'aero',   i: 'fa-jet-fighter-up', accent: 'from-sky-500/20 to-sky-500/0',      badgeCol: 'text-sky-300' },
            ].map((f) => (
              <div class="reveal glass rounded-3xl p-7 industry-card relative overflow-hidden">
                <div class={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${f.accent} pointer-events-none`}></div>
                <div class="relative">
                  <div class={`text-[10px] tracking-[0.25em] font-semibold ${f.badgeCol} uppercase mb-3`} data-i18n={`forces.${f.k}_badge`}></div>
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-xl bg-white/5 text-white flex items-center justify-center">
                      <i class={`fa-solid ${f.i}`}></i>
                    </div>
                    <div class="font-display text-lg md:text-xl font-bold" data-i18n={`forces.${f.k}_title`}></div>
                  </div>
                  <p class="text-xs text-slate-400 leading-relaxed mb-5" data-i18n={`forces.${f.k}_target`}></p>
                  <ul class="space-y-3 text-sm text-slate-300">
                    <li class="flex gap-2">
                      <i class="fa-solid fa-circle-check text-ks-cyan mt-1 text-xs"></i>
                      <span data-i18n={`forces.${f.k}_f1`}></span>
                    </li>
                    <li class="flex gap-2">
                      <i class="fa-solid fa-circle-check text-ks-cyan mt-1 text-xs"></i>
                      <span data-i18n={`forces.${f.k}_f2`}></span>
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ============== KPI — Proven Performance ============== */}
      {isVisible('kpi') && (
      <section id="kpi" class="py-28 relative bg-gradient-to-b from-ks-navy2 to-ks-navy">
        <div class="max-w-7xl mx-auto px-6">
          <div class="max-w-3xl reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="kpi.kicker">PROVEN PERFORMANCE</div>
            <h2 class="font-display text-xl md:text-3xl font-bold leading-[1.15]" data-i18n-html="kpi.title">
              단순한 검색 도구가 아닙니다.<br/>국방 예산 절감 성과로 증명합니다.
            </h2>
            <p class="mt-5 text-slate-400 text-lg" data-i18n="kpi.subtitle">
              NIST AI RMF · ISO/IEC 42001 글로벌 AI 신뢰성 프레임워크 준수 하에 측정.
            </p>
          </div>

          <div class="mt-14 grid grid-cols-2 md:grid-cols-3 gap-5">
            {['m1','m2','m3','m4','m5','m6'].map((m) => (
              <div class="reveal glass rounded-2xl p-6 text-center industry-card">
                <div class="font-display text-3xl md:text-4xl font-extrabold text-gradient" data-i18n={`kpi.${m}_value`}></div>
                <div class="mt-3 text-xs text-slate-400 leading-relaxed" data-i18n={`kpi.${m}_label`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ============== ARCHITECTURE (Sovereign Edge) ============== */}
      {isVisible('architecture') && (
      <section id="architecture" class="section-bg py-28 relative">
        <div class="max-w-7xl mx-auto px-6">
          <div class="max-w-3xl reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="architecture.kicker">CORE R&amp;D ARCHITECTURE</div>
            <h2 class="font-display text-xl md:text-3xl font-bold leading-[1.1]" data-i18n="architecture.title">
              소버린 엣지 컴퓨팅 모듈
            </h2>
            <p class="mt-5 text-slate-400 text-lg" data-i18n="architecture.subtitle">
              국방 MRO를 위해 처음부터 설계된, 클라우드 연결 없이 동작하는 온디바이스 AI 허브.
            </p>
          </div>

          {/* Diagram */}
          <div class="mt-14 reveal">
            <div class="relative rounded-3xl overflow-hidden glow-border bg-white">
              <img src={imgUrl(L, 'architecture_sovereign')} alt="Sovereign Edge Computing Module for Defense MRO" class="w-full h-auto block" />
            </div>
            <p class="mt-3 text-center text-xs text-slate-500 tracking-widest uppercase">
              Sovereign Edge Computing Module · KSI-RD-001
            </p>
          </div>

          {/* 4 building blocks */}
          <div class="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { k: 'b1', i: 'fa-microchip' },
              { k: 'b2', i: 'fa-bullseye' },
              { k: 'b3', i: 'fa-shield-virus' },
              { k: 'b4', i: 'fa-magnifying-glass-chart' },
            ].map((b) => (
              <div class="reveal glass rounded-3xl p-6">
                <div class="w-11 h-11 rounded-xl bg-ks-cyan/10 text-ks-cyan flex items-center justify-center mb-4">
                  <i class={`fa-solid ${b.i}`}></i>
                </div>
                <div class="font-display text-base font-bold" data-i18n={`architecture.${b.k}_title`}></div>
                <p class="mt-2 text-xs text-slate-300 leading-relaxed" data-i18n={`architecture.${b.k}_desc`}></p>
              </div>
            ))}
          </div>

          {/* Spec strip */}
          <div class="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {['spec1', 'spec2', 'spec3', 'spec4'].map((s) => (
              <div class="glass rounded-2xl p-5 text-center">
                <div class="font-display text-2xl md:text-3xl font-bold text-gradient" data-i18n={`architecture.${s}`}></div>
                <div class="mt-2 text-xs text-slate-400 leading-snug" data-i18n={`architecture.${s}_label`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ============== APPLICATIONS (적용 산업) — Reality + Production + Clients 병합 ============== */}
      {isVisible('applications') && (
      <section id="applications" class="py-28 relative overflow-hidden">
        {/* Soft photographic backdrop */}
        <div class="absolute inset-0 opacity-20 pointer-events-none"
             style={`background-image:url(${imgUrl(L, 'applications_bg')});background-size:cover;background-position:center;`}></div>
        <div class="absolute inset-0 pointer-events-none"
             style="background:linear-gradient(180deg,rgba(4,8,20,0.92) 0%,rgba(4,8,20,0.85) 50%,rgba(4,8,20,0.96) 100%);"></div>

        <div class="relative max-w-7xl mx-auto px-6">
          {/* ── Section master header ── */}
          <div class="max-w-3xl reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="applications.kicker">APPLICATIONS</div>
            <h2 class="font-display text-xl md:text-3xl font-bold leading-[1.1]" data-i18n-html="applications.title">
              현장에서 검증된 기술,<br/>30년 제조 베이스가 뒷받침합니다.
            </h2>
            <p class="mt-5 text-slate-300/90 text-lg" data-i18n="applications.subtitle">
              가장 거친 정비 현장의 요구가 곧 우리의 설계 기준이며, 함안 본사의 제조 데이터가 SentinAI의 학습 자산입니다.
            </p>
          </div>

          {/* ── Sub A · IN THE FIELD ── */}
          <div class="mt-16">
            <div class="flex items-center gap-3 mb-6 reveal">
              <span class="w-8 h-8 rounded-full bg-ks-cyan/15 text-ks-cyan flex items-center justify-center text-xs font-bold">A</span>
              <div class="text-xs tracking-[0.3em] text-ks-cyan-soft uppercase" data-i18n="reality.kicker">WHERE AI MEETS THE FIELD</div>
              <div class="flex-1 h-px bg-white/5"></div>
            </div>
            <h3 class="font-display text-lg md:text-xl font-bold leading-tight mb-3 reveal" data-i18n-html="reality.title">
              소음 가득한 현장. 그곳에서<br/>AI는 진짜 일을 합니다.
            </h3>
            <p class="text-slate-300/80 max-w-3xl reveal" data-i18n="reality.subtitle">
              엔진룸의 진동, 항만의 분진, 야전 정비창의 고소음 — 마린로보틱스연구소의 SentinAI는 가장 거친 환경을 기준으로 설계됩니다.
            </p>

            <div class="mt-10 grid md:grid-cols-3 gap-6">
              {[
                { k: 'card1', img: imgUrl(L, 'applications_card1') },
                { k: 'card2', img: imgUrl(L, 'applications_card2') },
                { k: 'card3', img: imgUrl(L, 'applications_card3') },
              ].map((c) => (
                <div class="reveal reality-card group rounded-3xl overflow-hidden relative">
                  <img src={c.img} alt="" class="w-full h-72 object-cover transition duration-700 group-hover:scale-105" />
                  <div class="absolute inset-0" style="background:linear-gradient(180deg,transparent 25%,rgba(4,8,20,0.55) 60%,rgba(4,8,20,0.96) 100%);"></div>
                  <div class="absolute inset-x-0 bottom-0 p-6">
                    <div class="font-display text-lg font-bold text-white" data-i18n={`reality.${c.k}_title`}></div>
                    <p class="mt-2 text-xs text-slate-300 leading-relaxed" data-i18n={`reality.${c.k}_desc`}></p>
                  </div>
                  <div class="absolute top-4 right-4 w-10 h-10 rounded-full bg-ks-cyan/20 backdrop-blur border border-ks-cyan/40 flex items-center justify-center text-ks-cyan">
                    <i class="fa-solid fa-circle-dot text-xs animate-pulse"></i>
                  </div>
                </div>
              ))}
            </div>

            {/* Core R&D architecture sub-image */}
            <div class="mt-10 reveal glass-strong rounded-3xl overflow-hidden p-2">
              <div class="rounded-2xl overflow-hidden bg-white">
                <img src={imgUrl(L, 'architecture_core')} alt="Integrated Smart MRO System — Core R&D Architecture" class="w-full h-auto block" />
              </div>
            </div>
          </div>

          {/* ── Sub B · PRODUCTION & FACILITY ── */}
          <div class="mt-24">
            <div class="flex items-center gap-3 mb-6 reveal">
              <span class="w-8 h-8 rounded-full bg-ks-cyan/15 text-ks-cyan flex items-center justify-center text-xs font-bold">B</span>
              <div class="text-xs tracking-[0.3em] text-ks-cyan-soft uppercase" data-i18n="production.kicker">PRODUCTION &amp; FACILITY</div>
              <div class="flex-1 h-px bg-white/5"></div>
            </div>
            <h3 class="font-display text-lg md:text-xl font-bold leading-tight mb-3 reveal" data-i18n-html="production.title">
              연간 720기, 시장점유 ~99%의<br/>마린크레인 제조 베이스
            </h3>
            <p class="text-slate-300/80 max-w-3xl reveal" data-i18n="production.subtitle">
              KS인더스트리는 경남 함안 본사 8,980평 부지·3,634평 건물에서 마린크레인을 생산합니다.
            </p>

            {/* Facility stats */}
            <div class="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 reveal">
              {['stat1', 'stat2', 'stat3', 'stat4'].map((s) => (
                <div class="glass rounded-2xl p-6 text-center">
                  <div class="font-display text-3xl md:text-4xl font-bold text-gradient" data-i18n={`production.${s}`}></div>
                  <div class="mt-2 text-xs text-slate-400 leading-snug" data-i18n={`production.${s}_label`}></div>
                </div>
              ))}
            </div>

            {/* Product lineup */}
            <div class="mt-12 reveal">
              <div class="flex items-center gap-3 mb-5">
                <i class="fa-solid fa-table-list text-ks-cyan"></i>
                <h4 class="font-display text-xl font-bold" data-i18n="production.lineup">마린크레인 제품 라인업</h4>
              </div>

              {/* Desktop table */}
              <div class="hidden md:block glass-strong rounded-3xl overflow-hidden">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-white/5 text-left text-xs uppercase tracking-[0.18em] text-ks-cyan-soft">
                      <th class="py-4 px-6" data-i18n="production.col_product">제품</th>
                      <th class="py-4 px-6" data-i18n="production.col_use">용도</th>
                      <th class="py-4 px-6 text-right" data-i18n="production.col_capacity">월 공급 능력</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRODUCTS.map((p, i) => (
                      <tr class={`border-t border-white/5 ${i % 2 === 1 ? 'bg-white/[0.015]' : ''}`}>
                        <td class="py-4 px-6 font-display font-semibold text-white" data-i18n={`production.${p}_name`}></td>
                        <td class="py-4 px-6 text-slate-300" data-i18n={`production.${p}_use`}></td>
                        <td class="py-4 px-6 text-right">
                          <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ks-cyan/10 text-ks-cyan text-xs font-semibold" data-i18n={`production.${p}_cap`}></span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div class="md:hidden space-y-3">
                {PRODUCTS.map((p) => (
                  <div class="glass rounded-2xl p-4">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex-1">
                        <div class="font-display font-semibold text-white text-sm" data-i18n={`production.${p}_name`}></div>
                        <div class="text-xs text-slate-400 mt-1" data-i18n={`production.${p}_use`}></div>
                      </div>
                      <span class="shrink-0 px-2 py-1 rounded-full bg-ks-cyan/10 text-ks-cyan text-[11px] font-semibold" data-i18n={`production.${p}_cap`}></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div class="mt-10 reveal glass-strong rounded-3xl p-8">
              <div class="flex flex-col md:flex-row md:items-center gap-6">
                <div class="md:w-1/3">
                  <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-2" data-i18n="certs.kicker">CERTIFICATIONS</div>
                  <div class="font-display text-xl font-bold" data-i18n="certs.title">국제 인증으로 입증된 품질</div>
                </div>
                <div class="md:w-2/3">
                  <div class="flex flex-wrap gap-2">
                    {['LRQA ISO 9001', 'OHSAS 18001', 'DNV MED', 'API 2C + Q1', 'LRQA ISO 14001', 'API Offshore'].map((c) => (
                      <span class="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-slate-200">
                        <i class="fa-solid fa-circle-check text-ks-cyan text-[11px]"></i>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sub C · CLIENTS ── */}
          <div class="mt-24">
            <div class="flex items-center gap-3 mb-6 reveal">
              <span class="w-8 h-8 rounded-full bg-ks-cyan/15 text-ks-cyan flex items-center justify-center text-xs font-bold">C</span>
              <div class="text-xs tracking-[0.3em] text-ks-cyan-soft uppercase" data-i18n="clients.kicker">OUR CLIENTS</div>
              <div class="flex-1 h-px bg-white/5"></div>
            </div>
            <h3 class="font-display text-lg md:text-xl font-bold leading-tight mb-3 reveal" data-i18n-html="clients.title">
              국내 메이저 조선소와<br/>글로벌 해양 플레이어
            </h3>
            <p class="text-slate-300/80 max-w-3xl reveal" data-i18n="clients.subtitle">
              대한민국 5대 조선소 전부, 그리고 브라질·중국·유럽의 주요 해양 기업이 KS인더스트리의 크레인을 선택했습니다.
            </p>

            {/* Domestic */}
            <div class="mt-10 reveal">
              <div class="flex items-center gap-3 mb-5">
                <i class="fa-solid fa-flag text-ks-cyan"></i>
                <h4 class="font-display text-sm tracking-[0.18em] uppercase text-slate-200" data-i18n="clients.domestic_label">국내</h4>
                <div class="flex-1 h-px bg-white/5"></div>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {DOMESTIC_CLIENTS.map((c) => (
                  <div class="client-chip glass rounded-2xl px-4 py-3 text-center">
                    <div class="font-display font-bold text-sm text-white">{c.name}</div>
                    <div class="text-[10px] tracking-widest text-ks-cyan-soft uppercase mt-0.5">{c.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overseas */}
            <div class="mt-8 reveal">
              <div class="flex items-center gap-3 mb-5">
                <i class="fa-solid fa-globe text-ks-cyan"></i>
                <h4 class="font-display text-sm tracking-[0.18em] uppercase text-slate-200" data-i18n="clients.overseas_label">해외</h4>
                <div class="flex-1 h-px bg-white/5"></div>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {OVERSEAS_CLIENTS.map((c) => (
                  <div class="client-chip glass rounded-2xl px-4 py-3 text-center">
                    <div class="font-display font-bold text-sm text-white">{c.name}</div>
                    <div class="text-[10px] tracking-widest text-ks-cyan-soft uppercase mt-0.5">{c.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ============== ROADMAP ============== */}
      {isVisible('roadmap') && (
      <section id="roadmap" class="section-bg py-28">
        <div class="max-w-7xl mx-auto px-6">
          <div class="max-w-3xl reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="roadmap.kicker">ROADMAP</div>
            <h2 class="font-display text-xl md:text-3xl font-bold leading-[1.1]" data-i18n="roadmap.title">
              4단계 실행 로드맵
            </h2>
            <p class="mt-5 text-slate-400 text-lg" data-i18n="roadmap.subtitle">
              데모에서 인증까지, 24개월 내 글로벌 진출 가능 단계 도달.
            </p>
          </div>

          <div class="mt-14 relative">
            <div class="hidden md:block absolute left-1/2 top-0 bottom-0 w-px timeline-line -translate-x-1/2"></div>
            <div class="grid md:grid-cols-2 gap-8">
              {[
                { k: 's1', i: 'fa-flask', side: 'left' },
                { k: 's2', i: 'fa-database', side: 'right' },
                { k: 's3', i: 'fa-chart-line', side: 'left' },
                { k: 's4', i: 'fa-globe', side: 'right' },
              ].map((p, idx) => (
                <div class={`reveal ${p.side === 'right' ? 'md:col-start-2' : 'md:col-start-1'}`}>
                  <div class="glass rounded-3xl p-7 relative">
                    <div class="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-ks-cyan text-ks-deep flex items-center justify-center font-bold shadow-lg shadow-ks-cyan/40">
                      {idx + 1}
                    </div>
                    <div class="flex items-center gap-3 mb-3">
                      <i class={`fa-solid ${p.i} text-ks-cyan`}></i>
                      <div class="text-xs tracking-widest text-ks-cyan-soft uppercase" data-i18n={`roadmap.${p.k}_period`}></div>
                    </div>
                    <div class="font-display text-xl font-bold" data-i18n={`roadmap.${p.k}_title`}></div>
                    <p class="mt-2 text-sm text-slate-300 leading-relaxed" data-i18n={`roadmap.${p.k}_desc`}></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ============== CONTACT ============== */}
      {isVisible('contact') && (
      <section id="contact" class="py-28 relative">
        <div class="absolute inset-0 pointer-events-none"
             style="background: radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,212,255,0.08), transparent 60%);"></div>
        <div class="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-10 items-start">
          <div class="lg:col-span-5 reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="contact.kicker">LET'S TALK</div>
            <h2 class="font-display text-xl md:text-3xl font-bold leading-[1.1]" data-i18n="contact.title">
              함께 만들어 갈 미래를 환영합니다
            </h2>
            <p class="mt-5 text-slate-400 text-lg" data-i18n="contact.subtitle">
              AI 에이전트 SentinAI가 24시간 응답합니다. 신사업 미팅·기술 자문·도입 문의를 남겨주세요.
            </p>

            <div class="mt-8 space-y-4 text-sm text-slate-300">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-ks-cyan/10 text-ks-cyan flex items-center justify-center">
                  <i class="fa-solid fa-comments"></i>
                </div>
                <button id="open-chat-contact" class="hover:text-ks-cyan transition" data-i18n="hero.cta_secondary">
                  SentinAI와 대화하기
                </button>
              </div>
            </div>
          </div>

          <form id="contact-form" class="lg:col-span-7 reveal glass-strong rounded-3xl p-8 space-y-4">
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-slate-400 mb-2" data-i18n="contact.form_name">성함 *</label>
                <input name="name" required class="w-full bg-white/5 border border-white/10 focus:border-ks-cyan focus:bg-white/10 outline-none rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label class="block text-xs text-slate-400 mb-2" data-i18n="contact.form_company">소속 / 회사</label>
                <input name="company" class="w-full bg-white/5 border border-white/10 focus:border-ks-cyan focus:bg-white/10 outline-none rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-slate-400 mb-2" data-i18n="contact.form_email">이메일 *</label>
                <input type="email" name="email" required class="w-full bg-white/5 border border-white/10 focus:border-ks-cyan focus:bg-white/10 outline-none rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label class="block text-xs text-slate-400 mb-2" data-i18n="contact.form_phone">휴대폰 *</label>
                <input type="tel" name="phone" required placeholder="010-1234-5678" class="w-full bg-white/5 border border-white/10 focus:border-ks-cyan focus:bg-white/10 outline-none rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-2" data-i18n="contact.form_topic">관심 분야</label>
              <select name="topic" class="w-full bg-white/5 border border-white/10 focus:border-ks-cyan outline-none rounded-xl px-4 py-3 text-sm">
                <option value="defense" class="bg-ks-navy">Defense MRO</option>
                <option value="marine" class="bg-ks-navy">Marine &amp; Offshore</option>
                <option value="manufacture" class="bg-ks-navy">Manufacturing</option>
                <option value="power" class="bg-ks-navy">Power &amp; Energy</option>
                <option value="aerospace" class="bg-ks-navy">Aerospace</option>
                <option value="partner" class="bg-ks-navy">Partnership / Investment</option>
                <option value="other" class="bg-ks-navy">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-2" data-i18n="contact.form_message">문의 내용 *</label>
              <textarea name="message" rows={4} required class="w-full bg-white/5 border border-white/10 focus:border-ks-cyan focus:bg-white/10 outline-none rounded-xl px-4 py-3 text-sm resize-none"></textarea>
            </div>

            {/* 동의 체크박스 */}
            <div class="space-y-2 pt-2 border-t border-white/5">
              <label class="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input type="checkbox" name="privacy_consent" required class="mt-0.5 accent-cyan-400" />
                <span>
                  <span class="text-rose-400">*</span>{' '}
                  <span data-i18n="contact.consent_privacy">개인정보 수집·이용에 동의합니다</span>
                  {' '}(<a href="/privacy" target="_blank" class="underline text-slate-400 hover:text-ks-cyan" data-i18n="contact.consent_privacy_link">자세히 보기</a>)
                </span>
              </label>
              <label class="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input type="checkbox" name="marketing_opt_in" class="mt-0.5 accent-cyan-400" />
                <span data-i18n="contact.consent_marketing">마케팅 정보 수신에 동의합니다 (선택)</span>
              </label>
            </div>

            <button type="submit" class="btn-primary rounded-full px-6 py-3 text-sm w-full inline-flex items-center justify-center gap-2">
              <i class="fa-solid fa-paper-plane"></i>
              <span data-i18n="contact.form_submit">문의 보내기</span>
            </button>
            <div id="contact-status" class="text-sm text-center hidden"></div>
          </form>
        </div>
      </section>
      )}

      {/* ============== FOOTER ============== */}
      <footer class="border-t border-white/5 py-12">
        <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-8 items-start">
          <div class="md:col-span-5 flex flex-col items-center md:items-start">
            <div class="flex flex-col items-center">
              <img src={LOGO_KSI_WORDMARK} alt="KS Industry" class="h-20 -mb-1 block select-none" draggable={false} />
              <img src={LOGO_MRL_WORDMARK} alt="Marine Robotics Lab" class="h-9 mb-4 block select-none" draggable={false} />
            </div>
            <p class="text-sm text-slate-400 max-w-md text-center md:text-left" data-i18n="footer.tagline">
              보고 듣고 판단하는, 지능형 엣지 MRO 플랫폼
            </p>
          </div>
          <div class="md:col-span-3 text-xs text-slate-400">
            <div class="font-display font-bold text-white text-sm mb-3 tracking-wider uppercase">KS Industry</div>
            <div class="space-y-1.5">
              <div><span class="text-slate-500">HQ</span> · 경남 함안군 군북면 석교천길 223</div>
              <div><span class="text-slate-500">LAB</span> · 울산정보산업진흥원 조선해양 하이테크타운 506</div>
              <div><span class="text-slate-500">E-Mail</span> · hschung@ssii.co.kr</div>
            </div>
          </div>
          <div class="md:col-span-4 text-xs text-slate-400">
            <div class="font-display font-bold text-white text-sm mb-3 tracking-wider uppercase">Quick Links</div>
            <div class="grid grid-cols-2 gap-1.5">
              <a href="#industries" class="hover:text-ks-cyan" data-i18n="nav.slm_mro">sLM MRO</a>
              <a href="#hardware" class="hover:text-ks-cyan" data-i18n="nav.edge_hw">엣지 HW</a>
              <a href="#contact" class="hover:text-ks-cyan" data-i18n="nav.contact">문의하기</a>
            </div>
          </div>
        </div>
        <div class="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-white/5 text-xs text-slate-500 flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <span data-i18n="footer.copy">© 2026 KS Industry · Marine Robotics Lab. All rights reserved.</span>
          <span class="tracking-widest">KS 3.0 · SentinAI</span>
        </div>
      </footer>

      {/* ============== CHAT WIDGET ============== */}
      <button id="chat-launcher"
              class="chat-launcher fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center transition transform">
        <div class="relative">
          <img id="chat-launcher-avatar" src={chatAvatar} alt="SentinAI" class="w-12 h-12 rounded-full object-cover border-2 border-white/70" />
          <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-ks-deep"></span>
        </div>
      </button>

      <div id="chat-panel"
           class="chat-panel chat-panel-mobile hidden fixed bottom-20 right-6 z-50 w-[380px] h-[640px] max-h-[calc(100dvh-6rem)] rounded-3xl overflow-hidden flex flex-col">
        <div class="px-5 py-3 flex items-center gap-3 border-b border-white/5">
          <div class="relative">
            <img id="chat-header-avatar" src={chatAvatar} alt="SentinAI" class="w-10 h-10 rounded-full object-cover border border-ks-cyan/40" />
            <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-ks-deep"></span>
          </div>
          <div class="flex-1">
            <div class="font-display font-bold text-sm flex items-center gap-2">
              <span data-i18n="chat.title">SentinAI · MRO 전문가</span>
            </div>
            <div class="text-[11px] text-slate-400" data-i18n="chat.subtitle">마린로보틱스연구소 통합지식 에이전트</div>
          </div>
          {/* Voice ON/OFF toggle */}
          <button id="chat-voice-toggle"
                  title="음성 답변 ON/OFF"
                  class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-ks-cyan transition"
                  data-voice-enabled="true">
            <i class="fa-solid fa-volume-high text-sm"></i>
          </button>
          <button id="chat-close" class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Hero avatar block — big portrait + gender toggle */}
        <div class="px-5 pt-4 pb-3 border-b border-white/5 bg-gradient-to-b from-ks-cyan/5 to-transparent">
          <div class="relative mx-auto w-24 h-24">
            <div class="absolute -inset-1.5 rounded-full compass-ring opacity-40 blur-[1px]"></div>
            <div class="absolute -inset-0.5 rounded-full border border-ks-cyan/40"></div>
            <img id="chat-hero-avatar"
                 src={chatAvatar}
                 alt="SentinAI MRO Expert"
                 class="relative w-24 h-24 rounded-full object-cover" />
            <span class="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-ks-deep"></span>
          </div>
          <div class="mt-2 text-center">
            <div class="text-[11px] tracking-widest text-ks-cyan uppercase" data-i18n="chat.persona_role">MRO 통합지식 전문가</div>
            <div class="text-[10px] text-slate-500 mt-0.5" data-i18n="chat.persona_hint">사업 로드맵 · 보유 기술 · SentinAI 사용법 안내</div>
          </div>
          {/* Gender toggle */}
          <div class="mt-3 flex justify-center">
            <div class="inline-flex p-0.5 rounded-full bg-white/5 border border-white/10">
              <button id="avatar-toggle-female" data-gender="female"
                      class="avatar-toggle avatar-toggle-active px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition">
                <i class="fa-solid fa-venus"></i>
                <span data-i18n="chat.avatar_female">여성</span>
              </button>
              <button id="avatar-toggle-male" data-gender="male"
                      class="avatar-toggle px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition">
                <i class="fa-solid fa-mars"></i>
                <span data-i18n="chat.avatar_male">남성</span>
              </button>
            </div>
          </div>
        </div>

        <div id="chat-messages" class="chat-scroll flex-1 overflow-y-auto px-4 py-4 space-y-3"></div>

        <form id="chat-form" class="px-4 pb-4 pt-2 border-t border-white/5">
          <div class="flex items-center gap-2 bg-white/5 border border-white/10 focus-within:border-ks-cyan rounded-2xl px-3 py-2">
            <input
              id="chat-input"
              type="text"
              autocomplete="off"
              class="flex-1 bg-transparent outline-none text-sm py-1.5"
              data-i18n-placeholder="chat.placeholder"
              placeholder="무엇이든 물어보세요."
            />
            {/* Microphone button — Web Speech API STT */}
            <button id="chat-mic"
                    type="button"
                    title="마이크로 질문하기"
                    class="w-8 h-8 rounded-full bg-white/10 hover:bg-ks-cyan/30 flex items-center justify-center text-slate-300 hover:text-ks-cyan transition">
              <i class="fa-solid fa-microphone text-xs"></i>
            </button>
            <button type="submit" class="w-8 h-8 rounded-full btn-primary flex items-center justify-center">
              <i class="fa-solid fa-arrow-up text-xs"></i>
            </button>
          </div>
          <div id="chat-mic-status" class="hidden mt-1.5 text-[10px] text-ks-cyan text-center">
            <i class="fa-solid fa-circle text-rose-400 animate-pulse mr-1"></i>
            <span>듣고 있어요…</span>
          </div>
          <div class="mt-2 text-[10px] text-slate-500 text-center" data-i18n="chat.disclaimer">
            AI가 생성한 응답이며, 정식 미팅·계약은 별도 절차로 진행됩니다.
          </div>
        </form>
      </div>

      <script src="/static/app.js"></script>
    </>
  )
}
