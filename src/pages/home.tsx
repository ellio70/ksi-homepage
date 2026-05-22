// Home page — Single-page composition for KS Industry Marine Robotics Lab
// All visible text uses data-i18n attributes so the client can switch languages instantly.

// MARIN 아바타
const MARIN_IMG = 'https://www.genspark.ai/api/files/s/1i0MaFN2'

// 현장 사진 (첨부 이미지)
const IMG_ENGINE_ROOM = 'https://www.genspark.ai/api/files/s/3LkK6GSY' // 해군 엔진룸 정비 + AI 글래스
const IMG_PORT_NOISE = 'https://www.genspark.ai/api/files/s/TnaVU0EF'  // 부산항 항만 고소음 + 청력 보호
const IMG_PORT_TABLET = 'https://www.genspark.ai/api/files/s/3iTr73Po' // 부산항 인부 + 태블릿 점검
const IMG_MRO_DASH = 'https://www.genspark.ai/api/files/s/T3gyKVai'    // MRO AI 대시보드 태블릿
const IMG_SMART_MRO_UI = 'https://www.genspark.ai/api/files/s/qKwQb27B' // Smart MRO Platform UI
const IMG_SOVEREIGN = 'https://www.genspark.ai/api/files/s/yQbXx2CP'   // 소버린 엣지 컴퓨팅 모듈 도식
const IMG_CORE_ARCH = 'https://www.genspark.ai/api/files/s/xI8ER7ri'   // 코어 R&D 아키텍처 + KSI-RD-001
const IMG_INTEGRATED = 'https://www.genspark.ai/api/files/s/LkQpann1'  // 통합 스마트 MRO 시스템 일러스트
const IMG_NVIDIA_JETSON = 'https://www.genspark.ai/api/files/s/qMaswCfe' // 군인 + 엣지 태블릿 (제조라인)
const IMG_KOREAN_NAVY = 'https://www.genspark.ai/api/files/s/to22pXV4' // 한국 해군 + 스마트글라스 엔진

// 로고 SVG (직접 작성한 자산)
const LOGO_KSI_MARK = '/static/logos/ksi-mark.svg'
const LOGO_KSI_WORDMARK = '/static/logos/ksi-wordmark.svg'
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

