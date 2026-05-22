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
  // Layout (섹션 visibility / 이미지 슬롯 리매핑)
  layoutSection: (sectionId: string) => `cms:layout:section:${sectionId}`,
  layoutSectionPrefix: () => 'cms:layout:section:',
  layoutImage: (slotId: string) => `cms:layout:image_slot:${slotId}`,
  layoutImagePrefix: () => 'cms:layout:image_slot:',
}

// =====================================================
// Layout 메타데이터 — 섹션 정의 + 이미지 슬롯 정의
// 메인페이지(home.tsx)와 admin.js가 공유하는 단일 진실 소스
// =====================================================

// 토글 가능한 섹션 (hero/nav/footer는 필수라 제외)
export const LAYOUT_SECTIONS: Array<{ id: string; label: string; defaultVisible: boolean }> = [
  { id: 'industries', label: '산업별 적용 (Industries) — 국방/조선/제조 3카드', defaultVisible: true },
  { id: 'solutions', label: 'SentinAI 플랫폼 (Solutions)', defaultVisible: true },
  { id: 'sentinai', label: 'SentinAI 3-Pillar (See/Hear/Decide)', defaultVisible: true },
  { id: 'hardware', label: 'Edge Hardware Package', defaultVisible: true },
  { id: 'forces', label: '육·해·공 군별 제품 (Forces)', defaultVisible: true },
  { id: 'kpi', label: 'KPI · Proven Performance', defaultVisible: true },
  { id: 'architecture', label: 'Sovereign Edge Architecture', defaultVisible: true },
  { id: 'applications', label: 'Applications · Reality · Production · Clients', defaultVisible: true },
  { id: 'roadmap', label: '실행 로드맵 (Roadmap)', defaultVisible: true },
  { id: 'contact', label: '문의 폼 (Contact)', defaultVisible: true },
]

// 이미지 슬롯 — 페이지 내 위치(어디에 박힐지)와 기본 파일명
export const LAYOUT_IMAGE_SLOTS: Array<{ id: string; label: string; defaultFile: string }> = [
  { id: 'hero_bg', label: 'Hero 배경', defaultFile: 'hero-navy-engine.jpg' },
  { id: 'industries_card1', label: 'Industries 카드 1 (국방)', defaultFile: 'nvidia-jetson.jpg' },
  { id: 'industries_card2', label: 'Industries 카드 2 (조선해양)', defaultFile: 'port-tablet.jpg' },
  { id: 'industries_card3', label: 'Industries 카드 3 (제조)', defaultFile: 'mro-dashboard.jpg' },
  { id: 'hardware_main', label: 'Hardware 메인 이미지', defaultFile: 'sentinai-hardware.jpg' },
  { id: 'architecture_sovereign', label: 'Architecture · 소버린 엣지 다이어그램', defaultFile: 'sovereign-edge.jpg' },
  { id: 'architecture_core', label: 'Architecture · 코어 R&D 다이어그램', defaultFile: 'core-arch.jpg' },
  { id: 'applications_bg', label: 'Applications 배경', defaultFile: 'integrated-mro.jpg' },
  { id: 'applications_card1', label: 'Applications 카드 1 (엔진룸)', defaultFile: 'engine-room-mro.jpg' },
  { id: 'applications_card2', label: 'Applications 카드 2 (항만)', defaultFile: 'port-tablet.jpg' },
  { id: 'applications_card3', label: 'Applications 카드 3 (야전)', defaultFile: 'nvidia-jetson.jpg' },
  { id: 'chat_avatar', label: '챗봇 아바타 (3곳 동시 적용)', defaultFile: 'sentinai-avatar-female.jpg' },
]

// 이미지 슬롯 풀 — 드롭다운에서 선택 가능한 모든 파일명
export const LAYOUT_IMAGE_POOL: string[] = [
  'hero-navy-engine.jpg',
  'sentinai-avatar.jpg',
  'sentinai-avatar-female.jpg',
  'sentinai-avatar-male.jpg',
  'nvidia-jetson.jpg',
  'port-tablet.jpg',
  'port-noise.jpg',
  'mro-dashboard.jpg',
  'smart-mro-ui.jpg',
  'sentinai-hardware.jpg',
  'engine-room-mro.jpg',
  'sovereign-edge.jpg',
  'core-arch.jpg',
  'integrated-mro.jpg',
]

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
 * Layout 상태를 KV에서 빌드. home.tsx에서 SSR 시 사용.
 * 반환:
 *   sections — { [sectionId]: true|false }
 *   images   — { [slotId]: filename }   (모두 기본값으로 채움, 오버라이드만 덮어씀)
 */
