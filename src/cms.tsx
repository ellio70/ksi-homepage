// CMS — 비주얼 콘텐츠 관리 모듈
// - 비밀번호 로그인 → 세션 쿠키 발급
// - i18n 오버라이드를 Cloudflare KV에 저장 (5개 언어 키-값)
// - 이미지 업로드 (base64로 KV에 저장, 메인페이지가 /api/cms/image/:name 으로 서빙)
//
// 메인페이지 i18n은 GET /api/i18n에서 기본 dict + CMS_KV 오버라이드를 머지하여 응답.

import { Hono } from 'hono'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import { I18N, LANGS, type Lang } from './i18n'

type Bindings = {
  CMS_KV?: KVNamespace
  ADMIN_PASSWORD?: string
  SESSION_SECRET?: string
}

const cms = new Hono<{ Bindings: Bindings }>()

// =====================================================
// 유틸: 세션 토큰 생성/검증 (Web Crypto HMAC-SHA256)
// =====================================================

const SESSION_COOKIE = 'ksi_cms_session'
const SESSION_TTL_DAYS = 7

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  // base64url
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function makeToken(secret: string): Promise<string> {
  const payload = `${Date.now()}.${Math.random().toString(36).slice(2)}`
  const sig = await hmac(secret, payload)
  return `${payload}.${sig}`
}

async function verifyToken(secret: string, token: string | undefined): Promise<boolean> {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [ts, nonce, sig] = parts
  const expected = await hmac(secret, `${ts}.${nonce}`)
  if (expected !== sig) return false
  // TTL 체크
  const age = Date.now() - Number(ts)
  if (!Number.isFinite(age) || age < 0 || age > SESSION_TTL_DAYS * 86400_000) return false
  return true
}

function getSecret(c: any): string {
  return (
    c.env.SESSION_SECRET ||
    (globalThis as any).process?.env?.SESSION_SECRET ||
    'fallback-not-secure-please-set'
  )
}

function getAdminPassword(c: any): string {
  return (
    c.env.ADMIN_PASSWORD ||
    (globalThis as any).process?.env?.ADMIN_PASSWORD ||
    'ksi2026'
  )
}

// 미들웨어: 관리자 인증 필요한 라우트 보호
async function requireAuth(c: any, next: any) {
  const token = getCookie(c, SESSION_COOKIE)
  const ok = await verifyToken(getSecret(c), token)
  if (!ok) {
    return c.json({ ok: false, error: 'unauthorized' }, 401)
  }
  return next()
}

// =====================================================
// KV 키 네이밍
// =====================================================
// cms:i18n:<lang>:<key> → 단일 키 오버라이드 (예: cms:i18n:ko:hero.title)
// cms:image:<filename>  → 이미지 데이터 (메타: 헤더에 contentType)
// cms:meta:updated_at   → 마지막 수정 시각

const kvKey = {
  i18n: (lang: Lang, key: string) => `cms:i18n:${lang}:${key}`,
  i18nPrefix: (lang?: Lang) => (lang ? `cms:i18n:${lang}:` : 'cms:i18n:'),
  image: (filename: string) => `cms:image:${filename}`,
  imagePrefix: () => 'cms:image:',
  updatedAt: () => 'cms:meta:updated_at',
}

// =====================================================
// 메인페이지에서 사용할 i18n 머지 헬퍼 (export)
// =====================================================

/**
 * 기본 I18N 사전에 KV의 오버라이드를 머지하여 반환합니다.
 * KV가 없거나 비어있으면 기본 사전을 그대로 반환합니다.
 */
export async function buildMergedI18n(kv?: KVNamespace) {
  // 기본 사전 깊은 복사
  const dict: Record<Lang, Record<string, string>> = JSON.parse(JSON.stringify(I18N))

  if (!kv) {
    return { langs: LANGS, dict }
  }

  try {
    // 모든 오버라이드 키 나열 (5개 언어 × ~250키 = 1250건 안쪽이므로 한 번에 OK)
    const list = await kv.list({ prefix: kvKey.i18nPrefix() })
    for (const item of list.keys) {
      // key 형식: cms:i18n:<lang>:<i18nKey>
      const rest = item.name.slice('cms:i18n:'.length)
      const sep = rest.indexOf(':')
      if (sep < 0) continue
      const lang = rest.slice(0, sep) as Lang
      const i18nKey = rest.slice(sep + 1)
      if (!dict[lang]) continue
      const val = await kv.get(item.name)
      if (val !== null) {
        dict[lang][i18nKey] = val
      }
    }
  } catch (e) {
    console.error('[CMS] i18n merge failed', e)
  }

  return { langs: LANGS, dict }
}

/**
 * 이미지 파일명에 대한 KV blob 존재 여부와 응답. 없으면 null.
 */
