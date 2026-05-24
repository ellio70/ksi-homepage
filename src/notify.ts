// =====================================================
// Notification Layer — 발송 채널 추상화
// =====================================================
// 이메일/SMS/카카오톡을 동일한 인터페이스로 호출할 수 있게 추상화.
// Phase 1: Resend(이메일)만 구현.
// Phase 2(3개월 후 리드 50+): Aligo·NHN Toast 알림톡 채널 1줄 교체.
// =====================================================

export interface NotifyBindings {
  RESEND_API_KEY?: string       // Resend API 키 (wrangler secret)
  RESEND_FROM?: string          // 발신자 주소 (도메인 인증 필요) — 예: 'SentinAI <noreply@sentinai.kr>'
  ADMIN_EMAIL?: string          // 관리자 알림 받을 메일 (예: hschung@ssii.co.kr)
  ALIGO_API_KEY?: string        // (Phase 2) Aligo 알림톡 키
  ALIGO_USER_ID?: string        // (Phase 2)
}

export interface EmailMessage {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export interface NotifyResult {
  ok: boolean
  channel: 'email' | 'sms' | 'kakao' | 'noop'
  provider?: string
  id?: string
  error?: string
  skipped?: boolean       // 키가 없어서 발송 시뮬레이션만 한 경우
}

// =====================================================
// EMAIL — Resend
// =====================================================
// Resend Docs: https://resend.com/docs/api-reference/emails/send-email
// 무료 플랜: 100건/일, 3,000건/월 (Phase 1 충분)

export async function sendEmail(
  env: NotifyBindings,
  msg: EmailMessage,
): Promise<NotifyResult> {
  // 키가 아직 등록 안 된 경우 — 로그만 남기고 성공으로 처리
  // (Phase 1 초반에 리드만 쌓아두고 발송은 안 할 수 있도록)
  if (!env.RESEND_API_KEY) {
    console.log('[notify:email] SKIPPED (no RESEND_API_KEY)', {
      to: msg.to,
      subject: msg.subject,
    })
    return { ok: true, channel: 'email', provider: 'noop', skipped: true }
  }

  const from = env.RESEND_FROM || 'SentinAI <onboarding@resend.dev>'

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(msg.to) ? msg.to : [msg.to],
        subject: msg.subject,
        html: msg.html,
        reply_to: msg.replyTo,
      }),
    })
    const data = await res.json<any>().catch(() => ({}))

    if (!res.ok) {
      console.error('[notify:email] resend failed', res.status, data)
      return {
        ok: false,
        channel: 'email',
        provider: 'resend',
        error: data?.message || `http_${res.status}`,
      }
    }

    return {
      ok: true,
      channel: 'email',
      provider: 'resend',
      id: data?.id,
    }
  } catch (err: any) {
    console.error('[notify:email] fetch error', err)
    return {
      ok: false,
      channel: 'email',
      provider: 'resend',
      error: err?.message || 'network_error',
    }
  }
}

// =====================================================
// SMS / KAKAO — placeholder (Phase 2 예약)
// =====================================================

export async function sendSMS(
  _env: NotifyBindings,
  _payload: { to: string; text: string },
): Promise<NotifyResult> {
  // Phase 2 — Aligo·NHN Toast 연결 예정
  return { ok: false, channel: 'sms', error: 'not_implemented', skipped: true }
}

export async function sendKakaoAlimtalk(
  _env: NotifyBindings,
  _payload: { to: string; templateCode: string; vars: Record<string, string> },
): Promise<NotifyResult> {
  // Phase 2 — 카카오 비즈채널 + 템플릿 심사 후 연결
  return { ok: false, channel: 'kakao', error: 'not_implemented', skipped: true }
}

// =====================================================
// 템플릿 — Lead 관련 메일 HTML 빌더
// =====================================================

/**
 * 관리자(Ellio)에게 가는 새 리드 알림 메일
 */
