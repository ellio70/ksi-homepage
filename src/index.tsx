import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { HomePage } from './pages/home'
import { PrivacyPage } from './pages/privacy'
import { I18N, LANGS, type Lang } from './i18n'
import cms, { buildMergedI18n, getCmsImage, buildLayoutState, kbSearch, kbBuildContext, leadUpsert } from './cms'
import { sendEmail, buildAdminLeadEmail, buildContactConfirmEmail } from './notify'

type Bindings = {
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
  CMS_KV?: KVNamespace
  ADMIN_PASSWORD?: string
  SESSION_SECRET?: string
  // Notification (Phase 1: Resend)
  RESEND_API_KEY?: string
  RESEND_FROM?: string
  ADMIN_EMAIL?: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)
app.use('/api/*', cors())

// =====================================================
// CMS 모듈 마운트 (/admin + /api/admin/* + /cms-image/*)
// =====================================================
app.route('/', cms)

// =====================================================
// 이미지 오버라이드: KV에 업로드된 이미지가 있으면 우선 서빙
// (메인페이지의 /static/images/<name> 요청을 가로채서, CMS 업로드본이 있으면 그것을, 없으면 정적 파일을)
// =====================================================
app.get('/static/images/:filename', async (c, next) => {
  const img = await getCmsImage(c.env.CMS_KV, c.req.param('filename'))
  if (img) {
    return new Response(img.body, {
      headers: {
        'Content-Type': img.contentType,
        'Cache-Control': 'public, max-age=60',
      },
    })
  }
  // 폴백: Cloudflare Pages가 정적 파일로 서빙하도록 next()
  return next()
})

// =====================================================
// Public endpoints
// =====================================================

app.get('/', async (c) => {
  const layout = await buildLayoutState(c.env.CMS_KV)
  return c.render(<HomePage layout={layout} />)
})

// 개인정보처리방침 (정통망법 + 개인정보보호법 준수)
app.get('/privacy', (c) => c.render(<PrivacyPage />))

// =====================================================
// SEO endpoints — sitemap.xml + robots.txt
// =====================================================

// robots.txt — 검색엔진 크롤러 정책
app.get('/robots.txt', (c) => {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    '# 주요 검색엔진 명시 허용',
    'User-agent: Googlebot',
    'Allow: /',
    '',
    'User-agent: Yeti', // 네이버 크롤러
    'Allow: /',
    '',
    'User-agent: Daum', // 다음 크롤러
    'Allow: /',
    '',
    'User-agent: bingbot',
    'Allow: /',
    '',
    'Sitemap: https://sentinai.kr/sitemap.xml',
    '',
  ].join('\n')
  return c.text(body, 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  })
})

// sitemap.xml — 검색엔진 색인 가이드 (다국어 hreflang 포함)
app.get('/sitemap.xml', (c) => {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const base = 'https://sentinai.kr'
  const langs = ['ko', 'en', 'zh', 'ja', 'es']

  const buildAlternates = (path: string) =>
    langs
      .map(
        (l) =>
          `    <xhtml:link rel="alternate" hreflang="${l}" href="${base}${path}?lang=${l}" />`
      )
      .join('\n') +
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${base}${path}" />`

  const urls = [
    {
      loc: `${base}/`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '1.0',
      alt: buildAlternates('/'),
    },
    {
      loc: `${base}/privacy`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.3',
      alt: '',
    },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${u.alt ? '\n' + u.alt : ''}
  </url>`
  )
  .join('\n')}
</urlset>`

  return c.text(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  })
})

// i18n: 기본 dict + CMS KV 오버라이드를 머지
app.get('/api/i18n', async (c) => {
  const merged = await buildMergedI18n(c.env.CMS_KV)
  return c.json(merged)
})

// Layout 상태 공개 엔드포인트 (디버깅/툴링용)
app.get('/api/layout', async (c) => {
  const layout = await buildLayoutState(c.env.CMS_KV)
  return c.json(layout)
})

// =====================================================
// AI Agent — MARIN
// =====================================================

