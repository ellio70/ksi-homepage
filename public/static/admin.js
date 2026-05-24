/* KSI CMS Admin — 비주얼 콘텐츠 관리 패널
 *
 * 기능:
 * 1) 비밀번호 로그인 → 세션 쿠키 자동 부여
 * 2) 섹션별 i18n 키 그룹화 + 5개 언어 동시 편집
 * 3) 변경사항 추적 + 저장 (5개 언어 일괄 저장)
 * 4) 이미지 슬롯별 업로드 / 복원
 * 5) 기본값으로 복원 (오버라이드 삭제)
 */

(function () {
  'use strict'

  const LANGS = [
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ]

  // 키-섹션 그룹 정의 — 실제 sentinai.kr 페이지 스크롤 순서대로 정렬
  // (사업기획 시야로, 메인페이지 위→아래 따라가며 편집 가능하도록)
  const KEY_GROUPS = [
    {
      id: 'nav',
      label: '🧭 상단 메뉴',
      desc: '데스크탑/모바일/푸터 네비게이션 (sLM MRO · 엣지 HW · 문의하기)',
      keys: ['nav.slm_mro', 'nav.edge_hw', 'nav.contact', 'nav.lang'],
    },
    {
      id: 'hero',
      label: '🎯 Hero (첫 화면)',
      desc: '메인 타이틀, 부제, CTA 버튼, 배지, 라이브 데모 라벨',
      keys: [
        'hero.tag',
        'hero.title',
        'hero.subtitle',
        'hero.cta_primary',
        'hero.cta_secondary',
        'hero.badge1',
        'hero.badge2',
        'hero.badge3',
        'hero.avatar_caption',
        'hero.demo_live',
        'hero.demo_open',
      ],
    },
    {
      id: 'kpi',
      label: '📊 KPI · Proven Performance',
      desc: '핵심 지표 6개 카드 (수치 + 라벨)',
      keys: [
        'kpi.kicker', 'kpi.title', 'kpi.subtitle',
        'kpi.m1_value', 'kpi.m1_label',
        'kpi.m2_value', 'kpi.m2_label',
        'kpi.m3_value', 'kpi.m3_label',
        'kpi.m4_value', 'kpi.m4_label',
        'kpi.m5_value', 'kpi.m5_label',
        'kpi.m6_value', 'kpi.m6_label',
      ],
    },
    {
      id: 'industries',
      label: '🏭 Industries · sLM MRO 3개 산업',
      desc: '국방 / 조선해양 / 제조생산 MRO 카드',
      keys: [
        'industries.kicker',
        'industries.title',
        'industries.subtitle',
        'industries.defense_title',
        'industries.defense_desc',
        'industries.defense_b1',
        'industries.defense_b2',
        'industries.defense_b3',
        'industries.defense_b4',
        'industries.defense_slogan',
        'industries.marine_title',
        'industries.marine_desc',
        'industries.marine_b1',
        'industries.marine_b2',
        'industries.marine_b3',
        'industries.marine_b4',
        'industries.marine_slogan',
        'industries.manufacture_title',
        'industries.manufacture_desc',
        'industries.manufacture_b1',
        'industries.manufacture_b2',
        'industries.manufacture_b3',
        'industries.manufacture_b4',
        'industries.manufacture_slogan',
      ],
    },
    {
      id: 'applications',
      label: '🛠 Applications · 적용 사례',
      desc: '실제 적용 시나리오 (엔진룸 / 항만 / 야전)',
      keys: ['applications.kicker', 'applications.subtitle'],
    },
    {
      id: 'sentinai',
      label: '🛡️ SentinAI Platform (3-Pillar)',
      desc: 'See / Hear / Decide — 3대 기둥 소개',
      keys: [
        'sentinai.kicker', 'sentinai.title', 'sentinai.subtitle',
        'sentinai.pillar1_title', 'sentinai.pillar1_desc',
        'sentinai.pillar2_title', 'sentinai.pillar2_desc',
        'sentinai.pillar3_title', 'sentinai.pillar3_desc',
      ],
    },
    {
      id: 'solution',
      label: '🧩 Solution · 8대 모듈 + 차별화',
      desc: '정의 + 8대 모듈 + See/Hear/Decide 상세 + 차별화 비교표',
      keys: [
        'solution.kicker',
        'solution.title',
        'solution.subtitle',
        'solution.definition',
        'solution.modules_label',
        'solution.m1_title', 'solution.m1_desc',
        'solution.m2_title', 'solution.m2_desc',
        'solution.m3_title', 'solution.m3_desc',
        'solution.m4_title', 'solution.m4_desc',
        'solution.m5_title', 'solution.m5_desc',
        'solution.m6_title', 'solution.m6_desc',
        'solution.m7_title', 'solution.m7_desc',
        'solution.m8_title', 'solution.m8_desc',
        'solution.see_title', 'solution.see_desc',
        'solution.hear_title', 'solution.hear_desc',
        'solution.decide_title', 'solution.decide_desc',
        'solution.diff_label',
        'solution.diff1_old', 'solution.diff1_new',
        'solution.diff2_old', 'solution.diff2_new',
        'solution.diff3_old', 'solution.diff3_new',
        'solution.diff4_old', 'solution.diff4_new',
      ],
    },
    {
      id: 'architecture',
      label: '🏗 Architecture · 소버린 엣지',
      desc: '아키텍처 4블록 + 스펙 4지표',
      keys: [
        'architecture.kicker', 'architecture.title', 'architecture.subtitle',
        'architecture.b1_title', 'architecture.b1_desc',
        'architecture.b2_title', 'architecture.b2_desc',
        'architecture.b3_title', 'architecture.b3_desc',
        'architecture.b4_title', 'architecture.b4_desc',
        'architecture.spec1', 'architecture.spec1_label',
        'architecture.spec2', 'architecture.spec2_label',
        'architecture.spec3', 'architecture.spec3_label',
        'architecture.spec4', 'architecture.spec4_label',
      ],
    },
    {
      id: 'forces',
      label: '🎖 Forces · 육·해·공 군별 제품',
      desc: '지상군 / 해군 / 공군 각 타겟·기능·배지',
      keys: [
        'forces.kicker', 'forces.title', 'forces.subtitle',
        'forces.ground_title', 'forces.ground_badge', 'forces.ground_target', 'forces.ground_f1', 'forces.ground_f2',
        'forces.marine_title', 'forces.marine_badge', 'forces.marine_target', 'forces.marine_f1', 'forces.marine_f2',
        'forces.aero_title', 'forces.aero_badge', 'forces.aero_target', 'forces.aero_f1', 'forces.aero_f2',
      ],
    },
    {
      id: 'hardware',
      label: '💎 Hardware · 엣지 HW 번들',
      desc: '엣지 HW 4구성품 + 번들 카피',
      keys: [
        'hardware.kicker', 'hardware.title',
        'hardware.bundle_title', 'hardware.bundle_desc',
        'hardware.c1_title', 'hardware.c1_spec', 'hardware.c1_effect',
        'hardware.c2_title', 'hardware.c2_spec', 'hardware.c2_effect',
        'hardware.c3_title', 'hardware.c3_spec', 'hardware.c3_effect',
        'hardware.c4_title', 'hardware.c4_spec', 'hardware.c4_effect',
      ],
    },
    {
      id: 'production',
      label: '🏭 Production · 생산·시설',
      desc: '생산 라인업 7제품 + 통계 4지표',
      keys: [
        'production.kicker', 'production.title', 'production.subtitle',
        'production.lineup', 'production.col_product', 'production.col_capacity', 'production.col_use',
        'production.p1_name', 'production.p1_cap', 'production.p1_use',
        'production.p2_name', 'production.p2_cap', 'production.p2_use',
        'production.p3_name', 'production.p3_cap', 'production.p3_use',
        'production.p4_name', 'production.p4_cap', 'production.p4_use',
        'production.p5_name', 'production.p5_cap', 'production.p5_use',
        'production.p6_name', 'production.p6_cap', 'production.p6_use',
        'production.p7_name', 'production.p7_cap', 'production.p7_use',
        'production.stat1', 'production.stat1_label',
        'production.stat2', 'production.stat2_label',
        'production.stat3', 'production.stat3_label',
        'production.stat4', 'production.stat4_label',
      ],
    },
    {
      id: 'clients',
      label: '🤝 Clients · 거래처',
      desc: '국내/해외 거래처 라벨',
      keys: [
        'clients.kicker', 'clients.title', 'clients.subtitle',
        'clients.domestic_label', 'clients.overseas_label',
      ],
    },
    {
      id: 'reality',
      label: '📸 Reality · 현장',
      desc: '현장 3카드 (제목·설명)',
      keys: [
        'reality.kicker', 'reality.title', 'reality.subtitle',
        'reality.card1_title', 'reality.card1_desc',
        'reality.card2_title', 'reality.card2_desc',
        'reality.card3_title', 'reality.card3_desc',
      ],
    },
    {
      id: 'certs',
      label: '🏅 Certs · 인증',
      desc: '인증·표준 리스트',
      keys: ['certs.kicker', 'certs.title', 'certs.list'],
    },
    {
      id: 'roadmap',
      label: '🗺 Roadmap · 실행 로드맵',
      desc: '4단계 로드맵 (기간·제목·설명)',
      keys: [
        'roadmap.kicker', 'roadmap.title', 'roadmap.subtitle',
        'roadmap.s1_period', 'roadmap.s1_title', 'roadmap.s1_desc',
        'roadmap.s2_period', 'roadmap.s2_title', 'roadmap.s2_desc',
        'roadmap.s3_period', 'roadmap.s3_title', 'roadmap.s3_desc',
        'roadmap.s4_period', 'roadmap.s4_title', 'roadmap.s4_desc',
      ],
    },
    {
      id: 'contact',
      label: '📨 Contact · 문의하기',
      desc: '연락처 폼 라벨, 안내 문구, 제출 버튼',
      keys: [
        'contact.kicker', 'contact.title', 'contact.subtitle',
        'contact.form_name', 'contact.form_company', 'contact.form_email',
        'contact.form_topic', 'contact.form_message', 'contact.form_submit',
        'contact.form_success', 'contact.form_error',
        'contact.email', 'contact.location',
      ],
    },
    {
      id: 'chat',
      label: '💬 SentinAI 챗봇',
      desc: '챗봇 위젯 텍스트 (환영·플레이스홀더·아바타 라벨·면책 문구)',
      keys: [
        'chat.title', 'chat.subtitle',
        'chat.welcome', 'chat.placeholder', 'chat.send', 'chat.thinking',
        'chat.suggest1', 'chat.suggest2', 'chat.suggest3',
        'chat.avatar_female', 'chat.avatar_male',
        'chat.persona_role', 'chat.persona_hint',
        'chat.disclaimer',
      ],
    },
    {
      id: 'footer',
      label: '📌 푸터',
      desc: '회사 정보, 카피라이트',
      keys: ['footer.tagline', 'footer.copy'],
    },
  ]

  // 상태
  const state = {
    authenticated: false,
    defaults: {}, // lang -> { key: value } (메인페이지 i18n에서 로드)
    overrides: {}, // lang -> { key: value } (KV에서 로드)
    dirty: {}, // key -> { lang: value } (저장 안 된 변경분)
    images: [],
    activeGroup: 'hero',
    expandedKeys: new Set(), // 현재 펼쳐진 항목
    busy: false,
    view: 'content', // 'content' | 'images' | 'layout' | 'knowledge'
    kb: {
      items: [], loading: false, editingId: null, editingDraft: null, categories: [],
      filter: { category: 'all', query: '' }, // 카테고리 필터 + 검색
      pdfModal: null, // { phase, file, fileName, extractedText, chunks, meta }
    },
    // ── Layout (섹션 visibility + 이미지 슬롯 리매핑)
    layout: {
      sections: {}, // sectionId -> bool (현재 적용된 값, KV 반영 후)
      images: {},   // slotId -> filename
      meta: { sectionDefs: [], imageDefs: [], imagePool: [] },
      dirtySections: {}, // sectionId -> bool (변경된 것만)
      dirtyImages: {},   // slotId -> filename
    },
  }

  // ============================================================
  // API helpers
  // ============================================================
  async function api(method, path, body, isForm) {
    const opts = { method, credentials: 'same-origin' }
    if (body !== undefined) {
      if (isForm) {
        opts.body = body
      } else {
        opts.headers = { 'Content-Type': 'application/json' }
        opts.body = JSON.stringify(body)
      }
    }
    const r = await fetch(path, opts)
    let data = null
    try { data = await r.json() } catch {}
    return { ok: r.ok && (data?.ok !== false), status: r.status, data }
  }

  function getMerged(lang, key) {
    // dirty가 우선, 그다음 override, 그다음 default
    if (state.dirty[key] && lang in state.dirty[key]) return state.dirty[key][lang]
    if (state.overrides[lang] && state.overrides[lang][key] !== undefined) return state.overrides[lang][key]
    return state.defaults[lang]?.[key] ?? ''
  }

  function isModified(key) {
    // dirty 있으면 modified
    if (state.dirty[key]) {
      const v = state.dirty[key]
      // 단순히 dirty 키 존재만으로 표시 (값이 default와 같아도 사용자가 명시적 편집한 경우 카운트)
      return Object.keys(v).length > 0
    }
    return false
  }

  function hasOverride(key) {
    return LANGS.some((l) => state.overrides[l.code] && state.overrides[l.code][key] !== undefined)
  }

  function dirtyCount() {
    return Object.keys(state.dirty).length
  }

  // ============================================================
  // 토스트 알림
  // ============================================================
  function toast(msg, kind) {
    kind = kind || 'info'
    const colors = {
      success: 'bg-emerald-500 text-white',
      error: 'bg-rose-500 text-white',
      info: 'bg-cyan-500 text-slate-900',
      warn: 'bg-amber-400 text-slate-900',
    }
    const el = document.createElement('div')
    el.className = `toast fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-2xl ${colors[kind] || colors.info} font-medium`
    el.textContent = msg
    document.body.appendChild(el)
    setTimeout(() => {
      el.style.transition = 'opacity 0.3s, transform 0.3s'
      el.style.opacity = '0'
      el.style.transform = 'translateX(100%)'
      setTimeout(() => el.remove(), 300)
    }, 2800)
  }

  // ============================================================
  // 로그인 화면
  // ============================================================
  function renderLogin(errMsg) {
    document.getElementById('app').innerHTML = `
      <div class="min-h-screen flex items-center justify-center px-4">
        <div class="glass rounded-2xl p-8 w-full max-w-md">
          <div class="text-center mb-6">
            <div class="text-3xl mb-2">🛡️</div>
            <h1 class="text-2xl font-bold ks-cyan">KSI 콘텐츠 관리</h1>
            <p class="text-sm text-slate-400 mt-1">KS Industry · Marine Robotics Lab</p>
          </div>
          <form id="login-form" class="space-y-4">
            <div>
              <label class="block text-sm text-slate-300 mb-1">관리자 비밀번호</label>
              <input id="pw" type="password" autocomplete="current-password" required
                class="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:outline-none transition" />
            </div>
            ${errMsg ? `<div class="text-rose-400 text-sm">${errMsg}</div>` : ''}
            <button type="submit" class="w-full py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-bold transition">
              로그인
            </button>
          </form>
          <div class="mt-6 text-xs text-slate-500 text-center">
            이 페이지는 권한 있는 사용자만 접근 가능합니다.
          </div>
        </div>
      </div>
    `
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault()
      const pw = document.getElementById('pw').value
      const r = await api('POST', '/api/admin/login', { password: pw })
      if (r.ok) {
        state.authenticated = true
        await loadAll()
        renderApp()
      } else {
        renderLogin('비밀번호가 일치하지 않습니다.')
      }
    })
  }

  // ============================================================
  // 데이터 로드
  // ============================================================
  async function loadAll() {
    state.busy = true
    // 1) 기본 i18n + 오버라이드 머지본을 통째로 받음 (정확히 메인페이지가 보는 것과 동일)
    const r1 = await fetch('/api/i18n', { credentials: 'same-origin' })
    const data1 = await r1.json()
    // 머지본 = defaults로 사용 (오버라이드가 이미 반영된 화면)
    state.defaults = data1.dict
    // 2) 별도로 KV 오버라이드만 받아서 모디파이드 표시용으로
    const r2 = await api('GET', '/api/admin/i18n')
    if (r2.ok) {
      state.overrides = r2.data?.overrides || {}
    }
    // 3) 이미지 슬롯 로드
    const r3 = await api('GET', '/api/admin/images')
    if (r3.ok) {
      state.images = r3.data?.slots || []
    }
    // 4) Layout 상태 로드 (섹션 visibility + 이미지 슬롯 리매핑)
    const r4 = await api('GET', '/api/admin/layout')
    if (r4.ok) {
      state.layout.sections = r4.data?.sections || {}
      state.layout.images = r4.data?.images || {}
      state.layout.meta = r4.data?.meta || { sectionDefs: [], imageDefs: [], imagePool: [] }
      state.layout.dirtySections = {}
      state.layout.dirtyImages = {}
    }
    state.busy = false
  }

  // Layout 헬퍼: 현재 효과적인 값 (dirty 우선)
  function effSection(id) {
    if (id in state.layout.dirtySections) return state.layout.dirtySections[id]
    return state.layout.sections[id] !== false
  }
  function effImage(id) {
    if (id in state.layout.dirtyImages) return state.layout.dirtyImages[id]
    return state.layout.images[id] || ''
  }
  function layoutDirtyCount() {
    return Object.keys(state.layout.dirtySections).length + Object.keys(state.layout.dirtyImages).length
  }

  // ============================================================
  // 메인 앱 화면
  // ============================================================
  function renderApp() {
    const app = document.getElementById('app')
    app.innerHTML = `
      <div class="min-h-screen flex flex-col">
        ${headerHtml()}
        <div class="flex flex-1 overflow-hidden">
          ${sidebarHtml()}
          <main class="flex-1 overflow-y-auto p-6">
            ${state.view === 'content' ? contentViewHtml()
              : state.view === 'images' ? imagesViewHtml()
              : state.view === 'knowledge' ? knowledgeViewHtml()
              : layoutViewHtml()}
          </main>
        </div>
      </div>
    `
    attachAppHandlers()
  }

  function headerHtml() {
    const count = dirtyCount()
    const layoutCount = layoutDirtyCount()
    const totalDirty = count + layoutCount
    const overrideCount = Object.keys(state.overrides).reduce((sum, lang) => sum + Object.keys(state.overrides[lang] || {}).length, 0)
    return `
      <header class="glass border-b border-slate-700/50 px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="text-xl font-bold ks-cyan">🛡️ KSI 콘텐츠 관리</div>
          <a href="/" target="_blank" class="text-xs text-slate-400 hover:text-cyan-300 transition">
            <i class="fa-solid fa-external-link-alt mr-1"></i>실제 사이트 미리보기
          </a>
        </div>
        <div class="flex items-center gap-3">
          ${totalDirty > 0
            ? `<span class="modified-badge text-xs font-bold px-3 py-1 rounded-full">미저장 변경 ${totalDirty}건${layoutCount > 0 ? ` (레이아웃 ${layoutCount})` : ''}</span>`
            : `<span class="text-xs text-slate-500">${overrideCount > 0 ? `사용자 편집 ${overrideCount}건 활성` : '모든 텍스트 기본값'}</span>`
          }
          <button id="save-btn" ${totalDirty === 0 ? 'disabled' : ''}
            class="px-4 py-2 rounded-lg ${totalDirty === 0 ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-bold'} transition text-sm">
            <i class="fa-solid fa-save mr-1"></i>저장하고 발행 (${totalDirty})
          </button>
          <button id="logout-btn" class="px-3 py-2 rounded-lg text-slate-400 hover:text-rose-300 transition text-sm">
            <i class="fa-solid fa-sign-out-alt"></i>
          </button>
        </div>
      </header>
    `
  }

  function sidebarHtml() {
    const itemsHtml = KEY_GROUPS.map((g) => {
      const isActive = state.view === 'content' && state.activeGroup === g.id
      const modCount = g.keys.filter((k) => isModified(k) || hasOverride(k)).length
      return `
        <button data-group="${g.id}" class="group-btn w-full text-left px-4 py-3 rounded-lg transition ${
          isActive ? 'bg-cyan-400/10 border-l-2 border-ks-cyan' : 'hover:bg-slate-800/50 border-l-2 border-transparent'
        }">
          <div class="font-medium ${isActive ? 'text-cyan-300' : 'text-slate-200'}">${g.label}</div>
          <div class="text-xs text-slate-500 mt-0.5">${g.desc}</div>
          ${modCount > 0
            ? `<div class="text-xs mt-1"><span class="modified-badge px-2 py-0.5 rounded font-bold">${modCount}건 편집됨</span></div>`
            : ''
          }
        </button>
      `
    }).join('')

    const isImageActive = state.view === 'images'
    const isLayoutActive = state.view === 'layout'
    const isKbActive = state.view === 'knowledge'
    const layoutDirty = layoutDirtyCount()
    return `
      <aside class="w-72 glass border-r border-slate-700/50 p-4 overflow-y-auto shrink-0">
        <div class="text-xs uppercase tracking-wider text-slate-500 mb-2 px-2">콘텐츠 섹션</div>
        <div class="space-y-1 mb-6">${itemsHtml}</div>
        <div class="text-xs uppercase tracking-wider text-slate-500 mb-2 px-2">미디어 & 레이아웃</div>
        <button data-view="images" class="view-btn w-full text-left px-4 py-3 rounded-lg transition mb-2 ${
          isImageActive ? 'bg-cyan-400/10 border-l-2 border-ks-cyan' : 'hover:bg-slate-800/50 border-l-2 border-transparent'
        }">
          <div class="font-medium ${isImageActive ? 'text-cyan-300' : 'text-slate-200'}">🖼️ 이미지 관리</div>
          <div class="text-xs text-slate-500 mt-0.5">파일 업로드 · 교체</div>
        </button>
        <button data-view="layout" class="view-btn w-full text-left px-4 py-3 rounded-lg transition mb-2 ${
          isLayoutActive ? 'bg-cyan-400/10 border-l-2 border-ks-cyan' : 'hover:bg-slate-800/50 border-l-2 border-transparent'
        }">
          <div class="font-medium ${isLayoutActive ? 'text-cyan-300' : 'text-slate-200'}">🧩 레이아웃 편집</div>
          <div class="text-xs text-slate-500 mt-0.5">섹션 ON/OFF · 이미지 위치</div>
          ${layoutDirty > 0
            ? `<div class="text-xs mt-1"><span class="modified-badge px-2 py-0.5 rounded font-bold">${layoutDirty}건 미저장</span></div>`
            : ''
          }
        </button>
        <div class="text-xs uppercase tracking-wider text-slate-500 mb-2 mt-6 px-2">SentinAI 챗봇</div>
        <button data-view="knowledge" class="view-btn w-full text-left px-4 py-3 rounded-lg transition ${
          isKbActive ? 'bg-cyan-400/10 border-l-2 border-ks-cyan' : 'hover:bg-slate-800/50 border-l-2 border-transparent'
        }">
          <div class="font-medium ${isKbActive ? 'text-cyan-300' : 'text-slate-200'}">📚 지식베이스</div>
          <div class="text-xs text-slate-500 mt-0.5">챗봇 답변 자료 관리 (RAG)</div>
          ${state.kb.items.length > 0
            ? `<div class="text-xs mt-1 text-cyan-400">${state.kb.items.length}개 항목 활성</div>`
            : ''
          }
        </button>
      </aside>
    `
  }

  function contentViewHtml() {
    const group = KEY_GROUPS.find((g) => g.id === state.activeGroup) || KEY_GROUPS[0]
    const keyCardsHtml = group.keys.map((k) => keyCardHtml(k)).join('')
    return `
      <div class="max-w-4xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-slate-100">${group.label}</h2>
          <p class="text-sm text-slate-400 mt-1">${group.desc} · ${group.keys.length}개 항목</p>
        </div>
        <div class="space-y-3">${keyCardsHtml}</div>
      </div>
    `
  }

  function keyCardHtml(key) {
    const modified = isModified(key)
    const overridden = hasOverride(key)
    const koPreview = (getMerged('ko', key) || '').slice(0, 90)
    const expanded = state.expandedKeys.has(key)

    if (!expanded) {
      return `
        <div class="glass rounded-xl key-row cursor-pointer transition" data-toggle-key="${key}">
          <div class="p-4 flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <code class="text-xs text-cyan-400/70">${key}</code>
                ${modified ? '<span class="modified-badge text-[10px] font-bold px-2 py-0.5 rounded">수정됨</span>' : ''}
                ${!modified && overridden ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">사용자 편집 활성</span>' : ''}
              </div>
              <div class="text-sm text-slate-300 truncate">${escapeHtml(koPreview) || '<span class="text-slate-600">(빈 값)</span>'}</div>
            </div>
            <i class="fa-solid fa-chevron-down text-slate-500"></i>
          </div>
        </div>
      `
    }

    // 펼쳐진 상태: 5개 언어 동시 편집
    const langInputsHtml = LANGS.map((l) => {
      const v = getMerged(l.code, key)
      const isMulti = (v || '').length > 60 || (v || '').includes('\n')
      const inputEl = isMulti
        ? `<textarea data-i18n-input="${key}" data-lang="${l.code}" rows="3" class="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:outline-none transition resize-y">${escapeHtml(v)}</textarea>`
        : `<input type="text" data-i18n-input="${key}" data-lang="${l.code}" value="${escapeHtml(v)}" class="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:outline-none transition" />`
      return `
        <div class="space-y-1">
          <label class="flex items-center gap-2 text-xs text-slate-400">
            <span class="text-base">${l.flag}</span>
            <span class="font-medium">${l.label}</span>
            <code class="text-[10px] text-slate-600 ml-auto">${l.code}</code>
          </label>
          ${inputEl}
        </div>
      `
    }).join('')

    return `
      <div class="glass rounded-xl transition">
        <div class="p-4 flex items-center gap-3 border-b border-slate-700/30 cursor-pointer" data-toggle-key="${key}">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <code class="text-xs text-cyan-400/70">${key}</code>
              ${modified ? '<span class="modified-badge text-[10px] font-bold px-2 py-0.5 rounded">수정됨</span>' : ''}
              ${!modified && overridden ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">사용자 편집 활성</span>' : ''}
            </div>
          </div>
          <i class="fa-solid fa-chevron-up text-slate-500"></i>
        </div>
        <div class="p-4 space-y-3">
          ${langInputsHtml}
          <div class="flex items-center gap-2 pt-2 border-t border-slate-700/30">
            ${overridden || modified
              ? `<button data-reset-key="${key}" class="text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition">
                  <i class="fa-solid fa-undo mr-1"></i>기본값으로 복원
                </button>`
              : ''
            }
            ${modified
              ? `<button data-discard-key="${key}" class="text-xs px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition">
                  <i class="fa-solid fa-times mr-1"></i>이 변경 취소
                </button>`
              : ''
            }
            <span class="text-[11px] text-slate-500 ml-auto">힌트: <code>&lt;br/&gt;</code>로 줄바꿈, 저장 시 5개 언어 모두 발행됩니다.</span>
          </div>
        </div>
      </div>
    `
  }

  function imagesViewHtml() {
    const cards = state.images.map((img) => {
      const url = img.hasOverride
        ? `/cms-image/${img.slot}?t=${Date.now()}`
        : `/static/images/${img.slot}`
      return `
        <div class="glass rounded-xl overflow-hidden">
          <div class="aspect-video bg-slate-900 relative overflow-hidden">
            <img src="${url}" alt="${img.slot}" class="w-full h-full object-cover" onerror="this.style.display='none'">
            ${img.hasOverride
              ? '<span class="absolute top-2 right-2 modified-badge text-[10px] font-bold px-2 py-1 rounded">사용자 업로드</span>'
              : '<span class="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded bg-slate-700/80 text-slate-300">기본 이미지</span>'
            }
          </div>
          <div class="p-3">
            <div class="text-sm font-medium text-slate-200">${img.label}</div>
            <code class="text-[10px] text-slate-500">${img.slot}</code>
            <div class="flex gap-2 mt-3">
              <label class="flex-1 cursor-pointer text-center text-xs px-3 py-2 rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 transition">
                <i class="fa-solid fa-upload mr-1"></i>새 이미지 업로드
                <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" class="hidden" data-upload-slot="${img.slot}" />
              </label>
              ${img.hasOverride
                ? `<button data-restore-slot="${img.slot}" class="text-xs px-3 py-2 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition">
                    <i class="fa-solid fa-undo"></i>
                  </button>`
                : ''
              }
            </div>
          </div>
        </div>
      `
    }).join('')
    return `
      <div class="max-w-6xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-slate-100">🖼️ 이미지 관리</h2>
          <p class="text-sm text-slate-400 mt-1">${state.images.length}개 슬롯 · 같은 슬롯에 새 이미지를 올리면 즉시 사이트에 반영됩니다. (jpg/png/webp/svg · 최대 5MB)</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div>
      </div>
    `
  }

  // ============================================================
  // Layout View — 섹션 visibility 토글 + 이미지 슬롯 리매핑
  // ============================================================
  function layoutViewHtml() {
    const secDefs = state.layout.meta.sectionDefs || []
    const imgDefs = state.layout.meta.imageDefs || []
    const pool = state.layout.meta.imagePool || []

    // === 섹션 토글 카드 ===
    const sectionCards = secDefs.map((s) => {
      const visible = effSection(s.id)
      const isDirty = s.id in state.layout.dirtySections
      return `
        <div class="glass rounded-xl p-4 flex items-center justify-between gap-4 ${isDirty ? 'ring-1 ring-amber-400/60' : ''}">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <code class="text-[10px] text-cyan-400/70">#${s.id}</code>
              ${isDirty ? '<span class="modified-badge text-[10px] font-bold px-2 py-0.5 rounded">변경됨</span>' : ''}
              ${!visible ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">숨김</span>' : ''}
            </div>
            <div class="text-sm font-medium text-slate-200">${escapeHtml(s.label)}</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer shrink-0">
            <input type="checkbox" data-section-toggle="${s.id}" ${visible ? 'checked' : ''} class="sr-only peer">
            <div class="w-12 h-6 bg-slate-700 rounded-full peer peer-checked:bg-cyan-500 transition relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition peer-checked:after:translate-x-6"></div>
          </label>
        </div>
      `
    }).join('')

    // === 이미지 슬롯 리매핑 카드 ===
    const imageCards = imgDefs.map((s) => {
      const current = effImage(s.id)
      const isDirty = s.id in state.layout.dirtyImages
      const isDefault = current === s.defaultFile
      const options = pool.map((f) => {
        return `<option value="${f}" ${f === current ? 'selected' : ''}>${f}${f === s.defaultFile ? ' (기본)' : ''}</option>`
      }).join('')
      return `
        <div class="glass rounded-xl overflow-hidden ${isDirty ? 'ring-1 ring-amber-400/60' : ''}">
          <div class="aspect-video bg-slate-900 relative overflow-hidden">
            <img src="/static/images/${current}?t=${Date.now()}" alt="${current}" class="w-full h-full object-cover" onerror="this.style.opacity='0.2'">
            ${isDirty ? '<span class="absolute top-2 right-2 modified-badge text-[10px] font-bold px-2 py-1 rounded">변경됨</span>' : ''}
            ${!isDefault && !isDirty ? '<span class="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/30 text-emerald-200">위치 변경 활성</span>' : ''}
          </div>
          <div class="p-3">
            <div class="text-sm font-medium text-slate-200">${escapeHtml(s.label)}</div>
            <code class="text-[10px] text-slate-500 block mb-2">slot: ${s.id}</code>
            <select data-image-slot="${s.id}" class="w-full px-2 py-2 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:outline-none transition text-xs">
              ${options}
            </select>
            ${!isDefault
              ? `<button data-restore-image-slot="${s.id}" data-default="${s.defaultFile}" class="mt-2 w-full text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition">
                  <i class="fa-solid fa-undo mr-1"></i>기본 이미지로 복원
                </button>`
              : ''
            }
          </div>
        </div>
      `
    }).join('')

    const hiddenCount = secDefs.filter((s) => !effSection(s.id)).length
    const remappedCount = imgDefs.filter((s) => effImage(s.id) !== s.defaultFile).length

    return `
      <div class="max-w-6xl mx-auto space-y-10">
        <div>
          <h2 class="text-2xl font-bold text-slate-100">🧩 레이아웃 편집</h2>
          <p class="text-sm text-slate-400 mt-1">
            섹션을 통째로 숨기거나, 이미지가 어느 위치에 들어갈지 자유롭게 재배치합니다.
            상단의 <b class="text-cyan-300">"저장하고 발행"</b> 버튼을 눌러야 실제 사이트에 반영됩니다.
          </p>
        </div>

        <!-- 섹션 토글 -->
        <section>
          <div class="flex items-baseline gap-3 mb-4">
            <h3 class="text-lg font-bold text-slate-100">📑 섹션 ON / OFF</h3>
            <span class="text-xs text-slate-400">${secDefs.length}개 섹션 · 현재 ${hiddenCount}개 숨김</span>
          </div>
          <p class="text-xs text-slate-500 mb-4">
            끄면 해당 섹션이 메인페이지에서 완전히 사라집니다. (Hero / 네비게이션 / 푸터는 필수라 항상 표시)
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${sectionCards}</div>
        </section>

        <!-- 이미지 슬롯 -->
        <section>
          <div class="flex items-baseline gap-3 mb-4">
            <h3 class="text-lg font-bold text-slate-100">🖼️ 이미지 위치 교체</h3>
            <span class="text-xs text-slate-400">${imgDefs.length}개 위치 · 현재 ${remappedCount}개 변경됨</span>
          </div>
          <p class="text-xs text-slate-500 mb-4">
            각 위치(슬롯)에 어떤 이미지 파일을 표시할지 선택합니다. 같은 이미지를 여러 위치에 동시 사용해도 됩니다.
            <br>풀의 이미지가 부족하면 먼저 <b class="text-cyan-300">"이미지 관리"</b> 탭에서 새 파일을 업로드하세요.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${imageCards}</div>
        </section>

        <!-- 전체 초기화 -->
        <section class="pt-6 border-t border-slate-700/40">
          <button id="layout-reset-all" class="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition text-sm">
            <i class="fa-solid fa-rotate-left mr-1"></i>레이아웃 전체를 기본값으로 초기화
          </button>
          <p class="text-[11px] text-slate-500 mt-2">모든 섹션 토글 + 이미지 위치 매핑이 기본값으로 되돌아갑니다. (텍스트/이미지 파일 자체는 영향 없음)</p>
        </section>
      </div>
    `
  }

  // ============================================================
  // 📚 지식베이스 (RAG) — 뷰 + API 클라이언트
  // ============================================================
  const KB_CATEGORY_LABELS = {
    company:   '🏢 회사 개요',
    product:   '🛡️ 제품·SentinAI',
    tech:      '⚙️ 기술·특허',
    process:   '📋 도입·절차',
    roadmap:   '🗺️ 로드맵',
    contact:   '📞 연락처',
    faq:       '💬 FAQ',
    industry:  '🌐 인접 산업 지식',
    reference: '📄 참조 자료',
    etc:       '📦 기타',
  }
  const KB_CATEGORY_ORDER = ['company','product','tech','process','roadmap','contact','faq','industry','reference','etc']
  // 외부 자료 카테고리 (UI에서 시각적으로 구분 표시)
  const KB_EXTERNAL_CATEGORIES = new Set(['industry', 'reference'])

  function kbCategoryLabel(id) {
    return KB_CATEGORY_LABELS[id] || id
  }

  async function loadKb() {
    state.kb.loading = true
    const r = await api('GET', '/api/admin/kb')
    state.kb.loading = false
    if (r.ok && r.data) {
      state.kb.items = r.data.items || []
      state.kb.categories = r.data.categories || []
    } else {
      state.kb.items = []
    }
  }

  async function saveKbItem(draft) {
    const isNew = !draft.id
    const payload = {
      title: draft.title || '',
      category: draft.category || 'etc',
      content: draft.content || '',
      tags: (draft.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
      priority: Number(draft.priority) || 3,
    }
    if (!payload.title.trim()) {
      toast('제목은 필수입니다', 'error')
      return false
    }
    if (!payload.content.trim()) {
      toast('본문 내용은 필수입니다', 'error')
      return false
    }
    const r = isNew
      ? await api('POST', '/api/admin/kb', payload)
      : await api('PUT', `/api/admin/kb/${encodeURIComponent(draft.id)}`, payload)
    if (r.ok) {
      toast(isNew ? '새 항목을 추가했습니다' : '항목을 수정했습니다', 'success')
      state.kb.editingId = null
      state.kb.editingDraft = null
      await loadKb()
      renderApp()
      return true
    }
    toast('저장 실패', 'error')
    return false
  }

  async function deleteKbItem(id, title) {
    if (!confirm(`"${title}" 항목을 삭제할까요?\n(되돌릴 수 없습니다)`)) return
    const r = await api('DELETE', `/api/admin/kb/${encodeURIComponent(id)}`)
    if (r.ok) {
      toast('삭제했습니다', 'success')
      await loadKb()
      renderApp()
    } else {
      toast('삭제 실패', 'error')
    }
  }

  async function seedKb() {
    if (!confirm('기본 지식베이스 8개 항목을 한꺼번에 추가할까요?\n(이미 있는 항목은 건너뜁니다)')) return
    toast('시드 데이터 주입 중…', 'info')
    const r = await api('POST', '/api/admin/kb/seed')
    if (r.ok) {
      const added = r.data?.added ?? 0
      const skipped = r.data?.skipped ?? 0
      toast(`완료: ${added}개 추가, ${skipped}개 건너뜀`, 'success')
      await loadKb()
      renderApp()
    } else {
      toast('시드 실패', 'error')
    }
  }

  // ============================================================
  // 📄 PDF 업로드 → KB 일괄 등록 파이프라인
  // ============================================================

  // PDF 파일에서 전체 텍스트 추출 (PDF.js 사용)
  async function extractPdfText(file, onProgress) {
    if (!window.pdfjsLib) {
      throw new Error('PDF.js 라이브러리가 로드되지 않았습니다')
    }
    const buf = await file.arrayBuffer()
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise
    const numPages = pdf.numPages
    let allText = ''
    for (let p = 1; p <= numPages; p++) {
      if (onProgress) onProgress(p, numPages)
      const page = await pdf.getPage(p)
      const tc = await page.getTextContent()
      const pageText = tc.items.map((it) => it.str).join(' ')
      allText += pageText + '\n\n'
    }
    return { text: allText, numPages }
  }

  // 텍스트를 의미 단위로 청크 분할
  // 우선 문단 단위로 합치고, 목표 크기(기본 800자) 초과하면 컷
  function chunkText(text, targetChars = 800, maxChars = 1200) {
    // 정리: 다중 공백 → 단일, 빈 줄 정리
    const cleaned = text
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    if (!cleaned) return []
    // 문단 단위 split (빈 줄 기준)
    const paragraphs = cleaned.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    const chunks = []
    let buf = ''
    for (const para of paragraphs) {
      if (!buf) { buf = para; continue }
      if (buf.length + para.length + 2 <= targetChars) {
        buf += '\n\n' + para
      } else if (buf.length >= targetChars * 0.5) {
        // 충분히 찼으면 푸시
        chunks.push(buf)
        buf = para
      } else {
        // 너무 짧으면 합쳐서 누적 (이후 maxChars 초과 시 강제 컷)
        buf += '\n\n' + para
        if (buf.length >= maxChars) {
          chunks.push(buf)
          buf = ''
        }
      }
    }
    if (buf.trim()) chunks.push(buf)
    // 너무 긴 청크는 문장 단위로 재분할
    const final = []
    for (const ch of chunks) {
      if (ch.length <= maxChars) { final.push(ch); continue }
      // 문장 단위 split (한글 마침표·물음표·느낌표·줄바꿈)
      const sentences = ch.split(/(?<=[.!?。·\u3002])\s+|\n+/)
      let sub = ''
      for (const s of sentences) {
        if (!sub) { sub = s; continue }
        if (sub.length + s.length + 1 <= maxChars) {
          sub += ' ' + s
        } else {
          final.push(sub.trim())
          sub = s
        }
      }
      if (sub.trim()) final.push(sub.trim())
    }
    return final.filter((c) => c && c.trim().length >= 30) // 너무 짧은 건 폐기
  }

  // 모달 열기
  function openPdfModal() {
    state.kb.pdfModal = {
      phase: 'select', // 'select' | 'extracting' | 'preview' | 'uploading' | 'done'
      file: null,
      fileName: '',
      extractedText: '',
      chunks: [],
      progress: 0,
      progressTotal: 0,
      meta: {
        category: 'industry',
        priority: 4,
        tags: '',
        targetChars: 800,
      },
      result: null,
    }
    renderApp()
  }

  function closePdfModal() {
    state.kb.pdfModal = null
    renderApp()
  }

  async function handlePdfFile(file) {
    const m = state.kb.pdfModal
    if (!m) return
    if (!file || !file.type || file.type !== 'application/pdf') {
      toast('PDF 파일만 업로드 가능합니다', 'error')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      toast('PDF 크기는 20MB 이하여야 합니다', 'error')
      return
    }
    m.file = file
    m.fileName = file.name
    m.phase = 'extracting'
    m.progress = 0
    m.progressTotal = 0
    // 기본 태그 — 파일명에서 키워드 추출 (간단)
    if (!m.meta.tags) {
      m.meta.tags = file.name.replace(/\.[^.]+$/, '').slice(0, 60)
    }
    renderApp()
    try {
      const { text, numPages } = await extractPdfText(file, (cur, total) => {
        m.progress = cur
        m.progressTotal = total
        // 5페이지마다만 리렌더 (성능)
        if (cur % 5 === 0 || cur === total) renderApp()
      })
      m.extractedText = text
      m.chunks = chunkText(text, m.meta.targetChars, Math.round(m.meta.targetChars * 1.5))
      m.phase = 'preview'
      renderApp()
    } catch (e) {
      console.error('PDF extract error', e)
      toast('PDF 추출 실패: ' + (e.message || ''), 'error')
      m.phase = 'select'
      renderApp()
    }
  }

  // 청크 크기 변경 시 재분할
  function rechunkPdf() {
    const m = state.kb.pdfModal
    if (!m || !m.extractedText) return
    const target = Math.max(300, Math.min(2000, Number(m.meta.targetChars) || 800))
    m.chunks = chunkText(m.extractedText, target, Math.round(target * 1.5))
    renderApp()
  }

  async function submitPdfBulk() {
    const m = state.kb.pdfModal
    if (!m || !m.chunks.length) return
    m.phase = 'uploading'
    renderApp()
    const payload = {
      source: 'pdf:' + m.fileName,
      source_label: m.fileName,
      category: m.meta.category,
      priority: Number(m.meta.priority) || 4,
      tags: m.meta.tags.split(',').map((t) => t.trim()).filter(Boolean),
      chunks: m.chunks.map((c) => ({ content: c })),
    }
    const r = await api('POST', '/api/admin/kb/bulk', payload)
    if (r.ok) {
      m.phase = 'done'
      m.result = r.data
      toast(`${r.data?.created || 0}개 항목 등록 완료`, 'success')
      await loadKb()
      renderApp()
    } else {
      toast('일괄 등록 실패: ' + (r.data?.error || ''), 'error')
      m.phase = 'preview'
      renderApp()
    }
  }

  async function deleteKbSource(source) {
    if (!confirm(`"${source}"에서 가져온 모든 KB 항목을 한 번에 삭제할까요?\n(되돌릴 수 없습니다)`)) return
    const r = await api('DELETE', '/api/admin/kb/source/' + encodeURIComponent(source))
    if (r.ok) {
      toast(`${r.data?.deleted || 0}개 항목을 삭제했습니다`, 'success')
      await loadKb()
      renderApp()
    } else {
      toast('일괄 삭제 실패', 'error')
    }
  }

  // PDF 업로드 모달 HTML
  function pdfModalHtml() {
    const m = state.kb.pdfModal
    if (!m) return ''
    let bodyHtml = ''
    if (m.phase === 'select') {
      bodyHtml = `
        <div class="space-y-4">
          <p class="text-sm text-slate-300">
            PDF 파일을 선택하면 브라우저에서 직접 텍스트를 추출하고, 청크 단위로 분할해서 지식베이스에 일괄 등록합니다.
          </p>
          <div class="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-cyan-400 transition cursor-pointer" data-pdf-drop>
            <i class="fa-solid fa-file-pdf text-5xl text-rose-400 mb-3"></i>
            <p class="text-sm text-slate-300 mb-2">PDF 파일을 끌어다 놓거나 클릭하세요</p>
            <p class="text-xs text-slate-500">최대 20MB · 텍스트가 있는 PDF만 가능 (스캔본 불가)</p>
            <input type="file" accept="application/pdf" id="pdf-file-input" class="hidden">
          </div>
        </div>
      `
    } else if (m.phase === 'extracting') {
      const pct = m.progressTotal ? Math.round((m.progress / m.progressTotal) * 100) : 0
      bodyHtml = `
        <div class="text-center py-8">
          <i class="fa-solid fa-spinner fa-spin text-4xl text-cyan-400 mb-4"></i>
          <p class="text-sm text-slate-300 mb-3">${escapeHtml(m.fileName)}</p>
          <p class="text-xs text-slate-400 mb-3">텍스트 추출 중… ${m.progress} / ${m.progressTotal} 페이지</p>
          <div class="w-full bg-slate-700/50 rounded-full h-2 max-w-md mx-auto">
            <div class="bg-cyan-400 h-2 rounded-full transition-all" style="width: ${pct}%"></div>
          </div>
        </div>
      `
    } else if (m.phase === 'preview') {
      const catOptions = KB_CATEGORY_ORDER.map((cid) => {
        return `<option value="${cid}" ${cid === m.meta.category ? 'selected' : ''}>${escapeHtml(KB_CATEGORY_LABELS[cid])}</option>`
      }).join('')
      const previewChunks = m.chunks.slice(0, 3).map((ch, i) => `
        <div class="bg-slate-900/40 rounded-lg p-3 text-xs text-slate-300">
          <div class="text-[10px] text-cyan-400 mb-1">청크 ${i + 1} · ${ch.length}자</div>
          <div class="whitespace-pre-wrap leading-relaxed">${escapeHtml(ch.slice(0, 280))}${ch.length > 280 ? '…' : ''}</div>
        </div>
      `).join('')
      bodyHtml = `
        <div class="space-y-4">
          <div class="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <i class="fa-solid fa-circle-check text-emerald-400 text-xl"></i>
            <div class="text-sm">
              <div class="font-medium text-emerald-300">${escapeHtml(m.fileName)}</div>
              <div class="text-xs text-emerald-200/70">총 ${m.chunks.length}개 청크로 분할 · 전체 ${m.extractedText.length.toLocaleString()}자</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">카테고리</label>
              <select data-pdf-meta="category" class="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:outline-none text-sm">
                ${catOptions}
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">우선순위 (1=최우선, 5=보조)</label>
              <input type="number" min="1" max="5" data-pdf-meta="priority" value="${m.meta.priority}"
                class="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:outline-none text-sm">
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">공통 태그 (쉼표로 구분, 모든 청크에 적용)</label>
            <input type="text" data-pdf-meta="tags" value="${escapeHtml(m.meta.tags)}"
              class="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:outline-none text-sm"
              placeholder="예: MRO, 항공, 일자리">
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">
              청크 크기 (자 단위) — 변경 시 자동 재분할
            </label>
            <div class="flex gap-2 items-center">
              <input type="range" min="400" max="1500" step="100" data-pdf-meta="targetChars" value="${m.meta.targetChars}"
                class="flex-1">
              <span class="text-xs text-cyan-300 font-mono w-12 text-right">${m.meta.targetChars}자</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-1">권장: 600~1000자. 작을수록 청크 수↑·정밀도↑, 클수록 문맥 보존↑</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-400 mb-2">미리보기 (앞 3개 청크)</label>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              ${previewChunks}
            </div>
            ${m.chunks.length > 3 ? `<p class="text-[11px] text-slate-500 mt-2 text-center">…외 ${m.chunks.length - 3}개 청크</p>` : ''}
          </div>

          <div class="flex gap-2 pt-2 border-t border-slate-700">
            <button data-pdf-cancel class="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 text-sm transition">
              취소
            </button>
            <button data-pdf-rechunk class="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 text-sm transition">
              <i class="fa-solid fa-rotate mr-1"></i>재분할
            </button>
            <div class="flex-1"></div>
            <button data-pdf-submit class="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm transition">
              <i class="fa-solid fa-cloud-arrow-up mr-1"></i>${m.chunks.length}개 항목 일괄 등록
            </button>
          </div>
        </div>
      `
    } else if (m.phase === 'uploading') {
      bodyHtml = `
        <div class="text-center py-8">
          <i class="fa-solid fa-spinner fa-spin text-4xl text-cyan-400 mb-4"></i>
          <p class="text-sm text-slate-300">${m.chunks.length}개 청크 등록 중…</p>
        </div>
      `
    } else if (m.phase === 'done') {
      bodyHtml = `
        <div class="text-center py-8">
          <i class="fa-solid fa-circle-check text-5xl text-emerald-400 mb-4"></i>
          <h3 class="text-lg font-bold text-emerald-300 mb-2">완료!</h3>
          <p class="text-sm text-slate-300 mb-1">${m.result?.created || 0}개 KB 항목이 추가되었습니다</p>
          <p class="text-xs text-slate-500 mb-6">출처: <code class="text-cyan-400">${escapeHtml(m.result?.source || '')}</code></p>
          <button data-pdf-cancel class="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm transition">
            확인
          </button>
        </div>
      `
    }
    return `
      <div class="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 pb-12 bg-slate-900/80 backdrop-blur" data-pdf-overlay>
        <div class="glass rounded-2xl w-full max-w-2xl border border-cyan-500/30 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between p-5 border-b border-slate-700 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
            <h3 class="text-lg font-bold text-cyan-300">
              <i class="fa-solid fa-file-pdf mr-2"></i>PDF 일괄 등록
            </h3>
            <button data-pdf-cancel class="text-slate-400 hover:text-slate-200 p-1">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="p-5">${bodyHtml}</div>
        </div>
      </div>
    `
  }

  function knowledgeViewHtml() {
    const items = state.kb.items || []
    const editing = state.kb.editingDraft

    // ── 편집/생성 폼 ──
    let editorHtml = ''
    if (editing) {
      const isNew = !editing.id
      const catOptions = KB_CATEGORY_ORDER.map((cid) => {
        return `<option value="${cid}" ${cid === editing.category ? 'selected' : ''}>${escapeHtml(KB_CATEGORY_LABELS[cid])}</option>`
      }).join('')
      editorHtml = `
        <div class="glass rounded-xl p-6 border border-cyan-500/30 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-cyan-300">
              <i class="fa-solid fa-${isNew ? 'plus' : 'pen'} mr-2"></i>${isNew ? '새 항목 추가' : '항목 수정'}
            </h3>
            <button data-kb-cancel class="text-sm text-slate-400 hover:text-slate-200">
              <i class="fa-solid fa-xmark mr-1"></i>취소
            </button>
          </div>
          <div class="space-y-4">
            <!-- 제목 -->
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">제목 <span class="text-rose-400">*</span></label>
              <input type="text" data-kb-field="title" value="${escapeHtml(editing.title || '')}"
                class="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:outline-none transition text-sm"
                placeholder="예: SentinAI 핵심 기능 3가지">
            </div>
            <!-- 카테고리 + 우선순위 -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">카테고리</label>
                <select data-kb-field="category" class="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:outline-none transition text-sm">
                  ${catOptions}
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">우선순위 (1=최우선, 5=보조)</label>
                <input type="number" min="1" max="5" data-kb-field="priority" value="${editing.priority ?? 3}"
                  class="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:outline-none transition text-sm">
              </div>
            </div>
            <!-- 태그 -->
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">태그 (쉼표로 구분)</label>
              <input type="text" data-kb-field="tags" value="${escapeHtml(editing.tags || '')}"
                class="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:outline-none transition text-sm"
                placeholder="예: SentinAI, MRO, 엣지 sLM, 정비">
            </div>
            <!-- 본문 -->
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">
                본문 (Markdown 지원) <span class="text-rose-400">*</span>
              </label>
              <textarea data-kb-field="content" rows="12"
                class="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:outline-none transition text-sm font-mono leading-relaxed"
                placeholder="**제품 개요**&#10;&#10;SentinAI는 ..."
              >${escapeHtml(editing.content || '')}</textarea>
              <p class="text-[11px] text-slate-500 mt-1">
                💡 마크다운 형식으로 작성하면 챗봇 답변에 그대로 활용됩니다. (제목, 굵게, 리스트 등)
              </p>
            </div>
            <!-- 저장 버튼 -->
            <div class="flex gap-2 pt-2">
              <button data-kb-save class="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm transition">
                <i class="fa-solid fa-floppy-disk mr-1"></i>${isNew ? '추가' : '저장'}
              </button>
              <button data-kb-cancel class="px-5 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 text-sm transition">
                취소
              </button>
            </div>
          </div>
        </div>
      `
    }

    // ── 필터 적용 ──
    const filter = state.kb.filter || { category: 'all', query: '' }
    const q = (filter.query || '').toLowerCase().trim()
    const filtered = items.filter((it) => {
      if (filter.category !== 'all' && it.category !== filter.category) return false
      if (q) {
        const hay = (it.title + ' ' + (it.tags || []).join(' ') + ' ' + (it.source || '') + ' ' + it.content).toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })

    // ── source(PDF)별 그룹 통계 — 카테고리 필터 무시한 전체 기준 ──
    const sourceStats = {}
    items.forEach((it) => {
      if (it.source && it.source.startsWith('pdf:')) {
        if (!sourceStats[it.source]) sourceStats[it.source] = { label: it.source.replace(/^pdf:/, ''), count: 0 }
        sourceStats[it.source].count++
      }
    })
    const sourceEntries = Object.entries(sourceStats)

    // ── 필터 바 ──
    const catFilterOptions = ['all', ...KB_CATEGORY_ORDER].map((cid) => {
      const label = cid === 'all' ? '🌐 전체 카테고리' : KB_CATEGORY_LABELS[cid]
      const count = cid === 'all' ? items.length : items.filter((it) => it.category === cid).length
      return `<option value="${cid}" ${cid === filter.category ? 'selected' : ''}>${escapeHtml(label)} (${count})</option>`
    }).join('')
    const filterBarHtml = items.length > 0 ? `
      <div class="glass rounded-xl p-3 flex flex-wrap gap-2 items-center">
        <select data-kb-filter="category" class="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:outline-none text-sm">
          ${catFilterOptions}
        </select>
        <div class="flex-1 min-w-[200px] relative">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"></i>
          <input type="text" data-kb-filter="query" value="${escapeHtml(filter.query || '')}"
            class="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700 focus:border-cyan-400 focus:outline-none text-sm"
            placeholder="제목·태그·본문에서 검색…">
        </div>
        <span class="text-xs text-slate-500 px-2">
          ${filtered.length} / ${items.length}개 표시
        </span>
      </div>
    ` : ''

    // ── PDF 출처별 일괄 관리 패널 ──
    const sourcePanelHtml = sourceEntries.length > 0 ? `
      <div class="glass rounded-xl p-4 border border-amber-500/20">
        <div class="flex items-center gap-2 mb-3">
          <i class="fa-solid fa-file-pdf text-amber-400"></i>
          <h3 class="text-sm font-bold text-amber-300">PDF 출처별 관리</h3>
          <span class="text-xs text-slate-500">— 같은 PDF에서 가져온 항목을 한 번에 삭제</span>
        </div>
        <div class="flex flex-wrap gap-2">
          ${sourceEntries.map(([source, stat]) => `
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700">
              <i class="fa-solid fa-file-pdf text-rose-400 text-xs"></i>
              <span class="text-xs text-slate-200 max-w-[280px] truncate">${escapeHtml(stat.label)}</span>
              <span class="text-[10px] text-cyan-400 font-bold">${stat.count}개</span>
              <button data-kb-source-delete="${escapeHtml(source)}" class="text-rose-400 hover:text-rose-300 transition p-1" title="이 PDF에서 가져온 모든 항목 삭제">
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''

    // ── 목록 ──
    let listHtml = ''
    if (state.kb.loading) {
      listHtml = `<div class="text-center py-12 text-slate-500"><i class="fa-solid fa-spinner fa-spin mr-2"></i>불러오는 중…</div>`
    } else if (items.length === 0) {
      listHtml = `
        <div class="glass rounded-xl p-10 text-center">
          <div class="text-5xl mb-4">📚</div>
          <h3 class="text-lg font-bold text-slate-200 mb-2">아직 지식베이스 항목이 없습니다</h3>
          <p class="text-sm text-slate-400 mb-6">
            챗봇이 답변할 때 참조할 자료를 추가해보세요.<br>
            기본 4개 시드 데이터를 한번에 주입하거나, PDF를 통째로 등록할 수 있습니다.
          </p>
          <div class="flex gap-3 justify-center flex-wrap">
            <button data-kb-seed class="px-5 py-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium text-sm transition">
              <i class="fa-solid fa-seedling mr-1"></i>기본 시드 추가
            </button>
            <button data-kb-pdf-upload class="px-5 py-2.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium text-sm transition">
              <i class="fa-solid fa-file-pdf mr-1"></i>PDF 일괄 등록
            </button>
            <button data-kb-add class="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm transition">
              <i class="fa-solid fa-plus mr-1"></i>직접 추가
            </button>
          </div>
        </div>
      `
    } else if (filtered.length === 0) {
      listHtml = `
        <div class="glass rounded-xl p-10 text-center">
          <div class="text-5xl mb-4">🔍</div>
          <h3 class="text-lg font-bold text-slate-200 mb-2">검색 결과가 없습니다</h3>
          <p class="text-sm text-slate-400">필터 또는 검색어를 조정해보세요.</p>
        </div>
      `
    } else {
      // 카테고리별 그룹화
      const byCat = {}
      filtered.forEach((it) => {
        const c = it.category || 'etc'
        if (!byCat[c]) byCat[c] = []
        byCat[c].push(it)
      })
      const groupHtml = KB_CATEGORY_ORDER
        .filter((cid) => byCat[cid])
        .map((cid) => {
          const cards = byCat[cid]
            .sort((a, b) => (a.priority - b.priority) || ((a.chunk_index || 0) - (b.chunk_index || 0)) || (b.updated_at - a.updated_at))
            .map((it) => kbCardHtml(it))
            .join('')
          const isExternal = KB_EXTERNAL_CATEGORIES.has(cid)
          return `
            <section>
              <div class="flex items-baseline gap-3 mb-3">
                <h3 class="text-sm font-bold ${isExternal ? 'text-amber-300' : 'text-cyan-300'}">${escapeHtml(kbCategoryLabel(cid))}</h3>
                <span class="text-xs text-slate-500">${byCat[cid].length}개</span>
                ${isExternal ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">외부 자료 — 답변에 자동 출처 표기</span>' : ''}
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${cards}</div>
            </section>
          `
        })
        .join('')
      listHtml = `<div class="space-y-8">${groupHtml}</div>`
    }

    // ── 헤더 액션 버튼 — 편집 여부와 무관하게 항상 노출 ──
    const headerActionsHtml = items.length > 0 ? `
      <div class="flex gap-2 shrink-0 flex-wrap">
        <button data-kb-pdf-upload class="px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium text-sm transition" ${editing ? 'title="편집을 마친 후 사용하세요"' : ''}>
          <i class="fa-solid fa-file-pdf mr-1"></i>PDF 업로드
        </button>
        <button data-kb-add class="px-4 py-2 rounded-lg ${editing ? 'bg-slate-700/40 text-slate-500 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-900'} font-bold text-sm transition" ${editing ? 'disabled title="편집 중입니다"' : ''}>
          <i class="fa-solid fa-plus mr-1"></i>새 항목
        </button>
      </div>
    ` : ''

    return `
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 class="text-2xl font-bold text-slate-100">📚 지식베이스 (RAG)</h2>
            <p class="text-sm text-slate-400 mt-1">
              SentinAI 챗봇이 답변할 때 참조할 자료를 관리합니다.
              질문이 들어오면 키워드 매칭으로 가장 관련 있는 항목 <b class="text-cyan-300">상위 4개</b>를 자동으로 LLM에 전달합니다.
            </p>
          </div>
          ${headerActionsHtml}
        </div>

        ${editorHtml}
        ${filterBarHtml}
        ${sourcePanelHtml}
        ${listHtml}
      </div>
      ${pdfModalHtml()}
    `
  }

  function kbCardHtml(it) {
    const tagsHtml = (it.tags || []).slice(0, 6).map((t) => {
      return `<span class="text-[10px] px-2 py-0.5 rounded bg-slate-700/50 text-slate-300">#${escapeHtml(t)}</span>`
    }).join('')
    const preview = (it.content || '').replace(/[#*`_>\-]/g, '').slice(0, 120)
    const updated = it.updated_at ? new Date(it.updated_at).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }) : ''
    const isExternal = KB_EXTERNAL_CATEGORIES.has(it.category)
    const sourceLabel = it.source && it.source.startsWith('pdf:') ? it.source.replace(/^pdf:/, '') : ''
    const chunkLabel = it.chunk_index && it.chunk_total ? `${it.chunk_index}/${it.chunk_total}` : ''
    return `
      <div class="glass rounded-xl p-4 flex flex-col gap-2 ${isExternal ? 'border border-amber-500/20' : ''}">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-[10px] px-1.5 py-0.5 rounded ${isExternal ? 'bg-amber-500/15 text-amber-300' : 'bg-cyan-500/15 text-cyan-300'} font-bold">P${it.priority}</span>
              ${chunkLabel ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 font-mono">청크 ${chunkLabel}</span>` : ''}
              <code class="text-[10px] text-slate-500 truncate">${escapeHtml(it.id)}</code>
            </div>
            <h4 class="text-sm font-bold text-slate-100 break-words">${escapeHtml(it.title)}</h4>
            ${sourceLabel ? `<div class="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><i class="fa-solid fa-file-pdf text-rose-400"></i>${escapeHtml(sourceLabel)}</div>` : ''}
          </div>
          <div class="flex gap-1 shrink-0">
            <button data-kb-edit="${escapeHtml(it.id)}" class="p-1.5 rounded text-slate-400 hover:bg-slate-700/50 hover:text-cyan-300 transition" title="수정">
              <i class="fa-solid fa-pen text-xs"></i>
            </button>
            <button data-kb-delete="${escapeHtml(it.id)}" data-kb-title="${escapeHtml(it.title)}" class="p-1.5 rounded text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 transition" title="삭제">
              <i class="fa-solid fa-trash text-xs"></i>
            </button>
          </div>
        </div>
        ${preview ? `<p class="text-xs text-slate-400 leading-relaxed line-clamp-3">${escapeHtml(preview)}…</p>` : ''}
        ${tagsHtml ? `<div class="flex flex-wrap gap-1">${tagsHtml}</div>` : ''}
        ${updated ? `<div class="text-[10px] text-slate-500 mt-auto">수정 ${updated}</div>` : ''}
      </div>
    `
  }

  // ============================================================
  // 이벤트 핸들러
  // ============================================================
  function attachAppHandlers() {
    // 사이드바 — 그룹 클릭
    document.querySelectorAll('.group-btn').forEach((b) => {
      b.addEventListener('click', () => {
        state.activeGroup = b.dataset.group
        state.view = 'content'
        state.expandedKeys.clear()
        renderApp()
      })
    })
    // 사이드바 — 뷰 전환
    document.querySelectorAll('.view-btn').forEach((b) => {
      b.addEventListener('click', async () => {
        state.view = b.dataset.view
        // 지식베이스 뷰는 진입 시 자동 로드 (아직 로드 안 됐을 때만)
        if (state.view === 'knowledge' && state.kb.items.length === 0 && !state.kb.loading) {
          renderApp()           // 로딩 표시
          await loadKb()
        }
        renderApp()
      })
    })
    // 항목 펼치기/접기
    document.querySelectorAll('[data-toggle-key]').forEach((el) => {
      el.addEventListener('click', (e) => {
        // input/textarea 내부 클릭은 무시
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return
        const key = el.dataset.toggleKey
        if (state.expandedKeys.has(key)) state.expandedKeys.delete(key)
        else state.expandedKeys.add(key)
        renderApp()
      })
    })
    // 입력 변경 추적
    document.querySelectorAll('[data-i18n-input]').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        const key = inp.dataset.i18nInput
        const lang = inp.dataset.lang
        state.dirty[key] = state.dirty[key] || {}
        state.dirty[key][lang] = inp.value
        // 헤더 카운터만 부분 갱신 (전체 리렌더 X — 입력 끊김 방지)
        const headerEl = document.querySelector('header')
        if (headerEl) headerEl.outerHTML = headerHtml()
        attachHeaderHandlers()
      })
    })
    // 기본값으로 복원
    document.querySelectorAll('[data-reset-key]').forEach((b) => {
      b.addEventListener('click', async () => {
        const key = b.dataset.resetKey
        if (!confirm(`"${key}" 항목을 기본값으로 복원할까요?\n(5개 언어 모두 기본값으로 돌아갑니다)`)) return
        const r = await api('DELETE', `/api/admin/i18n/${encodeURIComponent(key)}`)
        if (r.ok) {
          delete state.dirty[key]
          LANGS.forEach((l) => {
            if (state.overrides[l.code]) delete state.overrides[l.code][key]
          })
          await loadAll()
          renderApp()
          toast('기본값으로 복원했습니다', 'success')
        } else {
          toast('복원 실패', 'error')
        }
      })
    })
    // 변경 취소 (저장 안 한 dirty만 제거)
    document.querySelectorAll('[data-discard-key]').forEach((b) => {
      b.addEventListener('click', () => {
        const key = b.dataset.discardKey
        delete state.dirty[key]
        renderApp()
        toast('변경을 취소했습니다', 'info')
      })
    })
    // 이미지 업로드
    document.querySelectorAll('[data-upload-slot]').forEach((inp) => {
      inp.addEventListener('change', async (e) => {
        const file = inp.files?.[0]
        if (!file) return
        const slot = inp.dataset.uploadSlot
        const fd = new FormData()
        fd.append('filename', slot)
        fd.append('file', file)
        toast('업로드 중…', 'info')
        const r = await api('POST', '/api/admin/images', fd, true)
        if (r.ok) {
          toast('이미지를 교체했습니다', 'success')
          await loadAll()
          renderApp()
        } else {
          const code = r.data?.error || 'unknown'
          toast(`업로드 실패 (${code})`, 'error')
        }
      })
    })
    // 이미지 복원
    document.querySelectorAll('[data-restore-slot]').forEach((b) => {
      b.addEventListener('click', async () => {
        const slot = b.dataset.restoreSlot
        if (!confirm(`"${slot}" 이미지를 기본 이미지로 복원할까요?`)) return
        const r = await api('DELETE', `/api/admin/images/${encodeURIComponent(slot)}`)
        if (r.ok) {
          toast('기본 이미지로 복원했습니다', 'success')
          await loadAll()
          renderApp()
        } else {
          toast('복원 실패', 'error')
        }
      })
    })
    // ─────────────── Layout 핸들러 ───────────────
    // 섹션 visibility 토글
    document.querySelectorAll('[data-section-toggle]').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const id = cb.dataset.sectionToggle
        const newVal = cb.checked
        const original = state.layout.sections[id] !== false  // 기본 true
        if (newVal === original) {
          delete state.layout.dirtySections[id]
        } else {
          state.layout.dirtySections[id] = newVal
        }
        renderApp()
      })
    })
    // 이미지 슬롯 드롭다운 변경
    document.querySelectorAll('[data-image-slot]').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        const id = sel.dataset.imageSlot
        const newVal = sel.value
        const original = state.layout.images[id]
        if (newVal === original) {
          delete state.layout.dirtyImages[id]
        } else {
          state.layout.dirtyImages[id] = newVal
        }
        renderApp()
      })
    })
    // 이미지 슬롯 → 기본값 복원
    document.querySelectorAll('[data-restore-image-slot]').forEach((b) => {
      b.addEventListener('click', () => {
        const id = b.dataset.restoreImageSlot
        const def = b.dataset.default
        const original = state.layout.images[id]
        if (def === original) {
          delete state.layout.dirtyImages[id]
        } else {
          state.layout.dirtyImages[id] = def
        }
        renderApp()
      })
    })
    // Layout 전체 초기화
    const resetAllBtn = document.getElementById('layout-reset-all')
    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', async () => {
        if (!confirm('모든 섹션 토글 + 이미지 위치 매핑을 기본값으로 되돌리시겠어요?\n(텍스트/업로드 이미지 자체는 영향 없음)')) return
        const r = await api('DELETE', '/api/admin/layout')
        if (r.ok) {
          toast('레이아웃을 기본값으로 초기화했습니다', 'success')
          await loadAll()
          renderApp()
        } else {
          toast('초기화 실패', 'error')
        }
      })
    }
    // ─────────────── 📚 지식베이스 핸들러 ───────────────
    // 새 항목 추가 버튼
    document.querySelectorAll('[data-kb-add]').forEach((b) => {
      b.addEventListener('click', () => {
        state.kb.editingDraft = {
          id: '',
          title: '',
          category: 'product',
          content: '',
          tags: '',
          priority: 3,
        }
        renderApp()
        // 폼으로 스크롤
        setTimeout(() => {
          const inp = document.querySelector('[data-kb-field="title"]')
          if (inp) inp.focus()
        }, 50)
      })
    })
    // 시드 데이터 주입
    document.querySelectorAll('[data-kb-seed]').forEach((b) => {
      b.addEventListener('click', seedKb)
    })
    // 항목 수정 진입
    document.querySelectorAll('[data-kb-edit]').forEach((b) => {
      b.addEventListener('click', () => {
        const id = b.dataset.kbEdit
        const item = state.kb.items.find((it) => it.id === id)
        if (!item) return
        state.kb.editingDraft = {
          id: item.id,
          title: item.title,
          category: item.category,
          content: item.content,
          tags: (item.tags || []).join(', '),
          priority: item.priority,
        }
        renderApp()
        setTimeout(() => {
          document.querySelector('[data-kb-field="title"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 50)
      })
    })
    // 삭제
    document.querySelectorAll('[data-kb-delete]').forEach((b) => {
      b.addEventListener('click', () => {
        deleteKbItem(b.dataset.kbDelete, b.dataset.kbTitle)
      })
    })
    // 폼 입력 추적
    document.querySelectorAll('[data-kb-field]').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        if (!state.kb.editingDraft) return
        state.kb.editingDraft[inp.dataset.kbField] = inp.value
      })
      inp.addEventListener('change', (e) => {
        if (!state.kb.editingDraft) return
        state.kb.editingDraft[inp.dataset.kbField] = inp.value
      })
    })
    // 저장
    const kbSaveBtn = document.querySelector('[data-kb-save]')
    if (kbSaveBtn) {
      kbSaveBtn.addEventListener('click', () => {
        if (!state.kb.editingDraft) return
        saveKbItem(state.kb.editingDraft)
      })
    }
    // 취소
    document.querySelectorAll('[data-kb-cancel]').forEach((b) => {
      b.addEventListener('click', () => {
        state.kb.editingDraft = null
        state.kb.editingId = null
        renderApp()
      })
    })
    // ─────────────── 필터 ───────────────
    document.querySelectorAll('[data-kb-filter]').forEach((el) => {
      const key = el.dataset.kbFilter
      const handler = (e) => {
        if (!state.kb.filter) state.kb.filter = { category: 'all', query: '' }
        state.kb.filter[key] = e.target.value
        renderApp()
        // 검색바 포커스 유지
        if (key === 'query') {
          setTimeout(() => {
            const inp = document.querySelector('[data-kb-filter="query"]')
            if (inp) {
              inp.focus()
              const len = inp.value.length
              inp.setSelectionRange(len, len)
            }
          }, 0)
        }
      }
      el.addEventListener('change', handler)
      if (el.tagName === 'INPUT') el.addEventListener('input', handler)
    })
    // ─────────────── PDF 출처별 일괄 삭제 ───────────────
    document.querySelectorAll('[data-kb-source-delete]').forEach((b) => {
      b.addEventListener('click', () => deleteKbSource(b.dataset.kbSourceDelete))
    })
    // ─────────────── PDF 업로드 버튼 ───────────────
    document.querySelectorAll('[data-kb-pdf-upload]').forEach((b) => {
      b.addEventListener('click', openPdfModal)
    })
    // ─────────────── PDF 모달 핸들러 ───────────────
    attachPdfModalHandlers()
    // 헤더 핸들러 (저장 / 로그아웃)
    attachHeaderHandlers()
  }

  function attachPdfModalHandlers() {
    if (!state.kb.pdfModal) return
    // 오버레이 클릭 = 닫기 (모달 본체 클릭은 무시)
    const overlay = document.querySelector('[data-pdf-overlay]')
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closePdfModal()
      })
    }
    // 닫기/취소 버튼들
    document.querySelectorAll('[data-pdf-cancel]').forEach((b) => {
      b.addEventListener('click', closePdfModal)
    })
    // 파일 선택 영역
    const drop = document.querySelector('[data-pdf-drop]')
    const input = document.getElementById('pdf-file-input')
    if (drop && input) {
      drop.addEventListener('click', () => input.click())
      drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('border-cyan-400') })
      drop.addEventListener('dragleave', () => drop.classList.remove('border-cyan-400'))
      drop.addEventListener('drop', (e) => {
        e.preventDefault()
        drop.classList.remove('border-cyan-400')
        const f = e.dataTransfer.files[0]
        if (f) handlePdfFile(f)
      })
      input.addEventListener('change', (e) => {
        const f = e.target.files[0]
        if (f) handlePdfFile(f)
      })
    }
    // 메타 필드 변경
    document.querySelectorAll('[data-pdf-meta]').forEach((el) => {
      const key = el.dataset.pdfMeta
      const handler = (e) => {
        if (!state.kb.pdfModal) return
        state.kb.pdfModal.meta[key] = e.target.value
        // 청크 크기 변경 시 즉시 재분할 + 포커스 보존
        if (key === 'targetChars') {
          rechunkPdf()
        }
      }
      el.addEventListener('change', handler)
      if (el.type === 'range' || el.tagName === 'INPUT') {
        el.addEventListener('input', handler)
      }
    })
    // 재분할 버튼
    const rechunkBtn = document.querySelector('[data-pdf-rechunk]')
    if (rechunkBtn) rechunkBtn.addEventListener('click', rechunkPdf)
    // 일괄 등록 버튼
    const submitBtn = document.querySelector('[data-pdf-submit]')
    if (submitBtn) submitBtn.addEventListener('click', submitPdfBulk)
  }

  function attachHeaderHandlers() {
    const saveBtn = document.getElementById('save-btn')
    if (saveBtn && !saveBtn.disabled) {
      saveBtn.addEventListener('click', saveAll)
    }
    const logoutBtn = document.getElementById('logout-btn')
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await api('POST', '/api/admin/logout')
        state.authenticated = false
        renderLogin()
      })
    }
  }

  async function saveAll() {
    const keys = Object.keys(state.dirty)
    const dirtySec = state.layout.dirtySections
    const dirtyImg = state.layout.dirtyImages
    const layoutDirty = Object.keys(dirtySec).length + Object.keys(dirtyImg).length
    if (keys.length === 0 && layoutDirty === 0) return
    toast(`${keys.length + layoutDirty}개 항목 저장 중…`, 'info')
    let okCount = 0
    let failCount = 0
    // 1) i18n 키 저장
    for (const key of keys) {
      const values = {}
      LANGS.forEach((l) => {
        values[l.code] = state.dirty[key][l.code] !== undefined
          ? state.dirty[key][l.code]
          : getMerged(l.code, key)
      })
      const r = await api('PUT', '/api/admin/i18n', { key, values })
      if (r.ok) okCount++
      else failCount++
    }
    // 2) Layout 섹션 visibility 저장
    if (Object.keys(dirtySec).length > 0) {
      // 변경된 것만 전송 (서버가 기본값 비교 후 KV 정리)
      const r = await api('PUT', '/api/admin/layout/sections', { sections: dirtySec })
      if (r.ok) okCount += Object.keys(dirtySec).length
      else failCount += Object.keys(dirtySec).length
    }
    // 3) Layout 이미지 슬롯 저장
    if (Object.keys(dirtyImg).length > 0) {
      const r = await api('PUT', '/api/admin/layout/images', { images: dirtyImg })
      if (r.ok) okCount += Object.keys(dirtyImg).length
      else failCount += Object.keys(dirtyImg).length
    }
    state.dirty = {}
    state.layout.dirtySections = {}
    state.layout.dirtyImages = {}
    await loadAll()
    renderApp()
    if (failCount === 0) {
      toast(`${okCount}개 항목 발행 완료 — 실 사이트에 즉시 반영`, 'success')
    } else {
      toast(`${okCount}건 성공 / ${failCount}건 실패`, 'warn')
    }
  }

  // ============================================================
  // 부트
  // ============================================================
  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  async function boot() {
    // 세션 확인
    const r = await api('GET', '/api/admin/me')
    if (r.ok && r.data?.authenticated) {
      state.authenticated = true
      await loadAll()
      renderApp()
    } else {
      renderLogin()
    }
  }

  // 페이지 떠나기 전 경고
  window.addEventListener('beforeunload', (e) => {
    if (dirtyCount() + layoutDirtyCount() > 0) {
      e.preventDefault()
      e.returnValue = '저장하지 않은 변경사항이 있습니다.'
    }
  })

  boot()
})()
