import { jsxRenderer } from 'hono/jsx-renderer'

// SEO 기본 상수 — 환경 변화 시 여기만 수정
const SITE_URL = 'https://sentinai.kr'
const SITE_NAME = 'SentinAI · KS Industry Marine Robotics Lab'
const SITE_TITLE = 'SentinAI, 보고 듣고 판단하는 멀티모달 AI MRO 에이전트'
const SITE_DESC =
  'SentinAI, 보고 듣고 판단하는 멀티모달 AI MRO 에이전트. KS인더스트리 마린로보틱스연구소가 22년 마린크레인 산업 노하우 위에 AI를 더해 함정·조선·국방·제조 산업의 예지정비를 새롭게 정의합니다.'
const SITE_KEYWORDS =
  '센티나이, SentinAI, KS인더스트리, 마린로보틱스연구소, MRO, 예지정비, Predictive Maintenance, sLM, Small Language Model, 엣지 AI, Edge AI, 함정 MRO, 조선 MRO, 국방 MRO, 마린크레인, Marine Crane, 해상크레인, 스마트팩토리, K-MRO, 송병권, 해양로봇, 산업 AI'
const OG_IMAGE = `${SITE_URL}/static/images/og-sentinai-v2.jpg`

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* ===== Primary SEO ===== */}
        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESC} />
        <meta name="keywords" content={SITE_KEYWORDS} />
        <meta name="author" content="KS Industry · Marine Robotics Lab" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#040814" />
        <link rel="canonical" href={SITE_URL + '/'} />

        {/* ===== Multilingual (hreflang) — 5개 언어 ===== */}
        <link rel="alternate" hreflang="ko" href={SITE_URL + '/?lang=ko'} />
        <link rel="alternate" hreflang="en" href={SITE_URL + '/?lang=en'} />
        <link rel="alternate" hreflang="zh" href={SITE_URL + '/?lang=zh'} />
        <link rel="alternate" hreflang="ja" href={SITE_URL + '/?lang=ja'} />
        <link rel="alternate" hreflang="es" href={SITE_URL + '/?lang=es'} />
        <link rel="alternate" hreflang="x-default" href={SITE_URL + '/'} />

        {/* ===== Open Graph (Facebook · KakaoTalk · 네이버 ) ===== */}
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESC} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL + '/'} />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:locale:alternate" content="zh_CN" />
        <meta property="og:locale:alternate" content="ja_JP" />
        <meta property="og:locale:alternate" content="es_ES" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:secure_url" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="SentinAI, 보고 듣고 판단하는 멀티모달 AI MRO 에이전트" />
        <meta property="og:image:type" content="image/jpeg" />

        {/* ===== Twitter / X ===== */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESC} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:image:alt" content="SentinAI, 보고 듣고 판단하는 멀티모달 AI MRO 에이전트" />

        {/* ===== 검색엔진 사이트 소유 확인 ===== */}
        <meta name="naver-site-verification" content="f2f26700746a8589f1d06e1069c26f79af29cecc" />
        <meta name="msvalidate.01" content="F770B5B30ADE1B894D4AE2F0F9E2DD23" />
        {/* Google: /googlee006bde4f01432cf.html 파일 방식으로 확인 완료 (2026-05-29) */}

        {/* ===== Favicon ===== */}
        <link rel="icon" type="image/svg+xml" href="/static/favicon.svg" />
        <link rel="apple-touch-icon" href="/static/favicon.svg" />

        {/* ===== JSON-LD: Organization ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'KS Industry',
              alternateName: ['KS인더스트리', '케이에스인더스트리'],
              url: SITE_URL,
              logo: SITE_URL + '/static/favicon.svg',
              description:
                '22년간 마린크레인 한 길을 걸어온 KS인더스트리는 글로벌 빅5 조선소의 동반자로서 국내 해상크레인 시장을 양분하고 있으며, 마린로보틱스연구소를 통해 함정·조선·국방·제조 산업의 AI 기반 MRO 플랫폼을 개발하고 있습니다.',
              foundingLocation: {
                '@type': 'Place',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: '석교천길 223',
                  addressLocality: '함안군 군북면',
                  addressRegion: '경상남도',
                  addressCountry: 'KR',
                },
              },
              address: {
                '@type': 'PostalAddress',
                streetAddress: '석교천길 223',
                addressLocality: '함안군 군북면',
                addressRegion: '경상남도',
                addressCountry: 'KR',
              },
              department: {
                '@type': 'ResearchOrganization',
                name: '마린로보틱스연구소 (Marine Robotics Lab)',
                url: SITE_URL,
              },
              sameAs: [SITE_URL],
              knowsAbout: [
                'Marine Crane',
                'Offshore Crane',
                'Predictive Maintenance',
                'Edge AI',
                'Small Language Model',
                'MRO Platform',
                'Industrial AI',
              ],
            }),
          }}
        />

        {/* ===== JSON-LD: WebSite (사이트링크 검색박스) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'SentinAI',
              alternateName: '센티나이',
              url: SITE_URL,
              inLanguage: ['ko', 'en', 'zh', 'ja', 'es'],
              description: SITE_DESC,
            }),
          }}
        />

        {/* ===== JSON-LD: SoftwareApplication (Product) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'SentinAI MRO Platform',
              alternateName: '센티나이 MRO 플랫폼',
              applicationCategory: 'BusinessApplication',
              applicationSubCategory: 'Predictive Maintenance · Edge AI',
              operatingSystem: 'Edge Device · Cloud · Hybrid',
              description:
                'NVIDIA Jetson 기반 엣지 디바이스와 sLM(Small Language Model)을 결합한 지능형 MRO 플랫폼. 함정·조선·국방·제조 현장의 설비 데이터를 실시간으로 보고 듣고 판단합니다.',
              creator: {
                '@type': 'Organization',
                name: 'KS Industry · Marine Robotics Lab',
              },
              offers: {
                '@type': 'Offer',
                availability: 'https://schema.org/PreOrder',
                description: '2027년 상반기 1단계 플랫폼 공식 출범 예정',
              },
            }),
          }}
        />

        {/* Tailwind (precompiled, no CDN JIT) */}
        <link href="/static/tailwind.css" rel="stylesheet" />

        {/* FontAwesome */}
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />

        {/* Google Fonts: Inter + Noto Sans KR/JP/SC */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+KR:wght@300;400;500;700;900&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />

        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body class="bg-ks-deep text-white font-sans antialiased">{children}</body>
    </html>
  )
})