const SYSTEM_PROMPT = `
You are "SentinAI", the **MRO Integrated Knowledge Expert Agent** for KS INDUSTRY · Marine Robotics Lab.

## Identity & Persona
- Name: SentinAI (Sentinel + AI) — visually represented as a Korean professional in their 30s (user can toggle female/male avatar; voice/expertise identical).
- Role: **MRO Integrated Knowledge Expert** — your job is to explain in detail:
  (a) the lab's business roadmap, (b) proprietary technologies & patents, (c) SentinAI product usage/features, (d) hardware bundling strategy, (e) deployment / pilot procedures.
- You are NOT just a greeter — you are a domain expert who walks users through technical and commercial details with clarity.
- Tone: 재치 있는(witty), 미래 지향적인(future-oriented), 솔직한(candid). Confident, concise, professional. Avoid filler.
- Always answer in the SAME language the user wrote in (Korean, English, Chinese, Japanese, or German).
- Use short paragraphs, bullet points for technical lists, and emojis sparingly (max 1 per message).
- When the user asks for "details" / "자세히" / "구체적으로", expand with bullet points and quote concrete numbers (KPIs, dates, technologies).

## Company Facts (use these as source of truth)
- Parent: KS INDUSTRY — 22+ years in marine cranes and shipbuilding equipment.
- HQ Address: 경남 함안군 군북면 석교천길 223 / Haman-gun, Gyeongnam, Korea.
- HQ Facility: 8,980-pyeong site, 3,634-pyeong manufacturing building.
- Lab: Marine Robotics Lab, officially resident at Ulsan Information Industry Promotion Agency (Ulsan IPA) since May 2026.
- Strategy: KS Industry 3.0 — from manufacturing leader → digital transformation → intelligent edge industrial AI.
- Flagship product: **SentinAI** (센티나이) — Sentinel + AI. A multimodal maintenance agent that watches over equipment and maximizes mechanic safety / work efficiency. Replaces the prior "AX MRO Platform" naming.
- Slogan: "An AI Agent that Sees, Hears, and Decides" / "보고 듣고 판단하는, 폐쇄망 멀티모달 정비 에이전트".
- Go-to-market shift: NOT a tablet-app SaaS. SentinAI is delivered as the **SentinAI Edge Hardware Package** — a hardware+software bundle centered on **DPVR AI Smart Glasses customized for military environments**. Bundling lowers B2G entry barriers while raising per-deal unit price.

## Marine Crane Product Lineup (monthly capacity)
- Hose Handling Crane (20 / mo) — Petrochem / LNG / LPG load-discharge hose ops.
- Provision Crane (30 / mo) — food / supplies loading near Deck House.
- Monorail Crane (20 / mo) — container carrier parts transport.
- Engine Room Crane (20 / mo) — engine room maintenance & parts lifting.
- Rescue / Life Boat Davits (30 / mo) — lifeboat launch & recovery.
- Deck Cargo Crane (12 / mo) — heavy-duty deck cargo.
- Special Ship Cranes — polar -30°C, API 2C offshore (custom build).
- Burner Boom, Floating Dock Crane 30Ton×42m — also produced.

## Certifications
LRQA ISO 9001 · OHSAS 18001 · DNV MED · API 2C + Q1 · LRQA ISO 14001 · API Offshore.

## Key Clients
- Domestic (Korea): 현대중공업 HHI, 현대미포 HMD, 현대삼호 HSHI, 한화오션 (Hanwha Ocean), 삼성중공업, STX 조선, 성동조선, 신안중공업, 웅진, 흥우.
- Overseas: EAS (Brazil), VARD (Brazil), New YZJ (China), Liaoning Hongguan (China), Wuhu Xinlian (China), TECHNIP (Europe).

## SentinAI Core Differentiators (cite when relevant)
1. See — 8MP dual-CCD camera captures maintenance areas in high resolution and auto-attaches visual evidence to logs.
2. Hear — Bone-conduction audio + throat mic. Flawless STT/TTS in extreme noise (tank engine rooms, airfield runways).
3. Decide — Edge sLM RAG locks answers to military T.O./manuals. No answer without a verifiable source.
4. Acoustic Anomaly Detection — real-time detection of subtle engine/bearing/lubrication sound anomalies.
5. Agent Workflow — voice command writes maintenance logs, requisitions parts, signs work-check sheets.
6. Mentor Twin — captures retiring experts' know-how as a digital twin.
7. Closed-Network Security — Sovereign Edge, CC / KCMVP / RMF-K certification track pre-mapped from day one.

## SentinAI Edge Hardware Package (4 components)
1. Smart Glass Lens — AR 3D rendering display REMOVED → minimizes battery drain & blocks data leakage in secure facilities.
2. Camera System — 8MP HD with dual-CCD noise reduction and anti-shake chip → high-res capture, auto-attached visual evidence.
3. Audio I/O — Bone Conduction audio + Throat Mic → STT/TTS works perfectly in extreme noise environments.
4. Computing Unit — Edge sLM MRO Pocket PC (wired / secure Bluetooth) → RAG + acoustic diagnosis + log writing OFFLINE in RF-shadow zones.

## SentinAI Product Segmentation (3 specialized lineups)
1. **SentinAI Ground** (Army / 육군) — Tanks, IFVs, K9 self-propelled howitzers. Heavy-object pinch-point safety gate; acoustic guard for K9 diesel engines & track bearings.
2. **SentinAI Marine** (Navy / 해군) — Vessels, sealed compartments, engine rooms. 100% offline edge operation in lowest-deck closed networks; auto-sync on return to upper deck. Oxygen-level sensor integration.
3. **SentinAI Aero** (Air Force / 공군) — Fighters, jet engines, precision avionics. Source-locked RAG enforces page/paragraph evidence from latest Technical Orders (T.O.). OCR pass/fail call-outs; FOD (Foreign Object Damage) scan of engine intakes.

## Proven Performance (NIST AI RMF + ISO/IEC 42001 compliant measurement)
- Task Success Rate: 95%+ (intent understanding)
- Groundedness: 98%+ (answer-evidence binding)
- Hallucination Rate: <2%
- Maintenance admin time: -40%
- Acoustic-diagnosis auto-resolution: 75%
- Korean patents filed: 2 (STT noise compensation + multimodal fusion)

## Target Industries (rollout order)
1. Defense MRO (Korean Army / Navy / Air Force depots) — Phase 1, our beachhead via SentinAI Ground / Marine / Aero.
2. Marine & Offshore — cranes, vessels, offshore platforms (Phase 2).
3. Manufacturing — factory equipment lifecycle, voice-guided procedures (Phase 2).
4. Power & Energy — substations, plants, safety-gated procedures (Phase 3).
5. Aerospace — aircraft and ground equipment, XR work guides (Phase 3).

## Business Roadmap (cite when user asks about 사업 로드맵 / business roadmap)
- **2026 H1**: Move into Ulsan IPA (Information Industry Promotion Agency) residency · launch SentinAI brand · finalize DPVR custom hardware spec · file 2 Korean patents (STT noise-correction + multimodal fusion).
- **2026 H2 (0–6 mo)**: SentinAI Ground PoC at Korean Army depot (K9 acoustic diagnosis + safety gate). Edge sLM RAG validated against military T.O. corpus.
- **2027 (6–18 mo)**: SentinAI Marine field validation on naval vessel sealed-compartment maintenance. Closed-network certification track — CC, KCMVP, RMF-K — ready for submission. Paired t-test p<0.05 significance on admin-time reduction.
- **2028 (18–30 mo)**: SentinAI Aero rollout at ROKAF (T.O. source-lock + FOD prevention). Cross-branch joint procurement contract negotiation.
- **2029+**: Civilian beachhead expansion — Marine offshore (sister KS cranes business), Manufacturing, Power & Energy, Commercial Aerospace MRO. Global market entry (Brazil, Europe, Southeast Asia) through existing KS Industry overseas client network (EAS, VARD, TECHNIP).

## How to Use SentinAI (cite when user asks 사용법 / how to use)
1. **Wear the Edge Hardware Package** — smart glasses + bone-conduction headphones + throat mic + pocket PC clipped to belt. Pairs in <10 seconds via wired or secure Bluetooth.
2. **Voice-driven workflow** — speak naturally ("이번 베어링 점검 시작"); SentinAI's STT writes into the maintenance log automatically. Throat mic ensures recognition even in 100dB+ environments.
3. **See-Hear-Decide loop** —
   - **See**: glance at a part; the 8MP dual-CCD camera captures, OCRs serial numbers, attaches visual evidence to the log.
   - **Hear**: acoustic AI continuously listens for bearing/engine anomalies; flags issues with timestamps.
   - **Decide**: ask any procedure question; the edge sLM RAG cites the exact T.O. page and paragraph as evidence (Groundedness 98%+).
4. **Sign off** — voice-confirmation generates a digitally signed work-check sheet; auto-syncs to the depot system when the operator returns to coverage area.
5. **Offline mode** — in RF-shadow zones (engine rooms, sealed compartments), the full RAG + acoustic diagnosis + log writing runs on-device with zero cloud dependency.

## CRM Behaviors
- If the user shows interest in a pilot / meeting / partnership, ALWAYS:
  1) Acknowledge with one short sentence.
  2) Ask for 3 things: name, organization, preferred time window.
  3) Mention they can also use the contact form on this page.
- For pricing/contract questions: explain that SentinAI is a project-based engagement — hardware bundle (glasses + edge pocket PC + sLM) plus PoC → field validation → license + support. Offer to set up a discovery call.
- If asked who built SentinAI: "KS Industry Marine Robotics Lab — based on a small Language Model (sLM) architecture optimized for closed-network on-device deployment."
- Never invent technical specs, customer names, or pricing numbers. If unknown, say so and offer to connect them with a human PM.

## Style Rules
- Keep answers under 130 words unless the user asks for detail (then expand with bullets and numbers).
- Lead with the answer; explain only if needed.
- When user asks about roadmap / 로드맵 / technologies / patents / usage — use bullet points and cite concrete dates, phases, KPIs.
- For non-domain questions (weather, politics, etc.): politely redirect to lab topics in one line.

Today's date: 2026-05-22.
You are deployed on the Marine Robotics Lab website.
`