export const HomePage = () => {
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

          {/* Desktop nav */}
          <div class="hidden lg:flex items-center gap-6 text-[13px] text-slate-300">
            <a href="#about" class="hover:text-ks-cyan transition" data-i18n="nav.about">연구소 소개</a>
            <a href="#vision" class="hover:text-ks-cyan transition" data-i18n="nav.vision">KS 3.0 비전</a>
            <a href="#industries" class="hover:text-ks-cyan transition" data-i18n="nav.industries">사업 분야</a>
            <a href="#solutions" class="hover:text-ks-cyan transition" data-i18n="nav.solutions">솔루션</a>
            <a href="#reality" class="hover:text-ks-cyan transition" data-i18n="nav.reality">현장</a>
            <a href="#production" class="hover:text-ks-cyan transition" data-i18n="nav.production">생산·시설</a>
            <a href="#clients" class="hover:text-ks-cyan transition" data-i18n="nav.clients">거래처</a>
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
            <button id="mobile-menu-btn" class="lg:hidden btn-ghost rounded-full w-9 h-9 text-sm">
              <i class="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div id="mobile-menu" class="hidden lg:hidden border-t border-white/5">
          <div class="px-6 py-4 flex flex-col gap-3 text-sm text-slate-200">
            <a href="#about" data-i18n="nav.about" class="py-2">연구소 소개</a>
            <a href="#vision" data-i18n="nav.vision" class="py-2">KS 3.0 비전</a>
            <a href="#industries" data-i18n="nav.industries" class="py-2">사업 분야</a>
            <a href="#solutions" data-i18n="nav.solutions" class="py-2">솔루션</a>
            <a href="#reality" data-i18n="nav.reality" class="py-2">현장</a>
            <a href="#production" data-i18n="nav.production" class="py-2">생산·시설</a>
            <a href="#clients" data-i18n="nav.clients" class="py-2">거래처</a>
            <a href="#contact" data-i18n="nav.contact" class="py-2">문의하기</a>
          </div>
        </div>
      </nav>

      {/* ============== HERO ============== */}
      <header id="top" class="hero-bg relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background photo — Korean Navy engine room (Edge MRO in action) */}
        <div
          class="absolute inset-0 pointer-events-none"
          style={`background-image:linear-gradient(180deg,rgba(4,8,20,0.78) 0%,rgba(4,8,20,0.82) 35%,rgba(4,8,20,0.95) 100%),url(${IMG_KOREAN_NAVY});background-size:cover;background-position:center;`}
        ></div>
        {/* Cyan accent overlay */}
        <div class="absolute inset-0 pointer-events-none"
             style="background:radial-gradient(ellipse 60% 40% at 75% 35%,rgba(0,212,255,0.18),transparent 60%),radial-gradient(ellipse 50% 40% at 15% 80%,rgba(59,130,246,0.14),transparent 60%);"></div>

        <div class="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          {/* Left: Headline */}
          <div class="lg:col-span-7 reveal">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs tracking-widest text-ks-cyan-soft mb-6">
              <span class="pulse-dot"></span>
              <span data-i18n="hero.tag">KS INDUSTRY 3.0 · MARINE ROBOTICS LAB</span>
            </div>
            <h1 class="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              <span class="text-white" data-i18n-html="hero.title">보고 듣고 판단하는,<br/>지능형 엣지 MRO 플랫폼</span>
            </h1>
            <p class="mt-6 max-w-2xl text-slate-200/90 text-base md:text-lg leading-relaxed" data-i18n="hero.subtitle">
              조선해양에서 출발해 국방·우주항공·전력으로 — 폐쇄망 멀티모달 정비 에이전트로 산업의 정비 표준을 바꿉니다.
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <a href="#solutions" class="btn-primary rounded-full px-6 py-3 text-sm inline-flex items-center gap-2">
                <i class="fa-solid fa-rocket"></i>
                <span data-i18n="hero.cta_primary">AX MRO 솔루션 보기</span>
              </a>
              <button id="open-chat-hero" class="btn-ghost rounded-full px-6 py-3 text-sm inline-flex items-center gap-2">
                <i class="fa-solid fa-comments"></i>
                <span data-i18n="hero.cta_secondary">MARIN과 대화하기</span>
              </button>
            </div>

            <div class="mt-10 flex flex-wrap gap-2">
              <span class="glass rounded-full px-3 py-1.5 text-xs text-slate-200" data-i18n="hero.badge1">울산정보산업진흥원 입주 · 2026.05</span>
              <span class="glass rounded-full px-3 py-1.5 text-xs text-slate-200" data-i18n="hero.badge2">해상크레인·조선기자재 30+ 년 노하우</span>
              <span class="glass rounded-full px-3 py-1.5 text-xs text-slate-200" data-i18n="hero.badge3">sLM · 엣지 AI · 폐쇄망 인증 트랙</span>
            </div>
          </div>

          {/* Right: MARIN avatar showcase */}
          <div class="lg:col-span-5 reveal">
            <div class="relative aspect-square max-w-md mx-auto">
              <div class="absolute -inset-6 rounded-full compass-ring opacity-30 blur-[1px]"></div>
              <div class="absolute -inset-2 rounded-full border border-ks-cyan/30"></div>
              <div class="absolute inset-0 rounded-full glass-strong overflow-hidden">
                <img src={MARIN_IMG} alt="MARIN — AI Agent" class="w-full h-full object-cover" />
              </div>
              <div class="absolute -left-6 top-10 glass rounded-xl px-3 py-2 text-xs text-ks-cyan-soft hidden md:flex items-center gap-2">
                <i class="fa-solid fa-microphone-lines"></i> Voice + STT
              </div>
              <div class="absolute -right-4 top-1/3 glass rounded-xl px-3 py-2 text-xs text-ks-cyan-soft hidden md:flex items-center gap-2">
                <i class="fa-solid fa-wave-square"></i> Acoustic AI
              </div>
              <div class="absolute -left-2 bottom-10 glass rounded-xl px-3 py-2 text-xs text-ks-cyan-soft hidden md:flex items-center gap-2">
                <i class="fa-solid fa-shield-halved"></i> Closed-Network
              </div>
              <div class="absolute -right-6 bottom-6 glass rounded-xl px-3 py-2 text-xs text-ks-cyan-soft hidden md:flex items-center gap-2">
                <i class="fa-solid fa-robot"></i> Agent Workflow
              </div>
            </div>
            <p class="text-center text-xs text-slate-400 mt-4 tracking-widest uppercase">
              MARIN · Multimodal Maintenance Agent
            </p>
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

      {/* ============== ABOUT ============== */}
      <section id="about" class="section-bg py-28">
        <div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-start">
          <div class="lg:col-span-5 reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="about.kicker">ABOUT US</div>
            <h2 class="font-display text-3xl md:text-5xl font-bold leading-[1.1]" data-i18n="about.title">
              조선해양의 강자, 마린로보틱스로 진화하다
            </h2>
            {/* Marine Robotics Lab text-only logo card */}
            <div class="mt-8 glass-strong rounded-2xl p-5 inline-flex items-center gap-4">
              <img src={LOGO_MRL_WORDMARK} alt="Marine Robotics Lab" class="h-12 select-none" draggable={false} />
            </div>
          </div>
          <div class="lg:col-span-7 reveal">
            <p class="text-slate-300 text-lg leading-relaxed" data-i18n-html="about.body">
              KS인더스트리는 해상크레인과 조선기자재 분야에서 수십 년간 축적한 현장 경험을 바탕으로, 2026년 5월 울산정보산업진흥원에 <strong>마린로보틱스연구소</strong>를 입주시켰습니다.
            </p>

            <div class="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { v: 'about.stat1_value', l: 'about.stat1_label' },
                { v: 'about.stat2_value', l: 'about.stat2_label' },
                { v: 'about.stat3_value', l: 'about.stat3_label' },
                { v: 'about.stat4_value', l: 'about.stat4_label' },
              ].map((s) => (
                <div class="glass rounded-2xl p-5 text-center">
                  <div class="font-display text-3xl md:text-4xl font-bold text-gradient" data-i18n={s.v}></div>
                  <div class="mt-2 text-xs text-slate-400 leading-snug" data-i18n={s.l}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============== KS 3.0 VISION ============== */}
      <section id="vision" class="py-28 relative">
        <div class="absolute inset-0 opacity-60 pointer-events-none"
             style="background: radial-gradient(circle at 50% 0%, rgba(0,212,255,0.10), transparent 60%);"></div>
        <div class="relative max-w-7xl mx-auto px-6">
          <div class="text-center max-w-3xl mx-auto reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="vision.kicker">KS INDUSTRY 3.0</div>
            <h2 class="font-display text-3xl md:text-5xl font-bold leading-[1.1]" data-i18n="vision.title">
              하드웨어에서, 지능형 산업 OS로
            </h2>
            <p class="mt-5 text-slate-400 text-lg" data-i18n="vision.subtitle">제조 → 디지털 → 지능형. 세 번째 도약을 시작합니다.</p>
          </div>

          <div class="mt-16 grid md:grid-cols-3 gap-6">
            {[
              { key: 'phase1', icon: 'fa-screwdriver-wrench', dim: true },
              { key: 'phase2', icon: 'fa-network-wired', dim: true },
              { key: 'phase3', icon: 'fa-brain', dim: false },
            ].map((p) => (
              <div class={`reveal glass rounded-3xl p-8 relative ${p.dim ? 'opacity-90' : 'glow-border'}`}>
                <div class={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${p.dim ? 'bg-white/5 text-slate-300' : 'bg-ks-cyan/15 text-ks-cyan'}`}>
                  <i class={`fa-solid ${p.icon} text-xl`}></i>
                </div>
                <div class="text-xs tracking-widest text-ks-cyan-soft uppercase" data-i18n={`vision.${p.key}_period`}></div>
                <div class="mt-1 font-display text-2xl font-bold" data-i18n={`vision.${p.key}_title`}></div>
                <p class="mt-3 text-slate-300 leading-relaxed text-sm" data-i18n={`vision.${p.key}_desc`}></p>
                {!p.dim && (
                  <div class="absolute top-6 right-6 text-[10px] font-bold tracking-widest px-2 py-1 rounded-full bg-ks-cyan/10 text-ks-cyan">
                    NOW
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== INDUSTRIES ============== */}
      <section id="industries" class="section-bg py-28">
        <div class="max-w-7xl mx-auto px-6">
          <div class="max-w-3xl reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="industries.kicker">INDUSTRY FOCUS</div>
            <h2 class="font-display text-3xl md:text-5xl font-bold leading-[1.1]" data-i18n="industries.title">
              다섯 개 산업, 하나의 플랫폼
            </h2>
            <p class="mt-5 text-slate-400 text-lg" data-i18n="industries.subtitle">국방 MRO를 시작으로 조선해양·제조·전력·우주항공까지 확장합니다.</p>
          </div>

          <div class="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { key: 'defense', icon: 'fa-shield-halved', tag: 'PHASE 1', accent: true, img: IMG_NVIDIA_JETSON },
              { key: 'marine', icon: 'fa-ship', tag: 'PHASE 2', img: IMG_PORT_TABLET },
              { key: 'manufacture', icon: 'fa-industry', tag: 'PHASE 2', img: IMG_MRO_DASH },
              { key: 'power', icon: 'fa-bolt', tag: 'PHASE 3', img: IMG_PORT_NOISE },
              { key: 'aerospace', icon: 'fa-rocket', tag: 'PHASE 3', img: IMG_INTEGRATED },
              { key: 'future', icon: 'fa-infinity', tag: 'NEXT', placeholder: true },
            ].map((it: any) => {
              if (it.placeholder) {
                return (
                  <div class="reveal industry-card rounded-3xl p-7 border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-center min-h-[260px]">
                    <i class="fa-solid fa-infinity text-3xl text-slate-500 mb-3"></i>
                    <div class="text-slate-400 text-sm">More verticals coming...</div>
                    <div class="text-xs text-slate-500 mt-1">Smart Grid · Logistics · Mobility</div>
                  </div>
                )
              }
              return (
                <div class={`reveal industry-card glass rounded-3xl overflow-hidden ${it.accent ? 'glow-border' : ''}`}>
                  <div class="relative h-36 overflow-hidden">
                    <img src={it.img} alt="" class="absolute inset-0 w-full h-full object-cover" />
                    <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(4,8,20,0.30) 0%,rgba(4,8,20,0.55) 60%,rgba(4,8,20,0.95) 100%);"></div>
                    <div class="absolute top-3 left-3 flex items-center gap-2">
                      <div class={`w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur ${it.accent ? 'bg-ks-cyan/30 text-white' : 'bg-black/40 text-ks-cyan-soft'}`}>
                        <i class={`fa-solid ${it.icon} text-sm`}></i>
                      </div>
                    </div>
                    <span class="absolute top-3 right-3 text-[10px] font-bold tracking-widest px-2 py-1 rounded-full bg-black/50 text-slate-200 backdrop-blur">{it.tag}</span>
                  </div>
                  <div class="p-6 pt-5">
                    <div class="font-display text-xl font-bold" data-i18n={`industries.${it.key}_title`}></div>
                    <p class="mt-2 text-sm text-slate-300 leading-relaxed" data-i18n={`industries.${it.key}_desc`}></p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============== SOLUTIONS / AX MRO ============== */}
      <section id="solutions" class="py-28 relative overflow-hidden">
        <div class="absolute inset-0 pointer-events-none"
             style="background: radial-gradient(ellipse 60% 50% at 80% 30%, rgba(0,212,255,0.10), transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(59,130,246,0.10), transparent 60%);"></div>

        <div class="relative max-w-7xl mx-auto px-6">
          <div class="max-w-3xl reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="solution.kicker">AX MRO PLATFORM</div>
            <h2 class="font-display text-3xl md:text-5xl font-bold leading-[1.1]" data-i18n="solution.title">
              단순 챗봇이 아닙니다. 보고·듣고·판단하는 정비 에이전트입니다.
            </h2>
            <p class="mt-5 text-slate-400 text-lg" data-i18n="solution.subtitle">
              폐쇄망 엣지에서 동작하는 멀티모달 AI가 정비 현장의 의사결정을 가속합니다.
            </p>
          </div>

          {/* AX MRO Platform UI screenshot showcase */}
          <div class="mt-14 grid lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-7 reveal">
              <div class="relative rounded-3xl overflow-hidden glow-border">
                <img src={IMG_SMART_MRO_UI} alt="Smart MRO Platform UI" class="w-full h-auto block" />
                <div class="absolute inset-0 pointer-events-none" style="background:linear-gradient(180deg,transparent 70%,rgba(4,8,20,0.55) 100%);"></div>
              </div>
              <p class="mt-4 text-center text-xs text-slate-500 tracking-widest uppercase">
                Smart MRO Platform · Knowledge Graph + Vector RAG
              </p>
            </div>
            <div class="lg:col-span-5 reveal grid grid-cols-1 gap-4">
              {[
                { k: 'f1', i: 'fa-lock' },
                { k: 'f2', i: 'fa-wave-square' },
                { k: 'f3', i: 'fa-bolt-lightning' },
              ].map((f) => (
                <div class="glass rounded-2xl p-5 flex items-start gap-4">
                  <div class="w-11 h-11 rounded-xl bg-ks-cyan/10 text-ks-cyan flex items-center justify-center shrink-0">
                    <i class={`fa-solid ${f.i}`}></i>
                  </div>
                  <div>
                    <div class="font-display font-bold text-base" data-i18n={`solution.${f.k}_title`}></div>
                    <p class="mt-1 text-sm text-slate-300 leading-relaxed" data-i18n={`solution.${f.k}_desc`}></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remaining 3 features */}
          <div class="mt-10 grid md:grid-cols-3 gap-5">
            {[
              { k: 'f4', i: 'fa-heart-pulse' },
              { k: 'f5', i: 'fa-user-graduate' },
              { k: 'f6', i: 'fa-shield-halved' },
            ].map((f) => (
              <div class="reveal glass rounded-3xl p-7 industry-card">
                <div class="w-12 h-12 rounded-xl bg-ks-cyan/10 text-ks-cyan flex items-center justify-center mb-5">
                  <i class={`fa-solid ${f.i}`}></i>
                </div>
                <div class="font-display text-xl font-bold" data-i18n={`solution.${f.k}_title`}></div>
                <p class="mt-2 text-sm text-slate-300 leading-relaxed" data-i18n={`solution.${f.k}_desc`}></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== ARCHITECTURE (Sovereign Edge) ============== */}
      <section id="architecture" class="section-bg py-28 relative">
        <div class="max-w-7xl mx-auto px-6">
          <div class="max-w-3xl reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="architecture.kicker">CORE R&amp;D ARCHITECTURE</div>
            <h2 class="font-display text-3xl md:text-5xl font-bold leading-[1.1]" data-i18n="architecture.title">
              소버린 엣지 컴퓨팅 모듈
            </h2>
            <p class="mt-5 text-slate-400 text-lg" data-i18n="architecture.subtitle">
              국방 MRO를 위해 처음부터 설계된, 클라우드 연결 없이 동작하는 온디바이스 AI 허브.
            </p>
          </div>

          {/* Diagram */}
          <div class="mt-14 reveal">
            <div class="relative rounded-3xl overflow-hidden glow-border bg-white">
              <img src={IMG_SOVEREIGN} alt="Sovereign Edge Computing Module for Defense MRO" class="w-full h-auto block" />
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

      {/* ============== REALITY / IN THE FIELD ============== */}
      <section id="reality" class="py-28 relative overflow-hidden">
        <div class="absolute inset-0 opacity-25 pointer-events-none"
             style={`background-image:url(${IMG_INTEGRATED});background-size:cover;background-position:center;`}></div>
        <div class="absolute inset-0 pointer-events-none"
             style="background:linear-gradient(180deg,rgba(4,8,20,0.92) 0%,rgba(4,8,20,0.85) 50%,rgba(4,8,20,0.95) 100%);"></div>

        <div class="relative max-w-7xl mx-auto px-6">
          <div class="max-w-3xl reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="reality.kicker">WHERE AI MEETS THE FIELD</div>
            <h2 class="font-display text-3xl md:text-5xl font-bold leading-[1.1]" data-i18n-html="reality.title">
              소음 가득한 현장. 그곳에서<br/>AI는 진짜 일을 합니다.
            </h2>
            <p class="mt-5 text-slate-300/90 text-lg" data-i18n="reality.subtitle">
              엔진룸의 진동, 항만의 분진, 야전 정비창의 고소음 — 마린로보틱스연구소의 AX MRO는 가장 거친 환경을 기준으로 설계됩니다.
            </p>
          </div>

          <div class="mt-14 grid md:grid-cols-3 gap-6">
            {[
              { k: 'card1', img: IMG_ENGINE_ROOM },
              { k: 'card2', img: IMG_PORT_TABLET },
              { k: 'card3', img: IMG_NVIDIA_JETSON },
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
          <div class="mt-14 reveal glass-strong rounded-3xl overflow-hidden p-2">
            <div class="rounded-2xl overflow-hidden bg-white">
              <img src={IMG_CORE_ARCH} alt="Integrated Smart MRO System — Core R&D Architecture" class="w-full h-auto block" />
            </div>
          </div>
        </div>
      </section>

      {/* ============== PRODUCTION / MARINE CRANE ============== */}
      <section id="production" class="section-bg py-28">
        <div class="max-w-7xl mx-auto px-6">
          <div class="max-w-3xl reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="production.kicker">PRODUCTION &amp; FACILITY</div>
            <h2 class="font-display text-3xl md:text-5xl font-bold leading-[1.1]" data-i18n-html="production.title">
              연간 720기, 시장점유 ~99%의<br/>마린크레인 제조 베이스
            </h2>
            <p class="mt-5 text-slate-400 text-lg" data-i18n="production.subtitle">
              KS인더스트리는 경남 함안 본사 8,980평 부지·3,634평 건물에서 마린크레인을 생산합니다.
            </p>
          </div>

          {/* Facility stats */}
          <div class="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 reveal">
            {['stat1', 'stat2', 'stat3', 'stat4'].map((s) => (
              <div class="glass rounded-2xl p-6 text-center">
                <div class="font-display text-3xl md:text-4xl font-bold text-gradient" data-i18n={`production.${s}`}></div>
                <div class="mt-2 text-xs text-slate-400 leading-snug" data-i18n={`production.${s}_label`}></div>
              </div>
            ))}
          </div>

          {/* Product lineup */}
          <div class="mt-14 reveal">
            <div class="flex items-center gap-3 mb-5">
              <i class="fa-solid fa-table-list text-ks-cyan"></i>
              <h3 class="font-display text-xl font-bold" data-i18n="production.lineup">마린크레인 제품 라인업</h3>
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
          <div class="mt-14 reveal glass-strong rounded-3xl p-8">
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
      </section>

      {/* ============== CLIENTS ============== */}
      <section id="clients" class="py-28 relative overflow-hidden">
        <div class="absolute inset-0 pointer-events-none"
             style="background: radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,212,255,0.10), transparent 60%);"></div>
        <div class="relative max-w-7xl mx-auto px-6">
          <div class="max-w-3xl reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="clients.kicker">OUR CLIENTS</div>
            <h2 class="font-display text-3xl md:text-5xl font-bold leading-[1.1]" data-i18n-html="clients.title">
              국내 메이저 조선소와<br/>글로벌 해양 플레이어
            </h2>
            <p class="mt-5 text-slate-400 text-lg" data-i18n="clients.subtitle">
              대한민국 5대 조선소 전부, 그리고 브라질·중국·유럽의 주요 해양 기업이 KS인더스트리의 크레인을 선택했습니다.
            </p>
          </div>

          {/* Domestic */}
          <div class="mt-14 reveal">
            <div class="flex items-center gap-3 mb-5">
              <i class="fa-solid fa-flag text-ks-cyan"></i>
              <h3 class="font-display text-base tracking-[0.18em] uppercase text-slate-200" data-i18n="clients.domestic_label">국내</h3>
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
          <div class="mt-12 reveal">
            <div class="flex items-center gap-3 mb-5">
              <i class="fa-solid fa-globe text-ks-cyan"></i>
              <h3 class="font-display text-base tracking-[0.18em] uppercase text-slate-200" data-i18n="clients.overseas_label">해외</h3>
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
      </section>

      {/* ============== ROADMAP ============== */}
      <section id="roadmap" class="section-bg py-28">
        <div class="max-w-7xl mx-auto px-6">
          <div class="max-w-3xl reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="roadmap.kicker">ROADMAP</div>
            <h2 class="font-display text-3xl md:text-5xl font-bold leading-[1.1]" data-i18n="roadmap.title">
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

      {/* ============== CONTACT ============== */}
      <section id="contact" class="py-28 relative">
        <div class="absolute inset-0 pointer-events-none"
             style="background: radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,212,255,0.08), transparent 60%);"></div>
        <div class="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-10 items-start">
          <div class="lg:col-span-5 reveal">
            <div class="text-xs tracking-[0.3em] text-ks-cyan uppercase mb-3" data-i18n="contact.kicker">LET'S TALK</div>
            <h2 class="font-display text-3xl md:text-5xl font-bold leading-[1.1]" data-i18n="contact.title">
              함께 만들어 갈 미래를 이야기합시다
            </h2>
            <p class="mt-5 text-slate-400 text-lg" data-i18n="contact.subtitle">
              AI 에이전트 MARIN이 24시간 응답합니다. 신사업 미팅·기술 자문·도입 문의를 남겨주세요.
            </p>

            <div class="mt-8 space-y-4 text-sm text-slate-300">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-ks-cyan/10 text-ks-cyan flex items-center justify-center">
                  <i class="fa-solid fa-location-dot"></i>
                </div>
                <span data-i18n="contact.location">울산광역시 · 울산정보산업진흥원</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-ks-cyan/10 text-ks-cyan flex items-center justify-center">
                  <i class="fa-solid fa-envelope"></i>
                </div>
                <span data-i18n="contact.email">lab@ks-industry.com</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-ks-cyan/10 text-ks-cyan flex items-center justify-center">
                  <i class="fa-solid fa-comments"></i>
                </div>
                <button id="open-chat-contact" class="hover:text-ks-cyan transition" data-i18n="hero.cta_secondary">
                  MARIN과 대화하기
                </button>
              </div>
            </div>
          </div>

          <form id="contact-form" class="lg:col-span-7 reveal glass-strong rounded-3xl p-8 space-y-4">
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-slate-400 mb-2" data-i18n="contact.form_name">성함</label>
                <input name="name" required class="w-full bg-white/5 border border-white/10 focus:border-ks-cyan focus:bg-white/10 outline-none rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label class="block text-xs text-slate-400 mb-2" data-i18n="contact.form_company">소속 / 회사</label>
                <input name="company" class="w-full bg-white/5 border border-white/10 focus:border-ks-cyan focus:bg-white/10 outline-none rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>
            <div>
              <label class="block text-xs text-slate-400 mb-2" data-i18n="contact.form_email">이메일</label>
              <input type="email" name="email" required class="w-full bg-white/5 border border-white/10 focus:border-ks-cyan focus:bg-white/10 outline-none rounded-xl px-4 py-3 text-sm" />
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
              <label class="block text-xs text-slate-400 mb-2" data-i18n="contact.form_message">문의 내용</label>
              <textarea name="message" rows={4} required class="w-full bg-white/5 border border-white/10 focus:border-ks-cyan focus:bg-white/10 outline-none rounded-xl px-4 py-3 text-sm resize-none"></textarea>
            </div>
            <button type="submit" class="btn-primary rounded-full px-6 py-3 text-sm w-full inline-flex items-center justify-center gap-2">
              <i class="fa-solid fa-paper-plane"></i>
              <span data-i18n="contact.form_submit">문의 보내기</span>
            </button>
            <div id="contact-status" class="text-sm text-center hidden"></div>
          </form>
        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer class="border-t border-white/5 py-12">
        <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-8 items-start">
          <div class="md:col-span-5">
            <img src={LOGO_KSI_WORDMARK} alt="KS Industry" class="h-12 mb-3 select-none" draggable={false} />
            <img src={LOGO_MRL_WORDMARK} alt="Marine Robotics Lab" class="h-9 mb-4 select-none" draggable={false} />
            <p class="text-sm text-slate-400 max-w-md" data-i18n="footer.tagline">
              보고 듣고 판단하는, 지능형 엣지 MRO 플랫폼
            </p>
          </div>
          <div class="md:col-span-3 text-xs text-slate-400">
            <div class="font-display font-bold text-white text-sm mb-3 tracking-wider uppercase">KS Industry</div>
            <div class="space-y-1.5">
              <div><span class="text-slate-500">HQ</span> · 경남 함안군 군북면 석교천길 223</div>
              <div><span class="text-slate-500">LAB</span> · 울산정보산업진흥원 (2026.05~)</div>
              <div><span class="text-slate-500">E-Mail</span> · lab@ks-industry.com</div>
            </div>
          </div>
          <div class="md:col-span-4 text-xs text-slate-400">
            <div class="font-display font-bold text-white text-sm mb-3 tracking-wider uppercase">Quick Links</div>
            <div class="grid grid-cols-2 gap-1.5">
              <a href="#about" class="hover:text-ks-cyan" data-i18n="nav.about">연구소 소개</a>
              <a href="#solutions" class="hover:text-ks-cyan" data-i18n="nav.solutions">솔루션</a>
              <a href="#reality" class="hover:text-ks-cyan" data-i18n="nav.reality">현장</a>
              <a href="#production" class="hover:text-ks-cyan" data-i18n="nav.production">생산·시설</a>
              <a href="#clients" class="hover:text-ks-cyan" data-i18n="nav.clients">거래처</a>
              <a href="#roadmap" class="hover:text-ks-cyan" data-i18n="nav.roadmap">로드맵</a>
            </div>
          </div>
        </div>
        <div class="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-white/5 text-xs text-slate-500 flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <span data-i18n="footer.copy">© 2026 KS Industry · Marine Robotics Lab. All rights reserved.</span>
          <span class="tracking-widest">KS 3.0 · MARIN · AX MRO</span>
        </div>
      </footer>

      {/* ============== CHAT WIDGET ============== */}
      <button id="chat-launcher"
              class="chat-launcher fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center transition transform">
        <div class="relative">
          <img src={MARIN_IMG} alt="MARIN" class="w-12 h-12 rounded-full object-cover border-2 border-white/70" />
          <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-ks-deep"></span>
        </div>
      </button>

      <div id="chat-panel"
           class="chat-panel chat-panel-mobile hidden fixed bottom-24 right-6 z-50 w-[380px] h-[600px] rounded-3xl overflow-hidden flex flex-col">
        <div class="px-5 py-4 flex items-center gap-3 border-b border-white/5">
          <div class="relative">
            <img src={MARIN_IMG} alt="MARIN" class="w-11 h-11 rounded-full object-cover border border-ks-cyan/40" />
            <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-ks-deep"></span>
          </div>
          <div class="flex-1">
            <div class="font-display font-bold text-sm flex items-center gap-2">
              <span data-i18n="chat.title">MARIN · AI 에이전트</span>
            </div>
            <div class="text-[11px] text-slate-400" data-i18n="chat.subtitle">마린로보틱스연구소 안내</div>
          </div>
          <button id="chat-close" class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div id="chat-messages" class="chat-scroll flex-1 overflow-y-auto px-4 py-4 space-y-3"></div>

        <div id="chat-suggestions" class="px-4 pb-2 flex flex-wrap gap-2">
          <button class="suggestion glass rounded-full px-3 py-1.5 text-[11px] text-ks-cyan-soft hover:bg-ks-cyan/10" data-i18n="chat.suggest1">연구소 핵심 솔루션이 뭔가요?</button>
          <button class="suggestion glass rounded-full px-3 py-1.5 text-[11px] text-ks-cyan-soft hover:bg-ks-cyan/10" data-i18n="chat.suggest2">국방 MRO 도입 절차가 궁금합니다</button>
          <button class="suggestion glass rounded-full px-3 py-1.5 text-[11px] text-ks-cyan-soft hover:bg-ks-cyan/10" data-i18n="chat.suggest3">미팅을 잡고 싶어요</button>
        </div>

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
            <button type="submit" class="w-8 h-8 rounded-full btn-primary flex items-center justify-center">
              <i class="fa-solid fa-arrow-up text-xs"></i>
            </button>
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
