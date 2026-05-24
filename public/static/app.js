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

  // 현재 아바타 성별 읽기 (localStorage 기준, 기본 female)
  function getAvatarGender() {
    try {
      const g = localStorage.getItem('sentinai_avatar_gender')
      return g === 'male' ? 'male' : 'female'
    } catch (e) { return 'female' }
  }

  // 보이스 로딩 비동기 대응: voiceschanged 이벤트로 워밍업
  let _voicesWarm = false
  function warmVoices() {
    if (!('speechSynthesis' in window)) return
    const v = window.speechSynthesis.getVoices()
    if (v && v.length) { _voicesWarm = true; return }
    window.speechSynthesis.addEventListener('voiceschanged', () => { _voicesWarm = true }, { once: true })
  }
  warmVoices()

  // 보이스명에서 성별 추정 (이름 힌트 + 휴리스틱)
  const MALE_HINTS = [
    'male', ' man', '남성', '남자',
    // Apple (mac/iOS)
    'Daniel', 'Fred', 'Aaron', 'Alex', 'Tom', 'Otoya', 'Hattori', 'Junior',
    // Microsoft Windows
    'InJoon', 'Mark', 'David', 'George', 'Hayden', 'Ravi', 'Sean', 'Liang', 'Kangkang', 'Ichiro', 'Stefan',
    // Google (드물지만 명시되는 경우)
    'Standard-C', 'Standard-D', 'Wavenet-C', 'Wavenet-D',
  ]
  const FEMALE_HINTS = [
    'female', 'woman', '여성', '여자',
    // Apple
    'Yuna', 'Samantha', 'Karen', 'Victoria', 'Tessa', 'Kyoko', 'Ting-Ting',
    // Microsoft
    'Heami', 'SunHi', 'Heera', 'Ayumi', 'Haruka', 'Huihui', 'Yaoyao', 'Tracy', 'Katja', 'Hedda',
    // Google
    'Standard-A', 'Standard-B', 'Wavenet-A', 'Wavenet-B',
  ]

  function isMaleVoice(v) {
    const n = (v.name || '').toLowerCase()
    return MALE_HINTS.some((h) => n.includes(h.toLowerCase()))
  }
  function isFemaleVoice(v) {
    const n = (v.name || '').toLowerCase()
    return FEMALE_HINTS.some((h) => n.includes(h.toLowerCase()))
  }

  // 언어별·성별별 적합한 음성 자동 선택
  // 반환: { voice, matched } — matched=false 이면 원하는 성별을 못 찾고 폴백한 것
  function pickVoice(lang, gender) {
    if (!('speechSynthesis' in window)) return { voice: null, matched: false }
    const voices = window.speechSynthesis.getVoices()
    if (!voices || voices.length === 0) return { voice: null, matched: false }
    const langMap = { ko: 'ko', en: 'en', zh: 'zh', ja: 'ja', de: 'de' }
    const target = langMap[lang] || 'ko'
    const localized = voices.filter((v) => v.lang.toLowerCase().startsWith(target))

    const wantMale = gender === 'male'
    const matches = (v) => wantMale ? isMaleVoice(v) : isFemaleVoice(v)
    const antiMatches = (v) => wantMale ? isFemaleVoice(v) : isMaleVoice(v)

    // 1순위: 같은 언어 + 원하는 성별 명시 매치
    const wanted = localized.find(matches)
    if (wanted) return { voice: wanted, matched: true }

    // 2순위: 같은 언어, 반대 성별이 아니면서 default 가 아닌 보이스 (시스템 보이스 우선)
    const neutralLocal = localized.find((v) => !antiMatches(v))
    if (neutralLocal && !antiMatches(neutralLocal)) return { voice: neutralLocal, matched: false }

    // 3순위: 영어권에서 원하는 성별 매치 (영어 보이스는 성별 표기가 명확함)
    const englishMatched = voices.filter((v) => v.lang.toLowerCase().startsWith('en')).find(matches)
    if (englishMatched) return { voice: englishMatched, matched: true }

    // 4순위: 같은 언어 첫 번째 (성별 보장 못함)
    if (localized[0]) return { voice: localized[0], matched: false }
    // 5순위: 영어 폴백
    const en = voices.find((v) => v.lang.toLowerCase().startsWith('en'))
    return { voice: en || voices[0], matched: false }
  }

  function speakText(text) {
    if (!('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel() // 이전 재생 중단
      const clean = stripMarkdownForTTS(text)
      if (!clean) return
      const utter = new SpeechSynthesisUtterance(clean)
      const gender = getAvatarGender()
      const { voice, matched } = pickVoice(STATE.lang, gender)
      if (voice) {
        utter.voice = voice
        utter.lang = voice.lang
      } else {
        utter.lang = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP', de: 'de-DE' }[STATE.lang] || 'ko-KR'
      }
      utter.rate = 1.05
      // 피치 전략:
      // - 성별 매치 성공 → 자연스러운 1.0
      // - 남성 원했으나 폴백(여성 보이스) → 0.55로 강하게 톤다운
      // - 여성 원했으나 폴백(남성 보이스) → 1.4로 톤업
      if (gender === 'male') {
        utter.pitch = matched ? 1.0 : 0.55
      } else {
        utter.pitch = matched ? 1.0 : 1.4
      }
      utter.volume = 1.0
      window.speechSynthesis.speak(utter)
      // 디버그: 마지막 발화 메타 노출
      window.__sentinaiLastVoice = {
        voice: voice ? voice.name : null,
        lang: voice ? voice.lang : null,
        gender, matched, pitch: utter.pitch,
      }
    } catch (e) {
      console.warn('TTS failed', e)
    }
  }

  // 콘솔 디버그용 — F12에서 __sentinaiVoiceDebug() 호출하면 현재 환경 진단 출력
  window.__sentinaiVoiceDebug = function () {
    const all = window.speechSynthesis.getVoices()
    const ko = all.filter((v) => v.lang.toLowerCase().startsWith('ko'))
    console.group('🎙️ SentinAI Voice Debug')
    console.log('전체 보이스 수:', all.length)
    console.log('한국어 보이스:', ko.map((v) => v.name + ' | ' + v.lang))
    console.log('한국어 남성 후보:', ko.filter(isMaleVoice).map((v) => v.name))
    console.log('한국어 여성 후보:', ko.filter(isFemaleVoice).map((v) => v.name))
    console.log('현재 아바타 성별:', getAvatarGender())
    console.log('마지막 발화 메타:', window.__sentinaiLastVoice)
    console.groupEnd()
    return ko.map((v) => v.name + ' | ' + v.lang)
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

  // 이전 STT 인스턴스를 깨끗이 폐기 (재시작 안전성)
  function resetRecognition() {
    if (recognitionInstance) {
      try { recognitionInstance.onstart = null } catch (e) {}
      try { recognitionInstance.onresult = null } catch (e) {}
      try { recognitionInstance.onerror = null } catch (e) {}
      try { recognitionInstance.onend = null } catch (e) {}
      try { recognitionInstance.abort() } catch (e) {}
    }
    recognitionInstance = null
    recognitionActive = false
    $('#chat-mic-status')?.classList.add('hidden')
    $('#chat-mic')?.classList.remove('mic-recording')
  }

  function startListening() {
    const SR = getSpeechRecognition()
    if (!SR) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.\nChrome, Edge, Safari를 사용해주세요.')
      return
    }

    // 이미 녹음 중이면 토글로 중단
    if (recognitionActive) {
      stopListening()
      return
    }

    // 이전 인스턴스가 살아있을 가능성 → 강제 폐기
    resetRecognition()

    // TTS 강제 중단 (마이크와 스피커 충돌 방지)
    stopSpeaking()

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
      console.warn('STT error:', ev.error)
      recognitionActive = false
      status?.classList.add('hidden')
      micBtn?.classList.remove('mic-recording')
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        alert('마이크 권한이 필요합니다.\n브라우저 주소창의 🔒 아이콘에서 마이크 허용을 확인해주세요.')
      } else if (ev.error === 'no-speech') {
        // 음성 미감지 — 무음 시 흔히 발생, 조용히 종료
      } else if (ev.error === 'aborted') {
        // 사용자가 의도적으로 중단 — 무시
      } else {
        console.warn('Unhandled STT error:', ev.error)
      }
    }

    rec.onend = () => {
      const finalText = (input?.value || '').trim()
      recognitionActive = false
      status?.classList.add('hidden')
      micBtn?.classList.remove('mic-recording')
      // 다음 시작을 위해 인스턴스 핸들 정리
      recognitionInstance = null
      if (finalText) {
        if (input) input.value = ''
        sendChat(finalText)
      }
    }

    // start() 호출 — InvalidStateError 시 한 번 더 정리 후 재시도
    try {
      recognitionInstance = rec
      rec.start()
    } catch (e) {
      console.warn('STT start failed, resetting and retrying:', e?.name, e?.message)
      resetRecognition()
      // 50ms 후 재시도 (브라우저 내부 상태 정리 대기)
      setTimeout(() => {
        try {
          const rec2 = new SR()
          rec2.lang = rec.lang
          rec2.interimResults = true
          rec2.continuous = false
          rec2.maxAlternatives = 1
          rec2.onstart = rec.onstart
          rec2.onresult = rec.onresult
          rec2.onerror = rec.onerror
          rec2.onend = rec.onend
          recognitionInstance = rec2
          rec2.start()
        } catch (e2) {
          console.error('STT retry also failed:', e2)
          alert('마이크를 시작할 수 없습니다. 페이지를 새로고침하거나 다른 탭의 마이크 사용을 닫아주세요.')
          resetRecognition()
        }
      }, 80)
    }
  }

  function stopListening() {
    if (recognitionInstance) {
      try { recognitionInstance.stop() } catch (e) {
        try { recognitionInstance.abort() } catch (e2) {}
      }
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
      const fd = new FormData(form)
      // 체크박스는 FormData에서 빠지면 false. on이면 true 변환.
      const data = {
        name: fd.get('name') || '',
        company: fd.get('company') || '',
        email: fd.get('email') || '',
        phone: fd.get('phone') || '',
        topic: fd.get('topic') || '',
        message: fd.get('message') || '',
        privacy_consent: fd.get('privacy_consent') === 'on',
        marketing_opt_in: fd.get('marketing_opt_in') === 'on',
        lang: STATE.lang || 'ko',
      }
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
          // 서버에서 구체 사유 알려주면 매핑
          const errKey = json?.error || 'server_error'
          const errMsgMap = {
            invalid_phone: t('contact.form_error_phone') || '올바른 휴대폰 번호를 입력해주세요.',
            invalid_email: t('contact.form_error_email') || '올바른 이메일을 입력해주세요.',
            privacy_consent_required: t('contact.form_error_privacy') || '개인정보 수집·이용에 동의해주세요.',
            missing_fields: t('contact.form_error_missing') || '필수 항목을 입력해주세요.',
          }
          status.textContent = errMsgMap[errKey] || t('contact.form_error')
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
    // 성별 변경 시 진행 중인 TTS 중단 → 다음 발화부터 새 보이스 적용
    try { if ('speechSynthesis' in window) window.speechSynthesis.cancel() } catch (e) {}
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