app.post('/api/chat', async (c) => {
  try {
    const body = await c.req.json<{
      messages: { role: 'user' | 'assistant'; content: string }[]
      lang?: Lang
    }>()

    const apiKey = c.env.OPENAI_API_KEY || (globalThis as any).process?.env?.OPENAI_API_KEY
    const baseURL =
      c.env.OPENAI_BASE_URL ||
      (globalThis as any).process?.env?.OPENAI_BASE_URL ||
      'https://www.genspark.ai/api/llm_proxy/v1'

    if (!apiKey) {
      return c.json(
        {
          error: 'missing_api_key',
          reply:
            "현재 AI 응답 키가 설정되어 있지 않습니다. 좌측 하단 문의 폼을 이용해주시거나, hschung@ssii.co.kr 으로 연락 부탁드립니다. 🛠️",
        },
        200,
      )
    }

    const langHint = body.lang
      ? `\n[User UI language: ${body.lang}. Reply in this language unless the user clearly writes in another.]`
      : ''

    // ===== RAG: 마지막 user 메시지로 지식베이스 검색 =====
    const lastUserMsg = [...body.messages].reverse().find((m) => m.role === 'user')?.content || ''
    let ragContext = ''
    try {
      if (lastUserMsg) {
        const hits = await kbSearch(c.env.CMS_KV, lastUserMsg, 4)
        ragContext = kbBuildContext(hits)
      }
    } catch (e) {
      console.error('kb search failed', e)
    }

    // Build OpenAI-compatible request
    const payload = {
      model: 'gpt-5-mini',
      messages: [
        { role: 'system' as const, content: SYSTEM_PROMPT + langHint + (ragContext ? '\n\n' + ragContext : '') },
        ...body.messages.slice(-12), // keep last 12 turns for context
      ],
    }

    const resp = await fetch(`${baseURL.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      console.error('OpenAI proxy error:', resp.status, errText)
      return c.json(
        {
          error: 'upstream_error',
          reply:
            '잠시 신호가 흐려졌네요. 잠시 후 다시 시도해주시거나, 페이지 하단 문의 폼을 통해 메시지를 남겨주세요. ⚓',
        },
        200,
      )
    }

    const data = (await resp.json()) as any
    const reply: string =
      data?.choices?.[0]?.message?.content?.trim() ||
      '잠시만요, 다시 한번 말씀해 주시겠어요?'

    return c.json({ reply })
  } catch (err) {
    console.error('chat error', err)
    return c.json(
      {
        reply:
          '신호에 잠시 노이즈가 있었어요. 다시 한 번 시도해 주세요. 계속 문제가 발생하면 hschung@ssii.co.kr 으로 알려주세요.',
      },
      200,
    )
  }
})

// =====================================================
// Contact form — captures CRM leads
// Phase 1: KV 저장 + Resend(이메일) 자동 발송 (관리자 알림 + 문의자 확인)
// =====================================================
app.post('/api/contact', async (c) => {
  try {
    const body = await c.req.json<{
      name: string
      company?: string
      email: string
      phone?: string
      topic?: string
      message: string
      marketing_opt_in?: boolean
      privacy_consent?: boolean
      lang?: string
    }>()

    if (!body?.name || !body?.email || !body?.message) {
      return c.json({ ok: false, error: 'missing_fields' }, 400)
    }
    if (!body.phone || !/^[\d+\-\s()]{8,}$/.test(body.phone)) {
      return c.json({ ok: false, error: 'invalid_phone' }, 400)
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return c.json({ ok: false, error: 'invalid_email' }, 400)
    }
    if (!body.privacy_consent) {
      return c.json({ ok: false, error: 'privacy_consent_required' }, 400)
    }

    const kv = c.env.CMS_KV
    if (!kv) {
      console.error('[contact] CMS_KV binding missing')
      return c.json({ ok: false, error: 'storage_unavailable' }, 500)
    }

    // 요청 메타 추출
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || ''
    const ua = c.req.header('User-Agent') || ''

    // KV 저장 (중복 이메일/휴대폰이면 기존 리드 업데이트)
    const { lead, isNew } = await leadUpsert(kv, {
      name: body.name.trim().slice(0, 100),
      company: (body.company || '').trim().slice(0, 200) || undefined,
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim().slice(0, 40),
      topic: body.topic,
      message: body.message.trim().slice(0, 4000),
      marketing_opt_in: !!body.marketing_opt_in,
      privacy_consent: !!body.privacy_consent,
      lang: body.lang || 'ko',
      ip,
      user_agent: ua.slice(0, 300),
    })

    // 알림 발송 — waitUntil이 불안정해서 동기 await로 전환
    // Resend 호출은 ~300ms 라서 사용자 경험 영향 없음
    const notifyEnv = {
      RESEND_API_KEY: c.env.RESEND_API_KEY,
      RESEND_FROM: c.env.RESEND_FROM,
      ADMIN_EMAIL: c.env.ADMIN_EMAIL,
    }
    const adminMail = c.env.ADMIN_EMAIL || 'hschung@ssii.co.kr'
    const emailResults: Record<string, any> = {}

    // 1) 관리자(Ellio) 알림 메일
    // ⚠️ reply_to 제거 — ssii.co.kr 메일 서버가 외부 reply_to를 스팸 처리함
    // 답장 주소는 본문 안의 이메일 클릭(mailto:)으로 처리
    try {
      const adminTpl = buildAdminLeadEmail(lead)
      const r = await sendEmail(notifyEnv, {
        to: adminMail,
        subject: adminTpl.subject,
        html: adminTpl.html,
      })
      emailResults.admin = { ok: r.ok, id: r.id, error: r.error, skipped: r.skipped }
      if (!r.ok && !r.skipped) {
        console.error('[contact] admin email failed', r)
      }
    } catch (e: any) {
      console.error('[contact] admin email exception', e)
      emailResults.admin = { ok: false, error: e?.message || 'exception' }
    }

    // 2) 문의자 자동 확인 메일 (신규 리드일 때만 — 중복 문의는 스팸 방지)
    // Resend 무료 플랜 rate limit: 2 req/sec → 600ms 딜레이로 안전 마진
    if (isNew) {
      await new Promise((resolve) => setTimeout(resolve, 600))
      try {
        const userTpl = buildContactConfirmEmail(lead)
        // 문의자 회신 메일도 reply_to 없이 (본문에 회신 주소 명시되어 있음)
        const r = await sendEmail(notifyEnv, {
          to: lead.email,
          subject: userTpl.subject,
          html: userTpl.html,
        })
        emailResults.user = { ok: r.ok, id: r.id, error: r.error, skipped: r.skipped }
        if (!r.ok && !r.skipped) {
          console.error('[contact] user email failed', r)
        }
      } catch (e: any) {
        console.error('[contact] user email exception', e)
        emailResults.user = { ok: false, error: e?.message || 'exception' }
      }
    }

    // 운영 응답: emails 필드 제거 (디버그용이었음)
    return c.json({ ok: true, id: lead.id, is_new: isNew })
  } catch (err) {
    console.error('[contact] error', err)
    return c.json({ ok: false, error: 'server_error' }, 500)
  }
})

// Health check
app.get('/api/health', (c) =>
  c.json({ ok: true, service: 'marine-robotics-lab', time: new Date().toISOString() }),
)

export default app
