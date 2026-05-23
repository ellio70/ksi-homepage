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
    voiceEnabled: true, // TTS 음성 답변 ON/OFF (localStorage로 영속)
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
      // 음성 토글이 켜져있으면 TTS 재생
      if (STATE.voiceEnabled) speakText(reply)
    } catch (e) {
      loading.remove()
      box.appendChild(
        bubble('assistant', '🛠 일시적인 통신 오류가 발생했어요. 잠시 후 다시 시도해주세요.'),
      )
    } finally {
      STATE.chatBusy = false
    }
  }

  // ---------- Voice (Web Speech API) ----------
  // Text-to-Speech: 마크다운 제거 후 자연스럽게 읽기
  function stripMarkdownForTTS(s) {
    return (s || '')
      .replace(/```[\s\S]*?```/g, ' ')      // code blocks
      .replace(/`([^`]+)`/g, '$1')           // inline code
      .replace(/\*\*([^*]+)\*\*/g, '$1')     // bold
      .replace(/\*([^*]+)\*/g, '$1')         // italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → text only
      .replace(/^#+\s+/gm, '')                // headings
      .replace(/^[-•]\s+/gm, '')              // bullet markers
      .replace(/\|/g, ' ')                    // table separators
      .replace(/[#>_~]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // 언어별 적합한 음성 자동 선택 (여성 우선)
  function pickVoice(lang) {
    if (!('speechSynthesis' in window)) return null
    const voices = window.speechSynthesis.getVoices()
    if (!voices || voices.length === 0) return null
    const langMap = { ko: 'ko', en: 'en', zh: 'zh', ja: 'ja', de: 'de' }
    const target = langMap[lang] || 'ko'
    // 1순위: 같은 언어 + female 키워드
    const femaleHints = ['female', 'woman', '여성', 'Yuna', 'Heami', 'Sora', 'Mei', 'Google', 'Samantha']
    const localized = voices.filter((v) => v.lang.toLowerCase().startsWith(target))
    const female = localized.find((v) => femaleHints.some((h) => v.name.includes(h)))
    if (female) return female
    // 2순위: 같은 언어 첫 번째
    if (localized[0]) return localized[0]
    // 3순위: 영어 폴백
    return voices.find((v) => v.lang.toLowerCase().startsWith('en')) || voices[0]
  }

  function speakText(text) {
    if (!('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel() // 이전 재생 중단
      const clean = stripMarkdownForTTS(text)
      if (!clean) return
      const utter = new SpeechSynthesisUtterance(clean)
      const voice = pickVoice(STATE.lang)
      if (voice) {
        utter.voice = voice
        utter.lang = voice.lang
      } else {
        utter.lang = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP', de: 'de-DE' }[STATE.lang] || 'ko-KR'
      }
      utter.rate = 1.05
      utter.pitch = 1.0
      utter.volume = 1.0
      window.speechSynthesis.speak(utter)
    } catch (e) {
      console.warn('TTS failed', e)
    }
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }

  // Speech-to-Text — 마이크 버튼 클릭 → 음성 → 텍스트
  let recognitionInstance = null
  let recognitionActive = false

  function getSpeechRecognition() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null
  }

  function startListening() {
    const SR = getSpeechRecognition()
    if (!SR) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.\nChrome, Edge, Safari를 사용해주세요.')
      return
    }
    if (recognitionActive) {
      stopListening()
      return
    }
    stopSpeaking() // 이전 TTS 중단

    const rec = new SR()
    rec.lang = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP', de: 'de-DE' }[STATE.lang] || 'ko-KR'
    rec.interimResults = true
    rec.continuous = false
    rec.maxAlternatives = 1

    const input = $('#chat-input')
    const status = $('#chat-mic-status')
    const micBtn = $('#chat-mic')

    rec.onstart = () => {
      recognitionActive = true
      status?.classList.remove('hidden')
      micBtn?.classList.add('mic-recording')
      if (input) input.value = ''
    }

    rec.onresult = (ev) => {
      let interim = ''
      let final = ''
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const transcript = ev.results[i][0].transcript
        if (ev.results[i].isFinal) final += transcript
        else interim += transcript
      }
      if (input) input.value = final || interim
    }

    rec.onerror = (ev) => {
      console.warn('STT error', ev.error)
      recognitionActive = false
      status?.classList.add('hidden')
      micBtn?.classList.remove('mic-recording')
      if (ev.error === 'not-allowed') {
        alert('마이크 권한이 필요합니다. 브라우저 주소창의 자물쇠 아이콘에서 허용해주세요.')
      }
    }

    rec.onend = () => {
      recognitionActive = false
      status?.classList.add('hidden')
      micBtn?.classList.remove('mic-recording')
      const finalText = (input?.value || '').trim()
      if (finalText) {
        if (input) input.value = ''
        sendChat(finalText)
      }
    }

    try {
      rec.start()
      recognitionInstance = rec
    } catch (e) {
      console.warn('STT start failed', e)
      recognitionActive = false
    }
  }

  function stopListening() {
    if (recognitionInstance && recognitionActive) {
      try { recognitionInstance.stop() } catch (e) {}
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

    // ---------- Voice controls ----------
    // 음성 토글 상태 복원 (localStorage)
    try {
      const saved = localStorage.getItem('mrl_voice_enabled')
      if (saved !== null) STATE.voiceEnabled = saved === '1'
    } catch (e) {}
    updateVoiceToggleUI()

    $('#chat-voice-toggle')?.addEventListener('click', () => {
      STATE.voiceEnabled = !STATE.voiceEnabled
      try { localStorage.setItem('mrl_voice_enabled', STATE.voiceEnabled ? '1' : '0') } catch (e) {}
      if (!STATE.voiceEnabled) stopSpeaking()
      updateVoiceToggleUI()
    })

    // 마이크 버튼 → 음성 입력 시작/중단
    $('#chat-mic')?.addEventListener('click', startListening)

    // 챗봇 닫을 때 음성 모두 중단
    $('#chat-close')?.addEventListener('click', () => {
      stopSpeaking()
      stopListening()
    })

    // Safari/iOS: voiceschanged 이벤트로 음성 목록 로드 보장
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {}
    }
  }

  function updateVoiceToggleUI() {
    const btn = $('#chat-voice-toggle')
    if (!btn) return
    const icon = btn.querySelector('i')
    if (!icon) return
    if (STATE.voiceEnabled) {
      icon.className = 'fa-solid fa-volume-high text-sm'
      btn.classList.add('text-ks-cyan')
      btn.classList.remove('text-slate-500')
      btn.setAttribute('title', '음성 답변 켜짐 — 클릭하여 끄기')
    } else {
      icon.className = 'fa-solid fa-volume-xmark text-sm'
      btn.classList.remove('text-ks-cyan')
      btn.classList.add('text-slate-500')
      btn.setAttribute('title', '음성 답변 꺼짐 — 클릭하여 켜기')
    }
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
