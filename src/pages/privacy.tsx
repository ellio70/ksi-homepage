// =====================================================
// /privacy — 개인정보처리방침
// 정통망법 + 개인정보보호법 준수: 문의 폼 동의 시 본 페이지로 안내
// =====================================================

export function PrivacyPage() {
  const updated = '2026-05-24'

  return (
    <div class="min-h-screen bg-ks-navy text-slate-100">
      <header class="border-b border-white/5">
        <div class="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <a href="/" class="text-lg font-display font-bold tracking-wider text-white">
            SentinAI
          </a>
          <a href="/" class="text-xs text-slate-400 hover:text-ks-cyan transition">
            ← 메인으로
          </a>
        </div>
      </header>

      <main class="max-w-3xl mx-auto px-6 py-16">
        <h1 class="text-3xl font-display font-bold mb-2">개인정보 처리방침</h1>
        <p class="text-sm text-slate-500 mb-12">최종 개정일: {updated}</p>

        <section class="space-y-10 text-sm leading-relaxed text-slate-300">
          <div>
            <h2 class="text-lg font-semibold text-white mb-3">1. 개인정보의 수집 항목 및 수집 방법</h2>
            <p>
              KS Industry Marine Robotics Lab(이하 "회사")는 SentinAI 서비스 운영을 위해
              <b class="text-slate-100"> sentinai.kr 의 문의 폼</b>을 통해 다음과 같은 개인정보를 수집합니다.
            </p>
            <ul class="mt-3 space-y-1 list-disc pl-5">
              <li><b class="text-slate-100">필수 항목</b>: 성함, 이메일 주소, 휴대폰 번호, 문의 내용</li>
              <li><b class="text-slate-100">선택 항목</b>: 소속·회사명, 관심 분야</li>
              <li><b class="text-slate-100">자동 수집 항목</b>: 접속 IP, User-Agent, 접수 일시, 사용 언어</li>
            </ul>
          </div>

          <div>
            <h2 class="text-lg font-semibold text-white mb-3">2. 개인정보의 수집 및 이용 목적</h2>
            <ul class="space-y-1 list-disc pl-5">
              <li>문의 내용에 대한 회신 및 후속 미팅·기술 상담 진행</li>
              <li>파트너십·투자·도입 검토 등 신사업 협력 커뮤니케이션</li>
              <li>(마케팅 수신 동의 시) SentinAI 신규 소식, 제품 업데이트, 산업 인사이트 안내</li>
              <li>서비스 부정 이용 방지 및 보안 사고 대응 (IP·UA 등 자동 수집 항목 한정)</li>
            </ul>
          </div>

          <div>
            <h2 class="text-lg font-semibold text-white mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <ul class="space-y-1 list-disc pl-5">
              <li><b class="text-slate-100">문의 정보</b>: 회신 완료 후 최대 <b>3년</b>까지 보관 (영업 이력 관리 목적)</li>
              <li><b class="text-slate-100">마케팅 수신 동의</b>: 동의 철회 시 즉시 파기</li>
              <li>관련 법령(전자상거래법, 통신비밀보호법 등)에 따라 별도 보관 의무가 있는 경우 그 기간 동안 보관</li>
            </ul>
          </div>

          <div>
            <h2 class="text-lg font-semibold text-white mb-3">4. 동의 거부 권리 및 거부 시 불이익</h2>
            <p>
              이용자는 개인정보 수집·이용에 동의하지 않을 권리가 있습니다. 다만 동의 거부 시
              <b class="text-slate-100"> 문의 접수 및 회신이 제한</b>될 수 있습니다. 마케팅 수신 동의는 선택 사항이며,
              동의하지 않아도 문의 회신은 정상적으로 받으실 수 있습니다.
            </p>
          </div>

          <div>
            <h2 class="text-lg font-semibold text-white mb-3">5. 개인정보의 제3자 제공</h2>
            <p>
              회사는 이용자의 개인정보를 외부에 제공하지 않습니다. 다만 다음의 경우는 예외로 합니다.
            </p>
            <ul class="mt-3 space-y-1 list-disc pl-5">
              <li>이용자가 사전에 명시적으로 동의한 경우</li>
              <li>법령에 근거하여 수사기관의 요구가 있는 경우</li>
            </ul>
          </div>

          <div>
            <h2 class="text-lg font-semibold text-white mb-3">6. 개인정보 처리 위탁</h2>
            <p>회사는 원활한 서비스 운영을 위해 다음의 업무를 위탁합니다.</p>
            <div class="mt-3 overflow-x-auto">
              <table class="w-full text-xs border border-white/10 rounded-lg">
                <thead class="bg-white/5">
                  <tr>
                    <th class="px-3 py-2 text-left text-slate-300 font-medium">수탁자</th>
                    <th class="px-3 py-2 text-left text-slate-300 font-medium">위탁 업무</th>
                    <th class="px-3 py-2 text-left text-slate-300 font-medium">보유·이용 기간</th>
                  </tr>
                </thead>
                <tbody class="text-slate-400">
                  <tr class="border-t border-white/5">
                    <td class="px-3 py-2">Cloudflare, Inc.</td>
                    <td class="px-3 py-2">웹 호스팅·데이터 저장(KV)</td>
                    <td class="px-3 py-2">서비스 제공 기간</td>
                  </tr>
                  <tr class="border-t border-white/5">
                    <td class="px-3 py-2">Resend, Inc.</td>
                    <td class="px-3 py-2">자동 회신 메일 발송</td>
                    <td class="px-3 py-2">서비스 제공 기간</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 class="text-lg font-semibold text-white mb-3">7. 이용자의 권리</h2>
            <p>이용자는 언제든지 아래 권리를 행사할 수 있습니다.</p>
            <ul class="mt-3 space-y-1 list-disc pl-5">
              <li>개인정보 열람·정정·삭제 요청</li>
              <li>개인정보 처리정지 요청</li>
              <li>동의 철회 (마케팅 수신 동의 포함)</li>
            </ul>
            <p class="mt-3">
              요청은 아래 연락처로 보내주시면 영업일 기준 7일 이내 처리해드립니다.
            </p>
          </div>

          <div>
            <h2 class="text-lg font-semibold text-white mb-3">8. 개인정보 보호책임자</h2>
            <div class="bg-white/5 rounded-lg p-5 space-y-2">
              <div><span class="text-slate-500 w-20 inline-block">담당자</span> 정현수 (대표이사)</div>
              <div><span class="text-slate-500 w-20 inline-block">이메일</span> <a href="mailto:hschung@ssii.co.kr" class="text-ks-cyan hover:underline">hschung@ssii.co.kr</a></div>
              <div><span class="text-slate-500 w-20 inline-block">주소</span> 경남 함안군 군북면 석교천길 223</div>
            </div>
          </div>

          <div>
            <h2 class="text-lg font-semibold text-white mb-3">9. 방침의 변경</h2>
            <p>
              본 처리방침은 법령·서비스 변경에 따라 개정될 수 있으며, 변경 시 본 페이지를 통해 사전 공지합니다.
            </p>
          </div>
        </section>

        <div class="mt-16 pt-8 border-t border-white/5 text-center">
          <a href="/" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 transition text-sm">
            ← 메인으로 돌아가기
          </a>
        </div>
      </main>

      <footer class="border-t border-white/5 py-8 text-center text-xs text-slate-500">
        © 2026 KS Industry · Marine Robotics Lab
      </footer>
    </div>
  )
}
