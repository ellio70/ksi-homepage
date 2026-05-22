import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>KS Industry · Marine Robotics Lab</title>
        <meta name="description" content="보고 듣고 판단하는, 지능형 엣지 MRO 플랫폼. KS인더스트리 마린로보틱스연구소." />

        {/* Open Graph */}
        <meta property="og:title" content="KS Industry · Marine Robotics Lab" />
        <meta property="og:description" content="보고 듣고 판단하는, 지능형 엣지 MRO 플랫폼" />
        <meta property="og:type" content="website" />

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/static/favicon.svg" />

        {/* Tailwind */}
        <script src="https://cdn.tailwindcss.com"></script>

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

        {/* Tailwind config */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      'ks-navy': '#070d1f',
                      'ks-navy2': '#0d1632',
                      'ks-deep': '#040814',
                      'ks-cyan': '#00d4ff',
                      'ks-cyan-soft': '#7ee0f5',
                      'ks-aqua': '#22d3ee',
                      'ks-glow': '#3b82f6',
                    },
                    fontFamily: {
                      sans: ["Inter","Noto Sans KR","Noto Sans JP","Noto Sans SC","ui-sans-serif","system-ui","sans-serif"],
                      display: ["Space Grotesk","Inter","Noto Sans KR","sans-serif"],
                    },
                  }
                }
              }
            `,
          }}
        ></script>
      </head>
      <body class="bg-ks-deep text-white font-sans antialiased">{children}</body>
    </html>
  )
})
