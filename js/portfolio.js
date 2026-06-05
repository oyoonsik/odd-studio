// =============================================
// 🔧 Notion 설정
// =============================================
const NOTION_TOKEN = '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';
const DATABASE_ID  = '375583e758ab8039bd0cec1c2ee3144d';

const CAT_KEY_MAP = {
  '병원·의원': 'hospital',
  '다이어트·식품': 'diet',
  '헬스·PT': 'pt',
  '학원·교육': 'academy',
  '피부·뷰티': 'beauty',
};

// =============================================
// Notion API 호출 (프록시 경유)
// =============================================
async function fetchNotionPortfolio() {
  const res = await fetch('/api/notion-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: NOTION_TOKEN,
      url: `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      body: {
        filter: { property: 'visible', checkbox: { equals: true } },
        sorts: [{ timestamp: 'created_time', direction: 'descending' }]
      }
    })
  });
  if (!res.ok) throw new Error('proxy error ' + res.status);
  return await res.json();
}

function parseNotionItem(page) {
  const p = page.properties;
  const getText   = (k) => p[k]?.rich_text?.[0]?.plain_text || '';
  const getTitle  = (k) => p[k]?.title?.[0]?.plain_text || '';
  const getSelect = (k) => p[k]?.select?.name || '';
  const getFile   = (k) => p[k]?.files?.[0]?.file?.url || p[k]?.files?.[0]?.external?.url || '';

  const categoryLabel = getSelect('category');
  const categoryKey   = CAT_KEY_MAP[categoryLabel] || 'etc';

  return {
    id:           page.id,
    title:        getTitle('이름') || getTitle('Name') || '제목 없음',
    category:     categoryKey,
    categoryLabel,
    imgSrc:       getFile('thumbnail'),
    longImgSrc:   getFile('image'),
    desc:         getText('desc') || '',
    features:     getText('features')
                    ? getText('features').split(',').map(s => s.trim()).filter(Boolean)
                    : [],
    designer:     getText('worker'),
  };
}

// =============================================
// 상태
// =============================================
let NOTION_DATA   = [];
let currentFilter = 'all';

// =============================================
// TAB 1 : 상세페이지
// =============================================
function renderDetail(filter = 'all') {
  currentFilter = filter;
  const grid = document.getElementById('portfolioGrid');
  const data = filter === 'all'
    ? NOTION_DATA
    : NOTION_DATA.filter(i => i.category === filter);

  if (!data.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:#666;">준비 중인 포트폴리오입니다.</div>`;
    return;
  }

  grid.innerHTML = data.map((item, idx) => `
    <div class="portfolio-card" onclick="openDetailModal(${idx}, '${filter}')">
      <div class="card-img-wrap">
        ${item.imgSrc
          ? `<img class="card-img" src="${item.imgSrc}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/600x800/141414/ffffff?text=O.D.D'">`
          : `<div class="card-img" style="background:#141414;display:flex;align-items:center;justify-content:center;color:#444;font-size:12px;height:100%;">이미지 없음</div>`
        }
        <div class="card-overlay"></div>
      </div>
      <div class="card-info">
        <span class="card-tag">${item.categoryLabel || '기타'}</span>
        <h3 class="card-title">${item.title}</h3>
        ${item.desc ? `<p class="card-desc">${item.desc}</p>` : ''}
        ${item.designer ? `<div class="card-designer"><span>${item.designer}</span></div>` : ''}
      </div>
    </div>`).join('');
}