export async function buildLayoutState(kv?: KVNamespace) {
  const sections: Record<string, boolean> = {}
  for (const s of LAYOUT_SECTIONS) sections[s.id] = s.defaultVisible
  const images: Record<string, string> = {}
  for (const s of LAYOUT_IMAGE_SLOTS) images[s.id] = s.defaultFile

  if (!kv) return { sections, images }

  try {
    // 섹션 visibility 오버라이드
    const secList = await kv.list({ prefix: kvKey.layoutSectionPrefix() })
    for (const item of secList.keys) {
      const id = item.name.slice(kvKey.layoutSectionPrefix().length)
      const v = await kv.get(item.name)
      if (v !== null) sections[id] = v === 'true'
    }
    // 이미지 슬롯 오버라이드
    const imgList = await kv.list({ prefix: kvKey.layoutImagePrefix() })
    for (const item of imgList.keys) {
      const id = item.name.slice(kvKey.layoutImagePrefix().length)
      const v = await kv.get(item.name)
      if (v !== null && v.trim() !== '') images[id] = v
    }
  } catch (e) {
    console.error('[CMS] layout merge failed', e)
  }

  return { sections, images }
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
// 보호된 엔드포인트: Layout (섹션 visibility + 이미지 슬롯 리매핑)
// =====================================================

// 현재 layout 상태 + 메타 정보 (admin 화면에서 사용)
cms.get('/api/admin/layout', requireAuth, async (c) => {
  const state = await buildLayoutState(c.env.CMS_KV)
  return c.json({
    ok: true,
    sections: state.sections,
    images: state.images,
    meta: {
      sectionDefs: LAYOUT_SECTIONS,
      imageDefs: LAYOUT_IMAGE_SLOTS,
      imagePool: LAYOUT_IMAGE_POOL,
    },
  })
})

// 섹션 visibility 일괄 저장
cms.put('/api/admin/layout/sections', requireAuth, async (c) => {
  const kv = c.env.CMS_KV
  if (!kv) return c.json({ ok: false, error: 'no_kv' }, 500)
  let body: { sections?: Record<string, boolean> } = {}
  try {
    body = await c.req.json()
  } catch {}
  if (!body.sections) return c.json({ ok: false, error: 'missing_fields' }, 400)

  const validIds = new Set(LAYOUT_SECTIONS.map((s) => s.id))
  const defaults: Record<string, boolean> = {}
  for (const s of LAYOUT_SECTIONS) defaults[s.id] = s.defaultVisible

  let written = 0
  for (const [id, visible] of Object.entries(body.sections)) {
    if (!validIds.has(id)) continue
    // 기본값과 같으면 오버라이드 삭제, 다르면 저장
    if (visible === defaults[id]) {
      await kv.delete(kvKey.layoutSection(id))
    } else {
      await kv.put(kvKey.layoutSection(id), visible ? 'true' : 'false')
      written++
    }
  }
  await kv.put(kvKey.updatedAt(), new Date().toISOString())
  return c.json({ ok: true, written })
})

// 이미지 슬롯 리매핑 일괄 저장
cms.put('/api/admin/layout/images', requireAuth, async (c) => {
  const kv = c.env.CMS_KV
  if (!kv) return c.json({ ok: false, error: 'no_kv' }, 500)
  let body: { images?: Record<string, string> } = {}
  try {
    body = await c.req.json()
  } catch {}
  if (!body.images) return c.json({ ok: false, error: 'missing_fields' }, 400)

  const validIds = new Set(LAYOUT_IMAGE_SLOTS.map((s) => s.id))
  const defaults: Record<string, string> = {}
  for (const s of LAYOUT_IMAGE_SLOTS) defaults[s.id] = s.defaultFile
  const pool = new Set(LAYOUT_IMAGE_POOL)

  let written = 0
  for (const [id, filename] of Object.entries(body.images)) {
    if (!validIds.has(id)) continue
    if (typeof filename !== 'string' || !pool.has(filename)) continue
    // 기본값과 같으면 오버라이드 삭제
    if (filename === defaults[id]) {
      await kv.delete(kvKey.layoutImage(id))
    } else {
      await kv.put(kvKey.layoutImage(id), filename)
      written++
    }
  }
  await kv.put(kvKey.updatedAt(), new Date().toISOString())
  return c.json({ ok: true, written })
})

// Layout 전체 초기화 (모든 오버라이드 삭제)
cms.delete('/api/admin/layout', requireAuth, async (c) => {
  const kv = c.env.CMS_KV
  if (!kv) return c.json({ ok: false }, 500)
  try {
    const secList = await kv.list({ prefix: kvKey.layoutSectionPrefix() })
    for (const k of secList.keys) await kv.delete(k.name)
    const imgList = await kv.list({ prefix: kvKey.layoutImagePrefix() })
    for (const k of imgList.keys) await kv.delete(k.name)
  } catch (e) {
    console.error('[CMS] layout reset failed', e)
  }
  await kv.put(kvKey.updatedAt(), new Date().toISOString())
  return c.json({ ok: true })
})

// =====================================================
// 공개 엔드포인트: KV에 저장된 이미지 서빙
// (메인페이지의 /static/images/<name> 보다 우선 — index.tsx에서 라우팅)
// =====================================================

// =====================================================
// 지식베이스 (RAG) — 챗봇이 참조할 회사·제품·기술 지식 항목
// 키 스키마:
//   'kb:index'       → string[] (모든 id 목록)
//   'kb:item:<id>'   → KnowledgeItem JSON
// =====================================================

export type KnowledgeItem = {
  id: string
  title: string
  category: 'company' | 'product' | 'tech' | 'process' | 'contact' | 'roadmap' | 'faq' | 'etc'
  content: string        // Markdown 본문
  tags: string[]
  priority: number       // 1(최우선) ~ 5(보조)
  updated_at: number
}

export const KB_CATEGORIES = [
  { id: 'company',  label: '회사 개요' },
  { id: 'product',  label: '제품·SentinAI' },
  { id: 'tech',     label: '기술·특허' },
  { id: 'process',  label: '도입·절차' },
  { id: 'roadmap',  label: '로드맵' },
  { id: 'contact',  label: '연락처' },
  { id: 'faq',      label: 'FAQ' },
  { id: 'etc',      label: '기타' },
] as const

export async function kbListIds(kv?: KVNamespace): Promise<string[]> {
  if (!kv) return []
  const raw = await kv.get('kb:index')
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function kbGet(kv: KVNamespace | undefined, id: string): Promise<KnowledgeItem | null> {
  if (!kv) return null
  const raw = await kv.get(`kb:item:${id}`)
  if (!raw) return null
  try { return JSON.parse(raw) as KnowledgeItem } catch { return null }
}

export async function kbList(kv?: KVNamespace): Promise<KnowledgeItem[]> {
  const ids = await kbListIds(kv)
  if (!ids.length) return []
  const items = await Promise.all(ids.map((id) => kbGet(kv, id)))
  return items.filter((x): x is KnowledgeItem => !!x)
}

async function kbSaveIndex(kv: KVNamespace, ids: string[]): Promise<void> {
  await kv.put('kb:index', JSON.stringify(ids))
}

function kbNewId(): string {
  return 'kb_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// 단순 키워드 매칭 기반 검색 (질문 → 관련 지식 N개)
// 향후 임베딩으로 업그레이드 가능 — 인터페이스는 동일하게 유지
export async function kbSearch(
  kv: KVNamespace | undefined,
  query: string,
  topK = 5,
): Promise<KnowledgeItem[]> {
  const items = await kbList(kv)
  if (!items.length || !query.trim()) return items.slice(0, topK)

  // 1) 질문을 토큰화 (한국어 + 영문, 2자 이상)
  const tokens = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2)

  if (!tokens.length) return items.slice(0, topK)

  // 2) 각 항목 점수 계산
  type Scored = { item: KnowledgeItem; score: number }
  const scored: Scored[] = items.map((item) => {
    const haystack = (
      item.title + ' ' + (item.tags || []).join(' ') + ' ' + item.content
    ).toLowerCase()

    let score = 0
    for (const tok of tokens) {
      // 제목 매칭은 가중치 5
      if (item.title.toLowerCase().includes(tok)) score += 5
      // 태그 매칭은 가중치 4
      if ((item.tags || []).some((tg) => tg.toLowerCase().includes(tok))) score += 4
      // 본문 매칭은 가중치 1 (중복 카운트)
      const matches = haystack.split(tok).length - 1
      score += matches
    }
    // priority 가중치 (1=최우선 → +4, 5=보조 → +0)
    score += (5 - (item.priority || 3))
    return { item, score }
  })

  // 3) 점수 내림차순, 0점은 제외 (단 검색결과 0개면 priority 상위 항목 반환)
  scored.sort((a, b) => b.score - a.score)
  const positive = scored.filter((s) => s.score > 0)
  if (positive.length) return positive.slice(0, topK).map((s) => s.item)

  // fallback: priority 1 항목들
  return items
    .sort((a, b) => (a.priority || 3) - (b.priority || 3))
    .slice(0, topK)
}

// 챗봇 시스템 프롬프트에 주입할 컨텍스트 문자열 생성
export function kbBuildContext(items: KnowledgeItem[]): string {
  if (!items.length) return ''
  const lines: string[] = ['## Knowledge Base (사내 자료 — 답변에 우선 활용)']
  items.forEach((it, idx) => {
    lines.push(`\n### [${idx + 1}] ${it.title}`)
    lines.push(`Category: ${it.category} | Tags: ${(it.tags || []).join(', ')}`)
    lines.push(it.content)
  })
  lines.push(
    '\n위 자료를 우선 근거로 답변하세요. 자료에 없는 정보를 추측하지 말고, 모르면 "lab@ks-industry.com 으로 문의 부탁드립니다"로 안내하세요.',
  )
  return lines.join('\n')
}

// ---------- KB Admin API ----------

cms.get('/api/admin/kb', requireAuth, async (c) => {
  const items = await kbList(c.env.CMS_KV)
  // 최신 순 정렬
  items.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0))
  return c.json({ items, total: items.length, categories: KB_CATEGORIES })
})

