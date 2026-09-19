// 회사 이름 검색 (공정위 2026 공시대상기업집단 계열회사 3,538개)
// 쓰는 곳: <div id="company-search"></div> 를 두고 companies.js 다음에 이 파일을 불러온다.
// 검색어와 결과는 어디에도 보내거나 저장하지 않는다.
(function () {
  const READ = { A: '에이', B: '비', C: '씨', D: '디', E: '이', F: '에프', G: '지', H: '에이치', I: '아이', J: '제이',
    K: '케이', L: '엘', M: '엠', N: '엔', O: '오', P: '피', Q: '큐', R: '알', S: '에스', T: '티', U: '유', V: '브이',
    W: '더블유', X: '엑스', Y: '와이', Z: '지' };
  const base = s => s.normalize('NFC')
    .replace(/\(주\)|㈜|주식회사|\(유\)|유한책임회사|유한회사|\(재\)|\(사\)|\(합\)/g, '')
    .replace(/&/g, '앤')
    .replace(/[\s()\[\]·.,\-'"/]/g, '')
    .toUpperCase();
  const kor = s => s.replace(/[A-Z]/g, ch => READ[ch]);

  const box = document.getElementById('company-search');
  if (!box || !window.COMPANIES) return;
  // data-mode="collab": 협력자용(지인 회사 확인). 기본: 응답자용(설문에서 고를 기업집단 안내)
  const collab = box.dataset.mode === 'collab';
  const MSG = collab ? {
    label: '지인 회사가 대상인지 검색해 보기',
    ok: '<b>✔ 설문 대상 회사입니다.</b> 오른쪽은 그 회사가 속한 기업집단입니다.',
    none: '<b>목록에서 찾지 못했습니다.</b><br>회사 이름을 짧게 줄여 다시 검색해 보세요(예: \'삼성전자\' → \'삼성\'). ' +
          '그래도 없지만 대기업 계열사라면 응답할 때 기업집단 목록에서 \'기타\'를 고르고 회사명을 적으면 됩니다.',
  } : {
    label: '회사 이름으로 검색',
    ok: '<b>✔ 설문 대상 회사입니다.</b> 설문 첫 부분의 기업집단 목록에서 오른쪽에 적힌 기업집단을 골라 주세요.',
    none: '<b>목록에서 찾지 못했습니다.</b><br>회사 이름을 짧게 줄여 다시 검색해 보세요(예: \'삼성전자\' → \'삼성\'). ' +
          '그래도 없지만 대기업 계열사라고 생각되시면 응답해 주시고, 설문의 기업집단 목록에서 \'기타\'를 고른 뒤 회사명을 적어 주세요.',
  };

  const groups = window.GROUPS.map(g => { const b = base(g); return { label: g, b, k: kor(b) }; });
  const list = window.COMPANIES.map(([gi, name]) => { const b = base(name); return { name, gi, b, k: kor(b) }; });

  box.innerHTML =
    '<label class="cs-label" for="cs-input">' + MSG.label + '</label>' +
    '<input id="cs-input" class="cs-input" type="search" autocomplete="off" placeholder="예: 삼성전자, SK하이닉스, 카카오뱅크">' +
    '<div id="cs-out" class="cs-out" aria-live="polite"></div>';
  const input = box.querySelector('#cs-input');
  const out = box.querySelector('#cs-out');
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function run() {
    const q = base(input.value);
    const qk = kor(q);
    if (qk.length < 2) { out.innerHTML = ''; return; }
    const hit = x => x.k.includes(qk) || x.b.includes(q);
    const gHits = groups.filter(hit);
    const cHits = list.filter(hit)
      .sort((a, b) => (b.k.startsWith(qk) - a.k.startsWith(qk)) || (a.name.length - b.name.length));

    if (!gHits.length && !cHits.length) {
      out.innerHTML = '<div class="cs-none">' + MSG.none + '</div>';
      return;
    }
    let html = '<div class="cs-ok">' + MSG.ok + '</div><ul class="cs-list">';
    gHits.slice(0, 3).forEach(g => {
      html += `<li><span>${esc(g.label)} 소속 회사 전체</span><em>${esc(g.label)}</em></li>`;
    });
    // 처음엔 FIRST줄만, [더 보기]를 누르면 LIMIT줄까지 스크롤 목록으로 펼친다.
    const FIRST = collab ? 5 : 15;
    const LIMIT = 100;
    const row = c => `<li><span>${esc(c.name)}</span><em>${esc(groups[c.gi].label)}</em></li>`;
    html += cHits.slice(0, FIRST).map(row).join('') + '</ul>';
    const rest = cHits.slice(FIRST, LIMIT);
    if (rest.length) {
      html += `<ul class="cs-list cs-rest" hidden>${rest.map(row).join('')}</ul>` +
        `<button type="button" class="cs-toggle">더 보기 (${rest.length}개)</button>`;
    }
    if (cHits.length > LIMIT) html += `<p class="cs-more">결과가 많아 ${LIMIT}개까지만 보여 드립니다. 이름을 더 입력해 보세요.</p>`;
    out.innerHTML = html;
    const btn = out.querySelector('.cs-toggle');
    if (btn) btn.addEventListener('click', () => {
      const r = out.querySelector('.cs-rest');
      r.hidden = !r.hidden;
      btn.textContent = r.hidden ? `더 보기 (${rest.length}개)` : '접기';
    });
  }
  input.addEventListener('input', run);
})();
