// 메모리 부족 환경용 우회 빌드 — vite 대신 esbuild 직접 사용
// vite build가 OOM Killed 당할 때 사용
import { build } from 'esbuild'
import { mkdir, writeFile, copyFile, readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { join, relative } from 'path'

const outdir = 'dist'

// 1) Worker 빌드 (src/index.tsx → dist/_worker.js)
await build({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  outfile: 'dist/_worker.js',
  jsx: 'automatic',
  jsxImportSource: 'hono/jsx',
  minify: true,
  external: [],
  conditions: ['workerd', 'worker', 'browser'],
  mainFields: ['module', 'main'],
  logLevel: 'info',
})

// 2) _routes.json 작성
await writeFile(
  'dist/_routes.json',
  JSON.stringify({ version: 1, include: ['/*'], exclude: ['/static/*'] })
)

// 3) public/ 정적 자산 복사 (static/* 디렉토리 포함)
async function copyDir(src, dst) {
  if (!existsSync(src)) return
  await mkdir(dst, { recursive: true })
  const entries = await readdir(src, { withFileTypes: true })
  for (const e of entries) {
    const s = join(src, e.name)
    const d = join(dst, e.name)
    if (e.isDirectory()) await copyDir(s, d)
    else await copyFile(s, d)
  }
}

await copyDir('public', 'dist')

console.log('✅ esbuild worker build complete')