function filterDetail(cat, e) {
  document.querySelectorAll('#tab-detail .filter-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  renderDetail(cat);
}

function openDetailModal(idx, filter) {
  const data = filter === 'all'
    ? NOTION_DATA
    : NOTION_DATA.filter(i => i.category === filter);
  const item = data[idx];
  if (!item) return;

  document.getElementById('m-tag').textContent    = item.categoryLabel || '기타';
  document.getElementById('m-title').textContent  = item.title;
  document.getElementById('m-desc').textContent   = item.desc;
  document.getElementById('m-features').innerHTML = item.features.map(f => `<li>${f}</li>`).join('');

  const dw = document.getElementById('m-designer-wrap');
  const dn = document.getElementById('m-designer');
  if (item.designer) { dn.textContent = item.designer; dw.style.display = 'inline-flex'; }
  else { dw.style.display = 'none'; }

  const longImg = document.getElementById('m-long-img');
  const viewer  = document.querySelector('.modal-viewer');
  if (item.longImgSrc) {
    longImg.src = item.longImgSrc;
    longImg.style.display = 'block';
    viewer.style.display = '';
  } else {
    longImg.src = '';
    longImg.style.display = 'none';
    viewer.style.display = 'none';
  }

  document.querySelector('.modal-viewer').scrollTop = 0;
  document.getElementById('portfolioModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
  document.getElementById('portfolioModal').classList.remove('open');
  document.body.style.overflow = '';
}

// =============================================
// TAB 전환
// =============================================
function switchTab(tab, btn) {
  document.querySelectorAll('.main-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  ['detail','website','template'].forEach(t => {
    document.getElementById('tab-' + t).style.display = t === tab ? '' : 'none';
  });
  if (tab === 'website')  renderWebPortfolio();
  if (tab === 'template') renderTemplates('all');
}

// =============================================
// TAB 2 : 홈페이지 제작
// =============================================
const WEBSITE_DATA = [
  { id:'w1', title:'지니앤솔루션 홈페이지', desc:'아임웹 기반으로 제작된 브랜드 홈페이지', tags:['브랜드 홈페이지'], liveTag:'live', type:'Brand Website', thumbSrc:'images/site_02.jpg', url:'https://geniensol.co.kr/' },
  { id:'w2', title:'DB 어드민페이지', desc:'원장 신뢰형 구조 + 즉시 예약 CTA 중심. 광고 연동 최적화 랜딩.', tags:['어드민 페이지'], liveTag:'live', type:'Landing Page', thumbSrc:'images/site_01.jpg', url:'https://oyoonsik.github.io/landing-templates/admin_dashboard.html' },
  { id:'w3', title:'창업문의 전환 사이트', desc:'창업 문의를 위한 디비 연동 랜딩페이지 시간.이름.전화번호.접수 버튼.', tags:['랜딩페이지', '창업페이지'], liveTag:'live', type:'Landing Page', thumbSrc:'images/site_03.jpg', url:'https://www.momstouch-franchise.com/gnd68b52c0fe22fe' },
  { id:'w4', title:'광고 디비 문의 페이지', desc:'회사 디비 문의를 위한 페이지 디비·카카오 플로팅 버튼.', tags:['랜딩페이지'], liveTag:'live', type:'Landing Page', thumbSrc:'images/site_0.jpg', url:'https://oyoonsik.github.io/landing-templates/' },
  { id:'w5', title:'브랜드 홈페이지', desc:'워드프레스 기반으로 만든 브랜드 홈페이지', tags:['회사홈페이지', '브랜드'], liveTag:'live', type:'Brand Website', thumbSrc:'images/site_04.jpg', url:'https://geniend.com/' },
  { id:'w6', title:'블로그형식의 랜딩페이지', desc:'이미지화가 아닌 코드화 랜딩 + AI 기능과 DB 연동', tags:['랜딩페이지', 'DB연동', '반응형'], liveTag:'live', type:'E-Commerce', thumbSrc:'images/site_05.jpg', url:'https://www.ssogtime1.com/gns69f07d9f47ddc' },
  { id:'w7', title:'제품 랜딩페이지', desc:'실시간 상담 신청 및 고객 데이터(DB) 자동 적재 시스템을 구축한 남성 케어 브랜드 랜딩페이지', tags:['랜딩페이지', 'DB연동', '반응형'], liveTag:'live', type:'E-Commerce', thumbSrc:'images/site_06.jpg', url:'https://www.miracleforman.com/Main-Home' },
  { id:'w8', title:'브랜드 랜딩페이지', desc:'고객 데이터 수집 및 마케팅 효율 극대화를 위한 DB 연동형 e-커머스 랜딩페이지', tags:['랜딩페이지'], liveTag:'live', type:'E-Commerce', thumbSrc:'images/site_07.jpg', url:'https://www.waterpurifier-mall.com/67d7bded9bf9f' },
  { id:'w9', title:'모바일 웹 청첩장', desc:'참석 여부(RSVP) 조사 및 축의금 계좌 복사 등 실용적 기능을 담은 반응형 웹 청첩장', tags:['웹청첩장', '반응형', 'API연동', 'UX/UI'], liveTag:'live', type:'Personal Project', thumbSrc:'images/site_08.jpg', url:'https://oyoonsik.github.io/yunflix/oh/images/web/sub/wedding.jpg' },
];

function renderWebPortfolio() {
  const grid = document.getElementById('webGrid');
  const liveCount = WEBSITE_DATA.filter(w => w.liveTag === 'live').length;
  document.getElementById('web-count').textContent = String(liveCount).padStart(2, '0');
  grid.innerHTML = WEBSITE_DATA.map(w => {
    const tagHtml   = w.tags.map(t => `<span class="web-card-tag">${t}</span>`).join('');
    const liveBadge = w.liveTag === 'live'
      ? `<span class="web-card-tag live">● LIVE</span>`
      : `<span class="web-card-tag dev">▲ 준비중</span>`;
    const thumb = w.thumbSrc
      ? `<img src="${w.thumbSrc}" alt="${w.title}" onerror="this.src='https://via.placeholder.com/800x500/141414/333?text=O.D.D'">`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#333;font-size:13px;letter-spacing:2px;">COMING SOON</div>`;
    return `<a href="${w.url || '#'}" ${w.url ? 'target="_blank" rel="noopener"' : ''} class="web-card${!w.url ? ' coming-soon' : ''}">
      <div class="web-card-thumb">${thumb}<div class="web-card-overlay"><span class="web-card-link-icon">↗</span></div></div>
      <div class="web-card-info">
        <div class="web-card-tags">${liveBadge}${tagHtml}</div>
        <h3 class="web-card-title">${w.title}</h3>
        <p class="web-card-desc">${w.desc}</p>
        <div class="web-card-footer"><span class="web-card-type">${w.type}</span><span class="web-card-arrow">↗</span></div>
      </div></a>`;
  }).join('');
}

// =============================================
// TAB 3 : 템플릿
// =============================================
const TEMPLATE_DATA = [
  { cat:'hospital', thumbSrc:'img/1.jpg', tags:[{t:'병원·의원',cls:'tmpl-tag-industry'},{t:'무료',cls:'tmpl-tag-free'}], title:'원장 신뢰형<br>병원 랜딩', desc:'원장 소개·수상 이력·후기 섹션 중심. 신뢰를 쌓고 예약 전환으로 연결.', price:'무료', priceCls:'free', previewUrl:'template/hospital_01.html' },
  { cat:'hospital', thumbSrc:'img/2.jpg', tags:[{t:'병원·의원',cls:'tmpl-tag-industry'},{t:'프리미엄',cls:'tmpl-tag-pro'}], title:'비포·애프터<br>시술 특화 랜딩', desc:'전후 사진 갤러리 + 실시간 예약 폼 + 한정 프로모션 배너 포함.', price:'₩12,000~', priceCls:'paid', previewUrl:'template/hospital_02.html' },
  { cat:'diet', thumbSrc:'img/3.jpg', tags:[{t:'헬스·다이어트',cls:'tmpl-tag-industry'},{t:'무료',cls:'tmpl-tag-free'}], title:'체험단 모집<br>다이어트 랜딩', desc:'한정 체험단 배너 + 체중감량 후기 카드 + 긴박감 유도 카운트다운.', price:'무료', priceCls:'free', previewUrl:'template/diet_trial.html' },
  { cat:'diet', thumbSrc:'img/4.jpg', tags:[{t:'헬스·다이어트',cls:'tmpl-tag-industry'},{t:'프리미엄',cls:'tmpl-tag-pro'}], title:'PT 등록 전환<br>헬스장 랜딩', desc:'트레이너 소개·수강 후기·PT 패키지 비교 섹션 포함. 카카오 즉시연결.', price:'₩12,000~', priceCls:'paid', previewUrl:'template/pt_gym.html' },
  { cat:'academy', thumbSrc:'img/5.jpg', tags:[{t:'학원·교육',cls:'tmpl-tag-industry'},{t:'무료',cls:'tmpl-tag-free'}], title:'합격률 강조<br>입시학원 랜딩', desc:'성적향상 그래프 + 합격 후기 + 강사 프로필 섹션. 무료 상담 신청 폼.', price:'무료', priceCls:'free', previewUrl:'template/academy_language.html' },
  { cat:'academy', thumbSrc:'img/6.jpg', tags:[{t:'학원·교육',cls:'tmpl-tag-industry'},{t:'프리미엄',cls:'tmpl-tag-pro'}], title:'커리큘럼 중심<br>어학원 랜딩', desc:'단계별 커리큘럼 타임라인 + 레벨 테스트 CTA + 원비 비교표 포함.', price:'₩12,000~', priceCls:'paid', previewUrl:'template/academy_pass.html' },
  { cat:'estate', thumbSrc:'img/7.jpg', tags:[{t:'부동산',cls:'tmpl-tag-industry'},{t:'무료',cls:'tmpl-tag-free'}], title:'매물 신뢰형<br>부동산 상담 랜딩', desc:'매물 카드 섹션 + 공인중개사 소개 + 즉시 전화·카카오 플로팅 버튼.', price:'무료', priceCls:'free', previewUrl:'template/estate_trust.html' },
  { cat:'beauty', thumbSrc:'img/8.jpg', tags:[{t:'피부·뷰티',cls:'tmpl-tag-industry'},{t:'무료',cls:'tmpl-tag-free'}], title:'시술 전환형<br>피부샵 랜딩', desc:'시술 메뉴 카드 + 피부 고민별 필터 + 당일 예약 강조 CTA 섹션.', price:'무료', priceCls:'free', previewUrl:'template/beauty_skin.html' },
];

function renderTemplates(filter) {
  const grid = document.getElementById('tmplGrid');
  const data = filter === 'all' ? TEMPLATE_DATA : TEMPLATE_DATA.filter(t => t.cat === filter);
  grid.innerHTML = data.map(t => `
    <div class="tmpl-card">
      <div class="tmpl-thumb"><img src="${t.thumbSrc}" alt="${t.title}" onerror="this.src='https://via.placeholder.com/400x300/141414/333?text=O.D.D'"></div>
      <div class="tmpl-body">
        <div class="tmpl-tags">${t.tags.map(tg => `<span class="tmpl-tag ${tg.cls}">${tg.t}</span>`).join('')}</div>
        <h3 class="tmpl-title">${t.title}</h3>
        <p class="tmpl-desc">${t.desc}</p>
        <div class="tmpl-footer">
          <span class="tmpl-price ${t.priceCls}">${t.price}</span>
          <a href="${t.previewUrl}" target="_blank" class="tmpl-btn">미리보기 →</a>
        </div>
      </div>
    </div>`).join('');
}

function filterTemplate(cat, btn) {
  document.querySelectorAll('.tmpl-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTemplates(cat);
}

// =============================================
// 초기화
// =============================================
window.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('portfolioGrid');

  try {
    const data = await fetchNotionPortfolio();
    NOTION_DATA = (data.results || []).map(parseNotionItem);
    renderDetail('all');
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:#666;">데이터를 불러오지 못했습니다.<br><small style="font-size:11px;">${err.message}</small></div>`;
  }

  const tab = new URLSearchParams(location.search).get('tab');
  if (tab === 'website') switchTab('website', document.querySelectorAll('.main-tab')[1]);
  else if (tab === 'template') switchTab('template', document.querySelectorAll('.main-tab')[2]);
});
