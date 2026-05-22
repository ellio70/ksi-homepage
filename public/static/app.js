// =====================================================
// KS Industry Marine Robotics Lab — Client App
// i18n + Chat (MARIN) + Contact form + UI behaviors
// =====================================================

(function () {
  'use strict'

  // ---------- State ----------
  const STATE = {
    lang: 'ko',
    langs: [],
    dict: {},
    chatOpen: false,
    chatHistory: [], // [{role, content}]
    chatBusy: false,
  }

  const LS_KEY_LANG = 'mrl_lang'

  // ---------- Utils ----------
  const $ = (sel, root) => (root || document).querySelector(sel)
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel))

  function detectBrowserLang() {
    const saved = localStorage.getItem(LS_KEY_LANG)
    if (saved) return saved
    const nav = (navigator.language || 'ko').toLowerCase()
    if (nav.startsWith('ko')) return 'ko'
    if (nav.startsWith('zh')) return 'zh'
    if (nav.startsWith('ja')) return 'ja'
    if (nav.startsWith('de') || nav.startsWith('fr') || nav.startsWith('es') || nav.startsWith('it') || nav.startsWith('nl')) return 'de'
    return 'en'
  }

  function t(key) {
    const d = STATE.dict[STATE.lang] || STATE.dict.en || {}
    return d[key] != null ? d[key] : key
  }

  function applyI18n() {
    // text
    $$('[data-i18n]').forEach((el) => {
      const k = el.getAttribute('data-i18n')
      const v = t(k)
      if (v != null) el.textContent = v
    })
    // html (allowed: title etc.)
    $$('[data-i18n-html]').forEach((el) => {
      const k = el.getAttribute('data-i18n-html')
      const v = t(k)
      if (v != null) el.innerHTML = v
    })
    // placeholders
    $$('[data-i18n-placeholder]').forEach((el) => {
      const k = el.getAttribute('data-i18n-placeholder')
      const v = t(k)
      if (v != null) el.setAttribute('placeholder', v)
    })
    // html lang
    document.documentElement.setAttribute('lang', STATE.lang)
  }

  // ---------- Load i18n dict ----------
  async function loadI18n() {
    try {
      const res = await fetch('/api/i18n')
      const data = await res.json()
      STATE.langs = data.langs || []
      STATE.dict = data.dict || {}
    } catch (e) {
      console.error('Failed to load i18n', e)
    }
  }

  function buildLangMenu() {
    const menu = $('#lang-menu')
    if (!menu || !STATE.langs.length) return
    menu.innerHTML = ''
    STATE.langs.forEach((l) => {
      const btn = document.createElement('button')
      btn.className =
        'w-full text-left px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-3 ' +
        (STATE.lang === l.code ? 'text-ks-cyan' : 'text-slate-200')
      btn.innerHTML = `<span class="text-[11px] font-mono opacity-70 w-7">${l.flag}</span><span>${l.label}</span>`
      btn.addEventListener('click', () => {
        setLang(l.code)
        menu.classList.add('hidden')
      })
      menu.appendChild(btn)
    })
  }

  function setLang(code) {
    if (!STATE.dict[code]) return
    STATE.lang = code
    localStorage.setItem(LS_KEY_LANG, code)
    const cur = $('#lang-current')
    if (cur) {
      const found = STATE.langs.find((l) => l.code === code)
      cur.textContent = found ? found.flag : code.toUpperCase()
    }
    applyI18n()
    buildLangMenu()
    // refresh welcome message in chat to current language if empty/initial
    if (STATE.chatHistory.length === 0) renderChat()
  }

  // ---------- Reveal on scroll ----------
  function initReveal() {
    const els = $$('.reveal')
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible')
            io.unobserve(en.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    els.forEach((e) => io.observe(e))
  }

  // ---------- Nav toggles ----------
  function initNav() {
    const langBtn = $('#lang-button')
    const langMenu = $('#lang-menu')
    langBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      langMenu?.classList.toggle('hidden')
    })
    document.addEventListener('click', (e) => {
      if (!langMenu?.contains(e.target) && !langBtn?.contains(e.target)) {
        langMenu?.classList.add('hidden')
      }
    })

    const mob = $('#mobile-menu')
    $('#mobile-menu-btn')?.addEventListener('click', () => mob?.classList.toggle('hidden'))
    $$('#mobile-menu a').forEach((a) => a.addEventListener('click', () => mob?.classList.add('hidden')))
  }

  // ---------- Chat ----------
  function openChat() {
    STATE.chatOpen = true
    $('#chat-panel')?.classList.remove('hidden')
    if (STATE.chatHistory.length === 0) renderChat()
    setTimeout(() => $('#chat-input')?.focus(), 50)
  }
  function closeChat() {
    STATE.chatOpen = false
    $('#chat-panel')?.classList.add('hidden')
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  }

  // Lightweight markdown → HTML (bold, italic, code, links, line breaks)
  function mdToHtml(src) {
    let s = escapeHtml(src)
    s = s.replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1 rounded text-[12px]">$1</code>')
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>')
    s = s.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" class="underline text-ks-cyan">$1</a>')
    s = s.replace(/\n/g, '<br/>')
    return s
  }

  function bubble(role, content, isLoading) {
    const wrap = document.createElement('div')
    wrap.className =
      'flex ' + (role === 'user' ? 'justify-end' : 'justify-start') + ' animate-[fadeIn_.3s_ease]'
    const inner = document.createElement('div')
    inner.className =
      'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ' +
      (role === 'user' ? 'bubble-user rounded-br-md' : 'bubble-bot rounded-bl-md')
    if (isLoading) {
      inner.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>'
    } else {
      inner.innerHTML = mdToHtml(content)
    }
    wrap.appendChild(inner)
    return wrap
  }

  function renderChat() {
    const box = $('#chat-messages')
    if (!box) return
    box.innerHTML = ''

    // Welcome bubble if empty
    if (STATE.chatHistory.length === 0) {
      box.appendChild(bubble('assistant', t('chat.welcome')))
    } else {
      STATE.chatHistory.forEach((m) => box.appendChild(bubble(m.role, m.content)))
    }
    box.scrollTop = box.scrollHeight
  }

  async function sendChat(text) {
    if (!text || STATE.chatBusy) return
    STATE.chatBusy = true

    const box = $('#chat-messages')
    STATE.chatHistory.push({ role: 'user', content: text })
    box.appendChild(bubble('user', text))

    // loading bubble
    const loading = bubble('assistant', '', true)
    box.appendChild(loading)
    box.scrollTop = box.scrollHeight

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: STATE.chatHistory,
          lang: STATE.lang,
        }),
      })
      const data = await res.json()
      loading.remove()
      const reply = data?.reply || '...'
      STATE.chatHistory.push({ role: 'assistant', content: reply })
      box.appendChild(bubble('assistant', reply))
      box.scrollTop = box.scrollHeight
    } catch (e) {
      loading.remove()
      box.appendChild(
        bubble('assistant', '🛠 일시적인 통신 오류가 발생했어요. 잠시 후 다시 시도해주세요.'),
      )
    } finally {
      STATE.chatBusy = false
    }
  }

  function initChat() {
    $('#chat-launcher')?.addEventListener('click', () => (STATE.chatOpen ? closeChat() : openChat()))
    $('#chat-close')?.addEventListener('click', closeChat)
    $('#open-chat-hero')?.addEventListener('click', openChat)
    $('#open-chat-contact')?.addEventListener('click', openChat)

    $('#chat-form')?.addEventListener('submit', (e) => {
      e.preventDefault()
      const input = $('#chat-input')
      const text = (input.value || '').trim()
      if (!text) return
      input.value = ''
      sendChat(text)
    })

    $$('#chat-suggestions .suggestion').forEach((btn) => {
      btn.addEventListener('click', () => {
        openChat()
        const text = btn.textContent.trim()
        sendChat(text)
      })
    })
  }

  // ---------- Contact form ----------
  function initContactForm() {
    const form = $('#contact-form')
    if (!form) return
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const status = $('#contact-status')
      const data = Object.fromEntries(new FormData(form).entries())
      status.classList.remove('hidden', 'text-emerald-400', 'text-rose-400')
      status.textContent = '...'
      status.classList.add('text-slate-300')

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const json = await res.json()
        if (json?.ok) {
          status.textContent = t('contact.form_success')
          status.classList.remove('text-slate-300', 'text-rose-400')
          status.classList.add('text-emerald-400')
          form.reset()
        } else {
          status.textContent = t('contact.form_error')
          status.classList.remove('text-slate-300', 'text-emerald-400')
          status.classList.add('text-rose-400')
        }
      } catch (e) {
        status.textContent = t('contact.form_error')
        status.classList.remove('text-slate-300', 'text-emerald-400')
        status.classList.add('text-rose-400')
      }
    })
  }

  // ---------- Boot ----------
  document.addEventListener('DOMContentLoaded', async () => {
    await loadI18n()
    STATE.lang = STATE.dict[detectBrowserLang()] ? detectBrowserLang() : 'en'
    setLang(STATE.lang)
    buildLangMenu()
    initReveal()
    initNav()
    initChat()
    initContactForm()
  })
})()