export async function getCmsImage(kv: KVNamespace | undefined, filename: string) {
  if (!kv) return null
  try {
    const raw = await kv.getWithMetadata<{ contentType?: string }>(kvKey.image(filename), 'arrayBuffer')
    if (!raw || !raw.value) return null
    return {
      body: raw.value as ArrayBuffer,
      contentType: raw.metadata?.contentType || 'application/octet-stream',
    }
  } catch {
    return null
  }
}

// =====================================================
// 공개 엔드포인트: 로그인
// =====================================================

cms.post('/api/admin/login', async (c) => {
  let body: { password?: string } = {}
  try {
    body = await c.req.json()
  } catch {}
  const expected = getAdminPassword(c)
  if (!body.password || body.password !== expected) {
    return c.json({ ok: false, error: 'invalid_password' }, 401)
  }
  const token = await makeToken(getSecret(c))
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: true,
    path: '/',
    maxAge: SESSION_TTL_DAYS * 86400,
  })
  return c.json({ ok: true })
})

cms.post('/api/admin/logout', async (c) => {
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.json({ ok: true })
})

cms.get('/api/admin/me', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  const ok = await verifyToken(getSecret(c), token)
  return c.json({ authenticated: ok })
})

// =====================================================
// 보호된 엔드포인트: i18n 오버라이드 CRUD
// =====================================================

// 현재 오버라이드 전체 목록 (관리 화면 초기 로드용)
cms.get('/api/admin/i18n', requireAuth, async (c) => {
  const kv = c.env.CMS_KV
  if (!kv) return c.json({ ok: true, overrides: {} })
  const overrides: Record<string, Record<string, string>> = {}
  try {
    const list = await kv.list({ prefix: kvKey.i18nPrefix() })
    for (const item of list.keys) {
      const rest = item.name.slice('cms:i18n:'.length)
      const sep = rest.indexOf(':')
      if (sep < 0) continue
      const lang = rest.slice(0, sep)
      const i18nKey = rest.slice(sep + 1)
      const val = await kv.get(item.name)
      if (val === null) continue
      overrides[lang] = overrides[lang] || {}
      overrides[lang][i18nKey] = val
    }
  } catch (e) {
    console.error('[CMS] list failed', e)
  }
  const updatedAt = await kv.get(kvKey.updatedAt()).catch(() => null)
  return c.json({ ok: true, overrides, updatedAt })
})

// 한 키의 5개 언어 일괄 저장
cms.put('/api/admin/i18n', requireAuth, async (c) => {
  const kv = c.env.CMS_KV
  if (!kv) return c.json({ ok: false, error: 'no_kv' }, 500)
  let body: { key?: string; values?: Record<string, string> } = {}
  try {
    body = await c.req.json()
  } catch {}
  if (!body.key || !body.values) {
    return c.json({ ok: false, error: 'missing_fields' }, 400)
  }
  const validLangs: Lang[] = ['ko', 'en', 'zh', 'ja', 'de']
  let written = 0
  for (const lang of validLangs) {
    const v = body.values[lang]
    if (typeof v !== 'string') continue
    // 빈 문자열이면 오버라이드 삭제 (기본값 복원)
    if (v.trim() === '') {
      await kv.delete(kvKey.i18n(lang, body.key))
    } else {
      await kv.put(kvKey.i18n(lang, body.key), v)
      written++
    }
  }
  await kv.put(kvKey.updatedAt(), new Date().toISOString())
  return c.json({ ok: true, written })
})

// 단일 키 오버라이드 삭제 (기본값으로 복원)
cms.delete('/api/admin/i18n/:key', requireAuth, async (c) => {
  const kv = c.env.CMS_KV
  if (!kv) return c.json({ ok: false }, 500)
  const key = c.req.param('key')
  const validLangs: Lang[] = ['ko', 'en', 'zh', 'ja', 'de']
  for (const lang of validLangs) {
    await kv.delete(kvKey.i18n(lang, key))
  }
  await kv.put(kvKey.updatedAt(), new Date().toISOString())
  return c.json({ ok: true })
})

// =====================================================
// 보호된 엔드포인트: 이미지 업로드
// =====================================================

