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
// 실제 sentinai.kr 페이지 스크롤 순서대로 정렬
// — home.tsx의 isVisible(id) 분기와 1:1 매칭되어야 토글이 실제로 동작
export const LAYOUT_SECTIONS: Array<{ id: string; label: string; defaultVisible: boolean }> = [
  { id: 'kpi', label: 'KPI · Proven Performance (핵심 지표 6개)', defaultVisible: true },
  { id: 'industries', label: 'Industries — sLM MRO 3개 산업 (국방/조선/제조)', defaultVisible: true },
  { id: 'applications', label: 'Applications · 적용 사례', defaultVisible: true },
  { id: 'sentinai', label: 'SentinAI 3-Pillar (See/Hear/Decide)', defaultVisible: true },
  { id: 'solutions', label: 'Solution · 8대 모듈 + 차별화 비교', defaultVisible: true },
  { id: 'architecture', label: 'Architecture · 소버린 엣지', defaultVisible: true },
  { id: 'forces', label: 'Forces · 육·해·공 군별 제품', defaultVisible: true },
  { id: 'hardware', label: 'Hardware · 엣지 HW 번들', defaultVisible: true },
  { id: 'roadmap', label: 'Roadmap · 실행 로드맵', defaultVisible: true },
  { id: 'contact', label: 'Contact · 문의 폼', defaultVisible: true },
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

export type KbCategory =
  | 'company' | 'product' | 'tech' | 'process'
  | 'contact' | 'roadmap' | 'faq'
  | 'industry' | 'reference'  // 신규: 인접 산업 지식 / 외부 참조 자료
  | 'etc'

export type KnowledgeItem = {
  id: string
  title: string
  category: KbCategory
  content: string        // Markdown 본문
  tags: string[]
  priority: number       // 1(최우선) ~ 5(보조)
  updated_at: number
  source?: string        // 출처 식별자 — 예: 'pdf:파일명.pdf', 'manual', 'seed'
  source_url?: string    // 원본 PDF 등 URL (R2)
  chunk_index?: number   // 같은 source 내 청크 순번 (1부터)
  chunk_total?: number   // 같은 source의 전체 청크 수
}

export const KB_CATEGORIES = [
  { id: 'company',   label: '회사 개요' },
  { id: 'product',   label: '제품·SentinAI' },
  { id: 'tech',      label: '기술·특허' },
  { id: 'process',   label: '도입·절차' },
  { id: 'roadmap',   label: '로드맵' },
  { id: 'contact',   label: '연락처' },
  { id: 'faq',       label: 'FAQ' },
  { id: 'industry',  label: '인접 산업 지식' },  // 항공 MRO, 해운, 조선 등
  { id: 'reference', label: '참조 자료' },        // 논문·보고서 발췌
  { id: 'etc',       label: '기타' },
] as const

// 인접 지식 카테고리 (RAG 답변 시 '외부 자료 기반' 표기 대상)
export const KB_EXTERNAL_CATEGORIES: KbCategory[] = ['industry', 'reference']

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
    // priority 가중치 강화 — 본업(P1~3) vs 인접 지식(P4~5) 명확 분리
    // P1=+6, P2=+4, P3=+2, P4=+0, P5=-1
    const p = item.priority || 3
    const priorityBonus = p === 1 ? 6 : p === 2 ? 4 : p === 3 ? 2 : p === 4 ? 0 : -1
    score += priorityBonus
    return { item, score }
  })

  // 3) 점수 내림차순, 0점 이하는 제외 (단 검색결과 0개면 priority 상위 항목 반환)
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
  const hasExternal = items.some((it) => KB_EXTERNAL_CATEGORIES.includes(it.category as KbCategory))
  const lines: string[] = ['## Knowledge Base (참조 자료 — 답변에 우선 활용)']
  items.forEach((it, idx) => {
    const isExternal = KB_EXTERNAL_CATEGORIES.includes(it.category as KbCategory)
    const tag = isExternal ? '🌐 외부 자료' : '🏢 본사 자료'
    lines.push(`\n### [${idx + 1}] ${tag} | ${it.title}`)
    lines.push(`Category: ${it.category} | Tags: ${(it.tags || []).join(', ')}${it.source ? ` | Source: ${it.source}` : ''}`)
    lines.push(it.content)
  })
  lines.push(
    '\n위 자료를 우선 근거로 답변하세요. 자료에 없는 정보를 추측하지 말고, 모르면 "hschung@ssii.co.kr 으로 문의 부탁드립니다"로 안내하세요.',
  )
  if (hasExternal) {
    lines.push(
      '\n⚠️ 중요: 위 자료 중 "🌐 외부 자료"로 표시된 항목을 활용해 답변할 때는, 답변 마지막 줄에 정확히 다음 문구를 추가하세요:\n> *※ 이 답변은 KS Industry 외부 공개 자료를 참고했습니다. 회사 공식 입장이 아닐 수 있습니다.*\n본사 자료(🏢)만 활용한 답변에는 이 문구를 붙이지 마세요.',
    )
  }
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
    source: body.source,
    source_url: body.source_url,
    chunk_index: body.chunk_index,
    chunk_total: body.chunk_total,
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
    source: body.source ?? existing.source,
    source_url: body.source_url ?? existing.source_url,
    chunk_index: body.chunk_index ?? existing.chunk_index,
    chunk_total: body.chunk_total ?? existing.chunk_total,
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