cms.post('/api/admin/kb', requireAuth, async (c) => {
  const kv = c.env.CMS_KV
  if (!kv) return c.json({ error: 'kv_not_bound' }, 500)
  const body = await c.req.json<Partial<KnowledgeItem>>()
  if (!body.title || !body.content) {
    return c.json({ error: 'title_and_content_required' }, 400)
  }
  const id = kbNewId()
  const item: KnowledgeItem = {
    id,
    title: body.title,
    category: (body.category as any) || 'etc',
    content: body.content,
    tags: Array.isArray(body.tags) ? body.tags : [],
    priority: typeof body.priority === 'number' ? body.priority : 3,
    updated_at: Date.now(),
  }
  await kv.put(`kb:item:${id}`, JSON.stringify(item))
  const ids = await kbListIds(kv)
  ids.push(id)
  await kbSaveIndex(kv, ids)
  return c.json({ ok: true, item })
})

cms.put('/api/admin/kb/:id', requireAuth, async (c) => {
  const kv = c.env.CMS_KV
  if (!kv) return c.json({ error: 'kv_not_bound' }, 500)
  const id = c.req.param('id')
  const existing = await kbGet(kv, id)
  if (!existing) return c.json({ error: 'not_found' }, 404)
  const body = await c.req.json<Partial<KnowledgeItem>>()
  const item: KnowledgeItem = {
    ...existing,
    title: body.title ?? existing.title,
    category: (body.category as any) ?? existing.category,
    content: body.content ?? existing.content,
    tags: Array.isArray(body.tags) ? body.tags : existing.tags,
    priority: typeof body.priority === 'number' ? body.priority : existing.priority,
    updated_at: Date.now(),
  }
  await kv.put(`kb:item:${id}`, JSON.stringify(item))
  return c.json({ ok: true, item })
})