// 이미지 목록 (메인페이지에서 사용 중인 파일명 + 업로드된 KV 이미지)
cms.get('/api/admin/images', requireAuth, async (c) => {
  const kv = c.env.CMS_KV
  // 메인페이지에서 참조 중인 핵심 이미지 화이트리스트
  const SLOTS = [
    { slot: 'hero-navy-engine.jpg', label: 'Hero 배경 (한국 해군 엔진룸)' },
    { slot: 'sentinai-avatar-female.jpg', label: 'SentinAI 아바타 — 여성' },
    { slot: 'sentinai-avatar-male.jpg', label: 'SentinAI 아바타 — 남성' },
    { slot: 'sentinai-avatar.jpg', label: 'SentinAI 기본 아바타' },
    { slot: 'nvidia-jetson.jpg', label: '국방 MRO 카드 사진' },
    { slot: 'port-tablet.jpg', label: '조선해양 MRO 카드 사진' },
    { slot: 'mro-dashboard.jpg', label: '제조생산 MRO 카드 사진' },
    { slot: 'sentinai-hardware.jpg', label: 'SentinAI 하드웨어' },
    { slot: 'engine-room-mro.jpg', label: '엔진룸 MRO' },
    { slot: 'port-noise.jpg', label: '항만 소음 환경' },
    { slot: 'smart-mro-ui.jpg', label: 'Smart MRO UI' },
    { slot: 'sovereign-edge.jpg', label: '소버린 엣지 컴퓨팅' },
    { slot: 'core-arch.jpg', label: '코어 R&D 아키텍처' },
    { slot: 'integrated-mro.jpg', label: '통합 MRO 시스템' },
  ]
  // KV에 이미 업로드된 항목 표시
  let uploaded = new Set<string>()
  if (kv) {
    try {
      const list = await kv.list({ prefix: kvKey.imagePrefix() })
      for (const item of list.keys) {
        uploaded.add(item.name.slice(kvKey.imagePrefix().length))
      }
    } catch {}
  }
  return c.json({
    ok: true,
    slots: SLOTS.map((s) => ({ ...s, hasOverride: uploaded.has(s.slot) })),
  })
})

// 이미지 업로드 (multipart/form-data: filename + file)
cms.post('/api/admin/images', requireAuth, async (c) => {
  const kv = c.env.CMS_KV
  if (!kv) return c.json({ ok: false, error: 'no_kv' }, 500)
  let filename = ''
  let buf: ArrayBuffer | null = null
  let contentType = 'application/octet-stream'
  try {
    const form = await c.req.formData()
    filename = String(form.get('filename') || '')
    const file = form.get('file') as File | null
    if (!filename || !file) {
      return c.json({ ok: false, error: 'missing_fields' }, 400)
    }
    // 안전한 파일명 검증 (디렉토리 트래버설 방지)
    if (!/^[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp|svg)$/i.test(filename)) {
      return c.json({ ok: false, error: 'invalid_filename' }, 400)
    }
    // 최대 5MB
    const MAX = 5 * 1024 * 1024
    if (file.size > MAX) {
      return c.json({ ok: false, error: 'too_large', limit: MAX }, 400)
    }
    buf = await file.arrayBuffer()
    contentType = file.type || contentType
  } catch (e) {
    return c.json({ ok: false, error: 'parse_failed' }, 400)
  }
  await kv.put(kvKey.image(filename), buf!, { metadata: { contentType } })
  await kv.put(kvKey.updatedAt(), new Date().toISOString())
  return c.json({ ok: true, filename, size: buf!.byteLength })
})

// 이미지 오버라이드 삭제 (기본 이미지로 복원)
cms.delete('/api/admin/images/:filename', requireAuth, async (c) => {
  const kv = c.env.CMS_KV
  if (!kv) return c.json({ ok: false }, 500)
  const filename = c.req.param('filename')
  await kv.delete(kvKey.image(filename))
  await kv.put(kvKey.updatedAt(), new Date().toISOString())
  return c.json({ ok: true })
})

// =====================================================
// 공개 엔드포인트: KV에 저장된 이미지 서빙
// (메인페이지의 /static/images/<name> 보다 우선 — index.tsx에서 라우팅)
// =====================================================

cms.get('/cms-image/:filename', async (c) => {
  const kv = c.env.CMS_KV
  const filename = c.req.param('filename')
  const img = await getCmsImage(kv, filename)
  if (!img) return c.notFound()
  return new Response(img.body, {
    headers: {
      'Content-Type': img.contentType,
      'Cache-Control': 'public, max-age=300',
    },
  })
})

// =====================================================
// /admin 페이지 (HTML 셸 — JS는 /static/admin.js에서)
// =====================================================

cms.get('/admin', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KSI · 콘텐츠 관리</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
  <style>
    body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; background: #0b0f1a; color: #e2e8f0; }
    .glass { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(148, 163, 184, 0.15); }
    .ks-cyan { color: #22d3ee; }
    .bg-ks-cyan { background-color: #22d3ee; }
    .border-ks-cyan { border-color: #22d3ee; }
    .lang-tab.active { background-color: #22d3ee; color: #0b0f1a; }
    .key-row:hover { background: rgba(34, 211, 238, 0.05); }
    .modified-badge { background: #f59e0b; color: #0b0f1a; }
    textarea { font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.5; }
    .toast { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  </style>
</head>
<body class="min-h-screen">
  <div id="app"></div>
  <script src="/static/admin.js"></script>
</body>
</html>`)
})

export default cms