export function buildAdminLeadEmail(lead: {
  id: string
  name: string
  company?: string
  email: string
  phone?: string
  topic?: string
  message: string
  marketing_opt_in: boolean
  created_at: number
}): { subject: string; html: string } {
  const topicLabels: Record<string, string> = {
    defense: '🛡 Defense MRO',
    marine: '🚢 Marine & Offshore',
    manufacture: '🏭 Manufacturing',
    power: '⚡ Power & Energy',
    aerospace: '✈ Aerospace',
    partner: '🤝 Partnership / Investment',
    other: '📌 Other',
  }
  const topicLabel = topicLabels[lead.topic || 'other'] || lead.topic || '미지정'
  const dt = new Date(lead.created_at).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  })

  const subject = `[SentinAI] 🔔 새 문의 — ${lead.name} (${lead.company || '개인'})`
  const html = `
    <div style="font-family:-apple-system,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0f172a;color:#e2e8f0;">
      <h2 style="color:#22d3ee;margin:0 0 16px;font-size:20px;">🔔 새 문의가 도착했습니다</h2>
      <p style="color:#94a3b8;font-size:13px;margin:0 0 24px;">${escapeHtml(dt)} · ID: <code style="color:#cbd5e1;">${escapeHtml(lead.id)}</code></p>

      <table style="width:100%;border-collapse:collapse;background:#1e293b;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:12px 16px;color:#94a3b8;width:100px;border-bottom:1px solid #334155;">성함</td><td style="padding:12px 16px;border-bottom:1px solid #334155;"><b style="color:#f1f5f9;">${escapeHtml(lead.name)}</b></td></tr>
        <tr><td style="padding:12px 16px;color:#94a3b8;border-bottom:1px solid #334155;">소속</td><td style="padding:12px 16px;border-bottom:1px solid #334155;color:#e2e8f0;">${escapeHtml(lead.company || '-')}</td></tr>
        <tr><td style="padding:12px 16px;color:#94a3b8;border-bottom:1px solid #334155;">이메일</td><td style="padding:12px 16px;border-bottom:1px solid #334155;"><a href="mailto:${escapeHtml(lead.email)}" style="color:#22d3ee;">${escapeHtml(lead.email)}</a></td></tr>
        <tr><td style="padding:12px 16px;color:#94a3b8;border-bottom:1px solid #334155;">휴대폰</td><td style="padding:12px 16px;border-bottom:1px solid #334155;color:#e2e8f0;">${escapeHtml(lead.phone || '-')}</td></tr>
        <tr><td style="padding:12px 16px;color:#94a3b8;border-bottom:1px solid #334155;">관심분야</td><td style="padding:12px 16px;border-bottom:1px solid #334155;color:#e2e8f0;">${escapeHtml(topicLabel)}</td></tr>
        <tr><td style="padding:12px 16px;color:#94a3b8;">마케팅 수신</td><td style="padding:12px 16px;color:${lead.marketing_opt_in ? '#10b981' : '#64748b'};">${lead.marketing_opt_in ? '✓ 동의' : '미동의'}</td></tr>
      </table>

      <div style="margin-top:16px;background:#1e293b;border-radius:8px;padding:16px;">
        <div style="color:#94a3b8;font-size:12px;margin-bottom:8px;">📝 문의 내용</div>
        <div style="color:#f1f5f9;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(lead.message)}</div>
      </div>

      <div style="margin-top:24px;text-align:center;">
        <a href="https://sentinai.kr/admin" style="display:inline-block;background:#22d3ee;color:#0f172a;text-decoration:none;font-weight:bold;padding:10px 24px;border-radius:8px;font-size:14px;">관리자 페이지에서 확인 →</a>
      </div>

      <p style="margin-top:24px;color:#475569;font-size:11px;text-align:center;">
        SentinAI · KS Industry Marine Robotics Lab<br>
        이 메일은 sentinai.kr 문의 폼에서 자동 생성되었습니다.
      </p>
    </div>
  `
  return { subject, html }
}

/**
 * 문의자에게 가는 자동 확인 메일
 */
export function buildContactConfirmEmail(lead: {
  name: string
  message: string
}): { subject: string; html: string } {
  const subject = '[SentinAI] 문의 잘 받았습니다 — 곧 회신 드리겠습니다'
  const html = `
    <div style="font-family:-apple-system,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0f172a;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:24px;font-weight:bold;color:#22d3ee;letter-spacing:0.5px;">SentinAI</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">Sovereign Edge MRO Platform</div>
      </div>

      <h2 style="color:#f1f5f9;font-size:18px;margin:0 0 12px;">안녕하세요, ${escapeHtml(lead.name)} 님</h2>
      <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0 0 16px;">
        SentinAI에 관심을 가져주셔서 진심으로 감사드립니다.<br>
        보내주신 문의는 잘 도착했으며, <b style="color:#22d3ee;">영업일 기준 1~2일 이내</b>에 담당자가 직접 회신드리겠습니다.
      </p>

      <div style="background:#1e293b;border-left:3px solid #22d3ee;border-radius:6px;padding:14px 16px;margin:20px 0;">
        <div style="color:#94a3b8;font-size:11px;margin-bottom:6px;">접수된 문의 내용</div>
        <div style="color:#e2e8f0;font-size:13px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(lead.message)}</div>
      </div>

      <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:16px 0;">
        그동안 SentinAI에 대해 더 알고 싶으시면, 챗봇과 직접 대화해보시는 것도 좋습니다.<br>
        <a href="https://sentinai.kr" style="color:#22d3ee;text-decoration:none;">→ sentinai.kr 챗봇에서 대화하기</a>
      </p>

      <hr style="border:none;border-top:1px solid #334155;margin:24px 0;">
      <p style="color:#64748b;font-size:11px;line-height:1.6;text-align:center;margin:0;">
        <b style="color:#94a3b8;">KS Industry · Marine Robotics Lab</b><br>
        경남 함안군 군북면 석교천길 223 · hschung@ssii.co.kr<br><br>
        이 메일은 자동 발송되었습니다. 회신은 hschung@ssii.co.kr 으로 부탁드립니다.
      </p>
    </div>
  `
  return { subject, html }
}

function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
