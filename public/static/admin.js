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
    view: 'content', // 'content' | 'images'
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
    state.busy = false
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
            ${state.view === 'content' ? contentViewHtml() : imagesViewHtml()}
          </main>
        </div>
      </div>
    `
    attachAppHandlers()
  }

  function headerHtml() {
    const count = dirtyCount()
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
          ${count > 0
            ? `<span class="modified-badge text-xs font-bold px-3 py-1 rounded-full">저장 안 된 변경 ${count}건</span>`
            : `<span class="text-xs text-slate-500">${overrideCount > 0 ? `사용자 편집 ${overrideCount}건 활성` : '모든 텍스트 기본값'}</span>`
          }
          <button id="save-btn" ${count === 0 ? 'disabled' : ''}
            class="px-4 py-2 rounded-lg ${count === 0 ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-bold'} transition text-sm">
            <i class="fa-solid fa-save mr-1"></i>저장하고 발행 (${count})
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
    return `
      <aside class="w-72 glass border-r border-slate-700/50 p-4 overflow-y-auto shrink-0">
        <div class="text-xs uppercase tracking-wider text-slate-500 mb-2 px-2">콘텐츠 섹션</div>
        <div class="space-y-1 mb-6">${itemsHtml}</div>
        <div class="text-xs uppercase tracking-wider text-slate-500 mb-2 px-2">이미지</div>
        <button data-view="images" class="view-btn w-full text-left px-4 py-3 rounded-lg transition ${
          isImageActive ? 'bg-cyan-400/10 border-l-2 border-ks-cyan' : 'hover:bg-slate-800/50 border-l-2 border-transparent'
        }">
          <div class="font-medium ${isImageActive ? 'text-cyan-300' : 'text-slate-200'}">🖼️ 이미지 관리</div>
          <div class="text-xs text-slate-500 mt-0.5">사진 교체 / 복원</div>
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
      b.addEventListener('click', () => {
        state.view = b.dataset.view
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
    if (keys.length === 0) return
    toast(`${keys.length}개 항목 저장 중…`, 'info')
    let okCount = 0
    let failCount = 0
    for (const key of keys) {
      // 5개 언어 값 수집 (dirty + 기존 머지본 폴백)
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
    state.dirty = {}
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
    if (dirtyCount() > 0) {
      e.preventDefault()
      e.returnValue = '저장하지 않은 변경사항이 있습니다.'
    }
  })

  boot()
})()