cms.delete('/api/admin/kb/:id', requireAuth, async (c) => {
  const kv = c.env.CMS_KV
  if (!kv) return c.json({ error: 'kv_not_bound' }, 500)
  const id = c.req.param('id')
  await kv.delete(`kb:item:${id}`)
  const ids = (await kbListIds(kv)).filter((x) => x !== id)
  await kbSaveIndex(kv, ids)
  return c.json({ ok: true })
})

// 시드 데이터 일괄 적재 — 빈 KB일 때만 동작
cms.post('/api/admin/kb/seed', requireAuth, async (c) => {
  const kv = c.env.CMS_KV
  if (!kv) return c.json({ error: 'kv_not_bound' }, 500)
  const existing = await kbListIds(kv)
  if (existing.length > 0) {
    return c.json({ error: 'kb_not_empty', count: existing.length }, 400)
  }
  const seeds = getKbSeedData()
  const ids: string[] = []
  for (const seed of seeds) {
    const id = kbNewId()
    const item: KnowledgeItem = { ...seed, id, updated_at: Date.now() }
    await kv.put(`kb:item:${id}`, JSON.stringify(item))
    ids.push(id)
  }
  await kbSaveIndex(kv, ids)
  return c.json({ ok: true, seeded: ids.length })
})

// ---------- 시드 데이터 ----------
function getKbSeedData(): Omit<KnowledgeItem, 'id' | 'updated_at'>[] {
  return [
    {
      title: 'KS Industry — 회사 개요',
      category: 'company',
      priority: 1,
      tags: ['회사', '연혁', 'KSI', '해상크레인', '본사'],
      content: `## KS Industry (주식회사 케이에스인더스트리)

- **사업**: 해상크레인·조선기자재 제조 30년+ 노하우
- **본사**: 경남 함안군 군북면 석교천길 223 (8,980평 부지, 3,634평 제조동)
- **연간 생산능력**: 해상크레인 720대/년
- **국내 점유율**: 동종 기업과 함께 약 99% (KSI 목표 비중 6:4)
- **사업 비전**: KS Industry 3.0 — 제조 리더 → 디지털 전환 → 지능형 엣지 산업 AI
- **R&D**: Marine Robotics Lab 부설연구소
- **연구소 입주**: 울산정보산업진흥원 (2026.05~)`,
    },
    {
      title: 'SentinAI — 제품 정의',
      category: 'product',
      priority: 1,
      tags: ['SentinAI', '센티나이', '에이전트', '멀티모달', '정비'],
      content: `## SentinAI (센티나이)

**Sentinel(파수꾼) + AI**. 보고·듣고·판단하는 멀티모달 정비 에이전트.

### 핵심 가치
- **SEE**: 스마트 글래스 카메라 + 도면 비전 모델로 부품·결함·SOP 단계를 실시간 인식
- **HEAR**: 환경 음향 이상탐지 + 음성 명령 (손이 자유로워야 진짜 현장 도구)
- **DECIDE**: 근거잠금 RAG + 에이전트 플래너가 "해야 할 다음 행동"을 명령서로 출력

### 작동 환경
- 완전 폐쇄망 온디바이스 추론 (Jetson Orin 급 sLM)
- 통신 끊긴 군 격실·전차 내부·함정 최하층에서도 100% 동작
- 상갑판/지상 복귀 시 자동 동기화

### 슬로건
"고소음 폐쇄공간의 극한환경에서도 엣지 sLM MRO 에이전트는 멈추지 않습니다."`,
    },
    {
      title: 'SentinAI Edge Hardware Package — 번들 구성',
      category: 'product',
      priority: 1,
      tags: ['하드웨어', '번들', '스마트글래스', 'DPVR', '포켓PC', '골전도', '성대마이크'],
      content: `## SentinAI Edge Hardware Package

태블릿 앱이 아닙니다. **일체형 하드웨어 번들**로 공급됩니다.

### 구성품
1. **스마트 글래스** — DPVR AI 스마트 글래스 (군사 환경 커스텀 개조)
2. **골전도 오디오** — 고소음 환경에서 명령 음성 명확 전달
3. **성대 진동 마이크** — 외부 노이즈와 무관하게 발화자 음성만 추출
4. **sLM MRO Pocket PC** — 엣지 추론 디바이스 (Jetson Orin 급)

### 공급 방식
- 정비 상황 및 인원별 패키지로 제공
- B2G 시장 진입 장벽을 낮추고 단가 상승 효과
- 정비사가 별도 디바이스 구매 없이 즉시 가동`,
    },
    {
      title: '핵심 기술 — 폐쇄망 온디바이스 sLM',
      category: 'tech',
      priority: 2,
      tags: ['sLM', '엣지AI', '폐쇄망', '온디바이스', 'Jetson', 'RAG'],
      content: `## 핵심 기술 스택

### 1. 폐쇄망 온디바이스 sLM
- Jetson Orin 급 엣지 디바이스에서 자체 sLM 추론
- 클라우드 의존 0 — 통신 두절 환경 완전 동작
- 군 사이버보안(CMMC급) 인증 트랙 진행 중

### 2. 멀티모달 입력 처리
- **비전**: 도면·부품·결함 인식
- **음성**: STT + 음성 명령 (PTT 모드)
- **음향**: 환경 음향 이상탐지 (Acoustic AI)

### 3. 근거잠금 RAG
- 정비교범·도면·SOP를 벡터 DB에 인덱싱
- 답변 시 페이지·문단 인용 강제 (할루시네이션 차단)
- 에이전트 플래너가 "다음 행동"을 명령서 형식으로 출력`,
    },
    {
      title: '도입 절차 — B2G 파일럿부터 본 도입까지',
      category: 'process',
      priority: 2,
      tags: ['도입', 'PoC', '파일럿', '절차', 'B2G', '국방', '미팅'],
      content: `## SentinAI 도입 프로세스

### 1단계 — 사전 협의 (1~2주)
- 미팅을 통한 정비 환경/요구사항 파악
- NDA 체결 후 상세 자료 제공

### 2단계 — 파일럿 (PoC, 4~8주)
- 정비창 1개 단위 소규모 도입
- 우리 측 엔지니어 현장 동행
- KPI 측정: 정비 시간 단축률, 오류 감소율

### 3단계 — 본 도입
- 정비창/부대 단위 패키지 공급
- 사용자 교육 + 지속 운영 지원
- 자료(교범·도면) 자체 학습 모듈 인도

### 문의
- E-Mail: lab@ks-industry.com
- 사이트 우측 하단 챗봇 → "미팅 요청" 또는 문의 폼`,
    },
    {
      title: '사업 로드맵 — KS Industry 3.0',
      category: 'roadmap',
      priority: 2,
      tags: ['로드맵', '비전', '3.0', '전략', 'B2G', 'B2B'],
      content: `## KS Industry 3.0 로드맵

### 1.0 (1990s~2010s) — 제조 리더
- 해상크레인·조선기자재 30년 노하우 축적
- 국내 점유율 약 99% (동종 기업 합산)

### 2.0 (2020~2024) — 디지털 전환 시작
- 스마트 팩토리, 품질관리 자동화
- 사물인터넷(IoT) 기반 모니터링 도입

### 3.0 (2025~) — 지능형 엣지 산업 AI
- **Marine Robotics Lab** 부설연구소 설립
- 울산정보산업진흥원 입주 (2026.05~)
- **SentinAI** 출시 — 국방 MRO 시장 진입
- 향후 조선해양·제조생산 현장으로 확장

### 주요 마일스톤
- 2026.05 — 울산 LAB 입주
- 2026.하반기 — B2G 파일럿 가동
- 2027 — 국방 본 도입 + 조선해양 확장
- 2028 — 글로벌 진출 (미국·동남아·중동)`,
    },
    {
      title: '연락처 및 미팅 요청',
      category: 'contact',
      priority: 3,
      tags: ['연락처', '이메일', '미팅', '문의', '주소'],
      content: `## 연락처

### 본사 (HQ)
- 주소: 경남 함안군 군북면 석교천길 223
- 사업: 해상크레인·조선기자재 제조

### 연구소 (LAB) — 2026.05 입주
- 위치: 울산정보산업진흥원
- 사업: SentinAI 개발 및 국방 MRO

### E-Mail
- **lab@ks-industry.com**

### 미팅 요청
사이트 메인페이지의 "문의하기" 폼 또는 챗봇에서 "미팅 요청"이라고 말씀해주시면 담당자가 연락드립니다.`,
    },
    {
      title: 'FAQ — 자주 묻는 질문',
      category: 'faq',
      priority: 3,
      tags: ['FAQ', 'Q&A', '질문'],
      content: `## 자주 묻는 질문

### Q1. SentinAI는 일반 LLM 챗봇과 어떻게 다른가요?
- 클라우드 LLM 의존하지 않습니다. 통신 끊긴 폐쇄망 환경에서 100% 동작합니다.
- 멀티모달(텍스트·음성·도면·환경음)을 동시 처리합니다.
- 근거잠금 RAG로 정비교범 페이지·문단 인용을 강제해 할루시네이션을 차단합니다.

### Q2. 군용에만 쓸 수 있나요?
- 국방을 1차 시장으로 진입하지만, 기술은 조선해양·제조생산 어디든 적용 가능합니다.
- 폐쇄망 동작은 함정·플랜트·공장 모두에 가치 있습니다.

### Q3. 단순 SW만 구매할 수 있나요?
- 아니요. 일체형 하드웨어 번들로만 공급합니다.
- 스마트 글래스+골전도 오디오+성대 마이크+sLM 포켓PC가 한 세트입니다.

### Q4. 가격이 어느 정도인가요?
- 정비 상황·인원 규모별 패키지로 산정합니다.
- 정확한 견적은 lab@ks-industry.com 으로 문의 부탁드립니다.`,
    },
  ]
}

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