// ---------- PDF 일괄 등록 (브라우저에서 PDF.js로 추출한 청크 배열을 받음) ----------
// 요청 본문:
// {
//   source: 'pdf:파일명.pdf',
//   source_label: '파일명.pdf',
//   category: 'industry',
//   priority: 4,
//   tags: ['MRO', '항공'],
//   chunks: [{ title?, content }, ...]  // 클라이언트에서 분할한 청크들
// }
cms.post('/api/admin/kb/bulk', requireAuth, async (c) => {
  const kv = c.env.CMS_KV
  if (!kv) return c.json({ error: 'kv_not_bound' }, 500)
  type BulkBody = {
    source?: string
    source_label?: string
    category?: KbCategory
    priority?: number
    tags?: string[]
    chunks?: { title?: string; content: string }[]
  }
  const body = await c.req.json<BulkBody>()
  if (!body.chunks || !Array.isArray(body.chunks) || body.chunks.length === 0) {
    return c.json({ error: 'chunks_required' }, 400)
  }
  // 사이즈 가드: 한 번에 최대 300개, 청크 1개당 최대 5000자
  if (body.chunks.length > 300) {
    return c.json({ error: 'too_many_chunks', max: 300 }, 400)
  }
  const category: KbCategory = (body.category as KbCategory) || 'reference'
  const priority = typeof body.priority === 'number' ? body.priority : 4
  const baseTags = Array.isArray(body.tags) ? body.tags : []
  const source = body.source || 'pdf:upload'
  const sourceLabel = body.source_label || source
  const total = body.chunks.length

  const ids = await kbListIds(kv)
  const created: { id: string; title: string }[] = []
  const now = Date.now()

  for (let i = 0; i < body.chunks.length; i++) {
    const ch = body.chunks[i]
    const content = (ch.content || '').slice(0, 5000).trim()
    if (!content) continue
    const id = kbNewId()
    const defaultTitle = `${sourceLabel} (${i + 1}/${total})`
    const item: KnowledgeItem = {
      id,
      title: (ch.title && ch.title.trim()) || defaultTitle,
      category,
      content,
      tags: baseTags,
      priority,
      updated_at: now + i, // 일괄 등록 시 등록 순서 보존
      source,
      chunk_index: i + 1,
      chunk_total: total,
    }
    await kv.put(`kb:item:${id}`, JSON.stringify(item))
    ids.push(id)
    created.push({ id, title: item.title })
  }
  await kbSaveIndex(kv, ids)
  return c.json({ ok: true, created: created.length, source, items: created })
})