// =====================================================
// Avatar Gender Toggle (Female / Male)
// =====================================================
;(function () {
  const LS_KEY = 'sentinai_avatar_gender'
  const AVATARS = {
    female: '/static/images/sentinai-avatar-female.jpg',
    male: '/static/images/sentinai-avatar-male.jpg',
  }

  function applyAvatar(gender) {
    if (!AVATARS[gender]) gender = 'female'
    const src = AVATARS[gender]
    ;['chat-launcher-avatar', 'chat-header-avatar', 'chat-hero-avatar'].forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      if (id === 'chat-hero-avatar') {
        el.classList.add('avatar-swapping')
        setTimeout(() => {
          el.src = src
          el.classList.remove('avatar-swapping')
        }, 200)
      } else {
        el.src = src
      }
    })
    document.querySelectorAll('.avatar-toggle').forEach((btn) => {
      if (btn.dataset.gender === gender) {
        btn.classList.add('avatar-toggle-active')
      } else {
        btn.classList.remove('avatar-toggle-active')
      }
    })
    try { localStorage.setItem(LS_KEY, gender) } catch (e) {}
  }

  function initAvatarToggle() {
    document.querySelectorAll('.avatar-toggle').forEach((btn) => {
      btn.addEventListener('click', () => applyAvatar(btn.dataset.gender))
    })
    let saved = 'female'
    try { saved = localStorage.getItem(LS_KEY) || 'female' } catch (e) {}
    applyAvatar(saved)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAvatarToggle)
  } else {
    initAvatarToggle()
  }
})()
