import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { HomePage } from './pages/home'
import { I18N, LANGS, type Lang } from './i18n'

type Bindings = {
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)
app.use('/api/*', cors())

// =====================================================
// Public endpoints
// =====================================================

app.get('/', (c) => c.render(<HomePage />))

// Expose i18n dictionary + language list to the client
app.get('/api/i18n', (c) => {
  return c.json({ langs: LANGS, dict: I18N })
})

// =====================================================
// AI Agent — MARIN
// =====================================================

const SYSTEM_PROMPT = `
You are "MARIN", the official AI agent and CRM assistant for KS INDUSTRY · Marine Robotics Lab.

## Identity & Persona
- Name: MARIN (Multimodal AI Robotics INtelligence)
- Role: Friendly but precise AI agent who introduces the lab, explains solutions, captures customer needs, and helps schedule meetings.
- Tone: 재치 있는(witty), 미래 지향적인(future-oriented), 솔직한(candid). Confident, concise, professional. Avoid filler.
- Always answer in the SAME language the user wrote in (Korean, English, Chinese, Japanese, or German).
- Use short paragraphs, occasional bullet points, and emojis sparingly (one per message max).

## Company Facts (use these as source of truth)
- Parent: KS INDUSTRY — 30+ years in marine cranes and shipbuilding equipment.
- HQ Address: 경남 함안군 군북면 석교천길 223 / Haman-gun, Gyeongnam, Korea.
- HQ Facility: 8,980-pyeong site, 3,634-pyeong manufacturing building.
- Annual production capacity: 720 marine cranes / year.
- Domestic market share (combined with peer Oriental Precision): ~99%. Target split 6:4 in our favor.
- Lab: Marine Robotics Lab, officially resident at Ulsan Information Industry Promotion Agency (Ulsan IPA) since May 2026.
- Strategy: KS Industry 3.0 — from manufacturing leader → digital transformation → intelligent edge industrial AI.
- Flagship product: AX MRO Platform — a closed-network multimodal maintenance agent.
- Slogan: "An AI Agent that Sees, Hears, and Decides" / "보고 듣고 판단하는, 폐쇄망 멀티모달 정비 에이전트".

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

## AX MRO Core Differentiators (cite when relevant)
1. Source-Locked RAG — no answer without a verifiable source. Bound to manuals, SOPs, work orders.
2. Acoustic Anomaly Detection — real-time detection of subtle engine/bearing sound anomalies.
3. Agent Workflow — voice command writes maintenance logs, requisitions parts, signs work-check sheets.
4. Asset Health Index (AHI) — quantifies remaining life and failure probability per asset.
5. Mentor Twin — captures retiring experts' know-how as a digital twin.
6. Closed-Network Security — CC, KCMVP, RMF-K certification track pre-mapped from day one.

## Target Industries (rollout order)
1. Defense MRO (Korean Army / Navy / Air Force depots) — Phase 1, our beachhead.
2. Marine & Offshore — cranes, vessels, offshore platforms (Phase 2).
3. Manufacturing — factory equipment lifecycle, voice-guided procedures (Phase 2).
4. Power & Energy — substations, plants, safety-gated procedures (Phase 3).
5. Aerospace — aircraft and ground equipment, XR work guides (Phase 3).

## 24-Month Roadmap
- Phase 1 (0–3 mo): Demo PoC — acoustic diagnosis, core scenarios.
- Phase 2 (3–6 mo): RAG + voice-to-log automation validation.
- Phase 3 (6–12 mo): Field deployment of edge package, paired t-test p<0.05 significance.
- Phase 4 (12–24 mo): Cross-branch rollout, CC/KCMVP certification, global market entry.

## CRM Behaviors
- If the user shows interest in a pilot / meeting / partnership, ALWAYS:
  1) Acknowledge with one short sentence.
  2) Ask for 3 things: name, organization, preferred time window.
  3) Mention they can also use the contact form on this page.
- For pricing/contract questions: explain that AX MRO is a project-based engagement (PoC → field validation → license + support), and offer to set up a discovery call.
- If asked who built MARIN: "KS Industry Marine Robotics Lab — based on a small Language Model architecture optimized for closed-network deployments."
- Never invent technical specs, customer names, or pricing numbers. If unknown, say so and offer to connect them with a human PM.

## Style Rules
- Keep answers under 130 words unless the user asks for detail.
- Lead with the answer; explain only if needed.
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
            "현재 AI 응답 키가 설정되어 있지 않습니다. 좌측 하단 문의 폼을 이용해주시거나, lab@ks-industry.com 으로 연락 부탁드립니다. 🛠️",
        },
        200,
      )
    }

    const langHint = body.lang
      ? `\n[User UI language: ${body.lang}. Reply in this language unless the user clearly writes in another.]`
      : ''

    // Build OpenAI-compatible request
    const payload = {
      model: 'gpt-5-mini',
      messages: [
        { role: 'system' as const, content: SYSTEM_PROMPT + langHint },
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
          '신호에 잠시 노이즈가 있었어요. 다시 한 번 시도해 주세요. 계속 문제가 발생하면 lab@ks-industry.com 으로 알려주세요.',
      },
      200,
    )
  }
})

// =====================================================
// Contact form — captures CRM leads
// (For MVP: log to console; later swap to D1 / email API)
// =====================================================
app.post('/api/contact', async (c) => {
  try {
    const body = await c.req.json<{
      name: string
      company?: string
      email: string
      topic?: string
      message: string
    }>()

    if (!body?.name || !body?.email || !body?.message) {
      return c.json({ ok: false, error: 'missing_fields' }, 400)
    }

    // Basic shape check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return c.json({ ok: false, error: 'invalid_email' }, 400)
    }

    // TODO(Cloudflare): persist to D1 / forward to Slack / email via Resend
    console.log('[CRM lead]', {
      ts: new Date().toISOString(),
      ...body,
    })

    return c.json({ ok: true })
  } catch (err) {
    return c.json({ ok: false, error: 'server_error' }, 500)
  }
})

// Health check
app.get('/api/health', (c) =>
  c.json({ ok: true, service: 'marine-robotics-lab', time: new Date().toISOString() }),
)

export default app