// 같은 source의 모든 KB 항목 일괄 삭제 (PDF 한 건 통째로 제거)
cms.delete('/api/admin/kb/source/:source', requireAuth, async (c) => {
  const kv = c.env.CMS_KV
  if (!kv) return c.json({ error: 'kv_not_bound' }, 500)
  const source = decodeURIComponent(c.req.param('source'))
  if (!source) return c.json({ error: 'source_required' }, 400)
  const items = await kbList(kv)
  const toDelete = items.filter((it) => it.source === source)
  if (toDelete.length === 0) return c.json({ ok: true, deleted: 0 })
  for (const it of toDelete) {
    await kv.delete(`kb:item:${it.id}`)
  }
  const remainIds = (await kbListIds(kv)).filter((id) => !toDelete.some((d) => d.id === id))
  await kbSaveIndex(kv, remainIds)
  return c.json({ ok: true, deleted: toDelete.length })
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
      tags: ['회사', '소개', 'KSI', 'KS인더스트리', '케이에스인더스트리', 'ks-industry', '본사', '함안', 'overview'],
      content: `## KS Industry (주식회사 케이에스인더스트리)

**한 줄 정의**: 해상크레인·조선기자재 제조 22년+ 노하우를 기반으로, 지능형 엣지 산업 AI 기업으로 진화하는 한국의 제조-AI 융합 기업.

### 핵심 정보
- **법인명**: 주식회사 케이에스인더스트리 (KS Industry Co., Ltd.)
- **본사 소재지**: 경남 함안군 군북면 석교천길 223
- **부지/제조동 규모**: 8,980평 부지 / 3,634평 제조동
- **이메일**: hschung@ssii.co.kr

### 사업 비전 — KS Industry 3.0
**제조 리더 → 디지털 전환 → 지능형 엣지 산업 AI**

22년간 축적한 해상크레인 제조 노하우와 산업현장 데이터를, 폐쇄망 온디바이스 sLM 에이전트 **SentinAI**로 융합해 국방·조선해양·산업현장 MRO 시장을 개척합니다.`,
    },
    {
      title: 'KS Industry 본사 사업 — 해상크레인·조선기자재 제조',
      category: 'business',
      priority: 2,
      tags: ['해상크레인', '조선기자재', '제조', '본사사업', 'marine crane', 'manufacturing', '함안'],
      content: `## 본사 사업 — 해상크레인 & 조선기자재 제조

### 사업 영역
- **해상크레인**: 선박·해양구조물 적재용 크레인 설계·제조·공급
- **조선기자재**: 선박 건조에 필요한 핵심 자재 제조

### 제조 인프라
- **위치**: 경남 함안군 군북면 석교천길 223
- **부지**: 8,980평
- **제조동 면적**: 3,634평

### 핵심 경쟁력
- 22년 이상 누적된 설계·제조·품질관리 노하우
- 대규모 자체 제조 인프라 (외주 의존도 최소화)
- 산업 현장 데이터 축적 → AI 학습 자산으로 전환
- 국내 주요 조선소 및 해양 플랜트 기업 대상 공급 이력`,
    },
    {
      title: 'Marine Robotics Lab — KS Industry 부설연구소',
      category: 'company',
      priority: 1,
      tags: ['연구소', 'LAB', 'Marine Robotics Lab', '부설연구소', 'R&D', '울산', '울산정보산업진흥원', 'UIPA', 'research'],
      content: `## Marine Robotics Lab

KS Industry의 **AI·로보틱스 부설연구소**. 22년 제조 현장의 데이터·도메인 지식을 엣지 AI로 융합하는 R&D 거점.

### 위치 및 입주
- **입주 시설**: 울산정보산업진흥원 (UIPA)
- **입주 시점**: 2026년 5월
- **선정 배경**: 울산시·UIPA 협업 기반 산업AI 클러스터 참여

### 주요 R&D 영역
1. **엣지 sLM 추론**: Jetson Orin급 디바이스 위 자체 소형언어모델
2. **멀티모달 인지**: 비전(도면·부품·결함) + 음성(STT/명령) + 음향(이상탐지)
3. **근거잠금 RAG**: 정비교범·도면·SOP 기반 할루시네이션 차단 검색
4. **에이전트 플래너**: "다음 행동"을 명령서 형식으로 출력하는 워크플로우 엔진

### 대표 산출물
- **SentinAI** (센티나이) — 폐쇄망 온디바이스 멀티모달 MRO 에이전트
- SentinAI Edge Hardware Package — 스마트글래스 + 골전도 + 성대마이크 + Pocket PC 번들

### 협업 문의
- E-Mail: hschung@ssii.co.kr`,
    },
    {
      title: 'KS Industry는 어떤 회사인가요 — 정체성과 차별점',
      category: 'company',
      priority: 1,
      tags: ['차별점', '강점', '정체성', 'why', '왜KSI', '경쟁력', '제조AI', '융합', 'identity', 'differentiator'],
      content: `## KS Industry는 어떤 회사인가요?

### 한 줄 답변
> **"제조 현장을 22년 이상 경험한 한국 기업이, 그 현장 지식을 엣지 AI 에이전트로 다시 만드는 회사."**

### 일반 AI 스타트업과의 차별점

| 구분 | 일반 AI 스타트업 | KS Industry |
|------|-----------------|-------------|
| 출발점 | AI 기술에서 시작 → 현장 찾기 | 현장(22년)에서 시작 → AI로 디지털화 |
| 데이터 | 외부 데이터 의존 | 자체 제조·정비 데이터 보유 |
| 도메인 이해 | 학습 필요 | 이미 보유 (해상크레인·조선) |
| 인프라 | 클라우드 LLM 의존 | 폐쇄망 온디바이스 sLM 자체 개발 |
| 사업 모델 | SaaS 구독 | 하드웨어 번들 패키지 (B2G/B2B) |

### 세 가지 핵심 자산
1. **현장 자산** — 8,980평 본사 + 3,634평 제조동의 제조 인프라
2. **데이터 자산** — 22년 누적 정비·품질 데이터, 도면, SOP
3. **AI 자산** — Marine Robotics Lab의 SentinAI 엣지 에이전트 기술

### 회사가 향하는 곳
국방 MRO를 시작점으로, **조선해양 → 산업 제조 → 글로벌 인프라**까지. 통신이 끊긴 폐쇄공간·고소음 환경에서도 멈추지 않는 엣지 AI 에이전트를 세상에 공급합니다.

### 문의
- E-Mail: hschung@ssii.co.kr`,
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
  <!-- PDF.js (지식베이스 PDF 업로드 텍스트 추출용) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs" type="module"></script>
  <script type="module">
    // PDF.js worker 경로 설정 — admin.js에서 사용
    import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs'
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs'
    window.pdfjsLib = pdfjsLib
  </script>
  <script src="/static/admin.js"></script>
</body>
</html>`)
})

export default cms
