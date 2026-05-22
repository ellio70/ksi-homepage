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

  // 키-섹션 그룹 정의 — 사업기획 직무 시야로 의미 있는 단위
  const KEY_GROUPS = [
    {
      id: 'nav',
      label: '🧭 상단 메뉴',
      desc: '데스크탑/모바일/푸터 네비게이션',
      keys: ['nav.about', 'nav.industries', 'nav.solutions', 'nav.roadmap', 'nav.contact', 'nav.lang'],
    },
    {
      id: 'hero',
      label: '🎯 Hero (첫 화면)',
      desc: '메인 타이틀, 부제, CTA 버튼, 배지',
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
      ],
    },
    {
      id: 'industries',
      label: '🏭 Industries · 3개 산업',
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
      id: 'solution',
      label: '🛡️ SentinAI Platform · 솔루션',
      desc: '정의 + 8대 모듈 + See/Hear/Decide + 차별화 비교표',
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
      id: 'contact',
      label: '📨 Contact · 문의하기',
      desc: '연락처 폼 라벨, 안내 문구, 제출 버튼',
      keys: [
        'contact.kicker', 'contact.title', 'contact.subtitle',
        'contact.name', 'contact.company', 'contact.email', 'contact.topic', 'contact.message',
        'contact.submit', 'contact.success', 'contact.error',
        'contact.address', 'contact.email_label', 'contact.phone',
      ],
    },
    {
      id: 'chat',
      label: '💬 SentinAI 챗봇',
      desc: '챗봇 위젯 텍스트',
      keys: [
        'chat.welcome', 'chat.placeholder', 'chat.send',
        'chat.title', 'chat.subtitle',
      ],
    },
    {
      id: 'footer',
      label: '📌 푸터',
      desc: '회사 정보, 카피라이트',
      keys: ['footer.tagline', 'footer.copyright', 'footer.address'],
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
    kb: { items: [], loading: false, editingId: null, editingDraft: null, categories: [] },
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
    company:  '🏢 회사 개요',
    product:  '🛡️ 제품·SentinAI',
    tech:     '⚙️ 기술·특허',
    process:  '📋 도입·절차',
    roadmap:  '🗺️ 로드맵',
    contact:  '📞 연락처',
    faq:      '💬 FAQ',
    etc:      '📦 기타',
  }
  const KB_CATEGORY_ORDER = ['company','product','tech','process','roadmap','contact','faq','etc']

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
            기본 8개 시드 데이터를 한번에 주입할 수도 있습니다.
          </p>
          <div class="flex gap-3 justify-center">
            <button data-kb-seed class="px-5 py-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium text-sm transition">
              <i class="fa-solid fa-seedling mr-1"></i>기본 8개 항목 한번에 추가
            </button>
            <button data-kb-add class="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm transition">
              <i class="fa-solid fa-plus mr-1"></i>직접 추가하기
            </button>
          </div>
        </div>
      `
    } else {
      // 카테고리별 그룹화
      const byCat = {}
      items.forEach((it) => {
        const c = it.category || 'etc'
        if (!byCat[c]) byCat[c] = []
        byCat[c].push(it)
      })
      // 정렬: 카테고리 순서 → priority asc → updated_at desc
      const groupHtml = KB_CATEGORY_ORDER
        .filter((cid) => byCat[cid])
        .map((cid) => {
          const cards = byCat[cid]
            .sort((a, b) => (a.priority - b.priority) || (b.updated_at - a.updated_at))
            .map((it) => kbCardHtml(it))
            .join('')
          return `
            <section>
              <div class="flex items-baseline gap-3 mb-3">
                <h3 class="text-sm font-bold text-cyan-300">${escapeHtml(kbCategoryLabel(cid))}</h3>
                <span class="text-xs text-slate-500">${byCat[cid].length}개</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${cards}</div>
            </section>
          `
        })
        .join('')
      listHtml = `<div class="space-y-8">${groupHtml}</div>`
    }

    return `
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 class="text-2xl font-bold text-slate-100">📚 지식베이스 (RAG)</h2>
            <p class="text-sm text-slate-400 mt-1">
              SentinAI 챗봇이 답변할 때 참조할 자료를 관리합니다.
              질문이 들어오면 키워드 기반으로 가장 관련 있는 항목 <b class="text-cyan-300">상위 4개</b>를 자동으로 LLM에 전달합니다.
            </p>
          </div>
          ${items.length > 0 ? `
            <div class="flex gap-2 shrink-0">
              <button data-kb-add class="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm transition">
                <i class="fa-solid fa-plus mr-1"></i>새 항목
              </button>
            </div>
          ` : ''}
        </div>

        ${editorHtml}
        ${listHtml}
      </div>
    `
  }

  function kbCardHtml(it) {
    const tagsHtml = (it.tags || []).slice(0, 6).map((t) => {
      return `<span class="text-[10px] px-2 py-0.5 rounded bg-slate-700/50 text-slate-300">#${escapeHtml(t)}</span>`
    }).join('')
    const preview = (it.content || '').replace(/[#*`_>\-]/g, '').slice(0, 120)
    const updated = it.updated_at ? new Date(it.updated_at).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }) : ''
    return `
      <div class="glass rounded-xl p-4 flex flex-col gap-2">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-bold">P${it.priority}</span>
              <code class="text-[10px] text-slate-500 truncate">${escapeHtml(it.id)}</code>
            </div>
            <h4 class="text-sm font-bold text-slate-100 break-words">${escapeHtml(it.title)}</h4>
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
    // 헤더 핸들러 (저장 / 로그아웃)
    attachHeaderHandlers()
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
