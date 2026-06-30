// =============================================
// 🔧 Supabase 설정
// =============================================
const P_SUPABASE_URL = 'https://zqiophoueasyjvwjapai.supabase.co';
const P_SUPABASE_KEY = 'sb_publishable_NVHZWgrprdaKCgZ4mqmEEg_vt43h2Hz';

// =============================================
// Supabase REST API 호출
// =============================================
async function fetchSupabasePortfolio() {
  const res = await fetch(
    `${P_SUPABASE_URL}/rest/v1/portfolio?visible=eq.true&order=created_at.desc`,
    {
      headers: {
        'apikey': P_SUPABASE_KEY,
        'Authorization': `Bearer ${P_SUPABASE_KEY}`,
      }
    }
  );
  if (!res.ok) throw new Error('Supabase fetch error ' + res.status);
  return await res.json();
}

function parseSupabaseItem(row) {
  return {
    id:            row.id,
    title:         row.title || '제목 없음',
    category:      row.category || 'etc',
    categoryLabel: row.category_label || '기타',
    imgSrc:        row.thumbnail_url || '',
    longImgSrc:    row.image_url || '',
    desc:          row.desc || '',
    features:      row.features
                     ? row.features.split(',').map(s => s.trim()).filter(Boolean)
                     : [],
    designer:      row.worker || '',
  };
}

// =============================================
// 상태
// =============================================
let PORTFOLIO_DATA = [];
let currentFilter  = 'all';

// =============================================
// TAB 1 : 상세페이지
// =============================================
function renderDetail(filter = 'all') {
  currentFilter = filter;
  const grid = document.getElementById('portfolioGrid');
  const data = filter === 'all'
    ? PORTFOLIO_DATA
    : PORTFOLIO_DATA.filter(i => i.category === filter);

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
    ? PORTFOLIO_DATA
    : PORTFOLIO_DATA.filter(i => i.category === filter);
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
// TAB 2 : 홈페이지 제작 (Supabase 연동)
// =============================================
let WEBSITE_DATA = [];
let currentWebFilter = 'all';

async function fetchSupabaseWebsites() {
  const res = await fetch(
    `${P_SUPABASE_URL}/rest/v1/websites?visible=eq.true&order=created_at.desc`,
    {
      headers: {
        'apikey': P_SUPABASE_KEY,
        'Authorization': `Bearer ${P_SUPABASE_KEY}`,
      }
    }
  );
  if (!res.ok) throw new Error('Supabase fetch error ' + res.status);
  return await res.json();
}

function parseWebsiteItem(row) {
  return {
    id:          row.id,
    title:       row.title || '제목 없음',
    desc:        row.desc || '',
    tags:        row.tags ? row.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
    liveTag:     row.live_tag || 'live',
    type:        row.type || '',
    thumbSrc:    row.thumbnail_url || '',
    url:         row.url || '',
    galleryUrls: row.gallery_urls ? row.gallery_urls.split(',').map(s => s.trim()).filter(Boolean) : [],
  };
}

function filterWeb(type, btn) {
  currentWebFilter = type;
  document.querySelectorAll('#tab-website .web-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderWebCards();
}

async function renderWebPortfolio() {
  const grid = document.getElementById('webGrid');
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:#666;">불러오는 중...</div>`;

  try {
    const rows = await fetchSupabaseWebsites();
    WEBSITE_DATA = rows.map(parseWebsiteItem);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:#666;">데이터를 불러오지 못했습니다.</div>`;
    return;
  }

  const liveCount = WEBSITE_DATA.filter(w => w.liveTag === 'live').length;
  document.getElementById('web-count').textContent = String(liveCount).padStart(2, '0');

  renderWebCards();
}

function renderWebCards() {
  const grid = document.getElementById('webGrid');
  const data = currentWebFilter === 'all'
    ? WEBSITE_DATA
    : currentWebFilter === 'uxui'
      ? WEBSITE_DATA.filter(w => w.type === 'UX/UI Design')
      : WEBSITE_DATA.filter(w => w.type !== 'UX/UI Design');

  if (!data.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:#666;">준비 중인 포트폴리오입니다.</div>`;
    return;
  }

  grid.innerHTML = data.map((w, idx) => {
    const tagHtml   = w.tags.map(t => `<span class="web-card-tag">${t}</span>`).join('');
    const isUxui    = w.type === 'UX/UI Design';
    const liveBadge = isUxui
      ? `<span class="web-card-tag uxui">✎ UX/UI 디자인</span>`
      : (w.liveTag === 'live'
          ? `<span class="web-card-tag live">● LIVE</span>`
          : `<span class="web-card-tag dev">▲ 준비중</span>`);
    const thumb = w.thumbSrc
      ? `<img src="${w.thumbSrc}" alt="${w.title}" onerror="this.src='https://via.placeholder.com/800x500/141414/333?text=O.D.D'">`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#333;font-size:13px;letter-spacing:2px;">COMING SOON</div>`;

    const innerHtml = `
      <div class="web-card-thumb">${thumb}<div class="web-card-overlay"><span class="web-card-link-icon">↗</span></div></div>
      <div class="web-card-info">
        <div class="web-card-tags">${liveBadge}${tagHtml}</div>
        <h3 class="web-card-title">${w.title}</h3>
        <p class="web-card-desc">${w.desc}</p>
        <div class="web-card-footer"><span class="web-card-type">${w.type}</span><span class="web-card-arrow">↗</span></div>
      </div>`;

    if (isUxui) {
      return `<div class="web-card" style="cursor:pointer" onclick="openGalleryModal(${idx}, '${currentWebFilter}')">${innerHtml}</div>`;
    }
    const hasLink = !!w.url;
    return `<a href="${w.url || '#'}" ${hasLink ? 'target="_blank" rel="noopener"' : ''} class="web-card${!hasLink ? ' coming-soon' : ''}">${innerHtml}</a>`;
  }).join('');
}

// =============================================
// UX/UI 갤러리 모달
// =============================================
let galleryModalImages = [];
let galleryModalIdx = 0;

function openGalleryModal(idx, filter) {
  const data = filter === 'all'
    ? WEBSITE_DATA
    : filter === 'uxui'
      ? WEBSITE_DATA.filter(w => w.type === 'UX/UI Design')
      : WEBSITE_DATA.filter(w => w.type !== 'UX/UI Design');
  const item = data[idx];
  if (!item) return;

  galleryModalImages = item.galleryUrls.length ? item.galleryUrls : [item.thumbSrc];
  galleryModalIdx = 0;

  let modal = document.getElementById('galleryModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'galleryModal';
    modal.className = 'gallery-modal';
    modal.innerHTML = `
      <div class="gallery-modal-inner">
        <button class="gallery-modal-close" onclick="closeGalleryModal()">✕</button>
        <button class="gallery-modal-nav prev" onclick="galleryNav(-1)">‹</button>
        <img class="gallery-modal-img" id="gallery-modal-img">
        <button class="gallery-modal-nav next" onclick="galleryNav(1)">›</button>
        <div class="gallery-modal-meta">
          <h3 id="gallery-modal-title"></h3>
          <div class="gallery-modal-dots" id="gallery-modal-dots"></div>
        </div>
      </div>`;
    modal.addEventListener('click', e => { if (e.target === modal) closeGalleryModal(); });
    document.body.appendChild(modal);
  }

  document.getElementById('gallery-modal-title').textContent = item.title;
  renderGalleryModalImage();
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderGalleryModalImage() {
  document.getElementById('gallery-modal-img').src = galleryModalImages[galleryModalIdx];
  document.getElementById('gallery-modal-dots').innerHTML = galleryModalImages.map((_, i) =>
    `<span class="gallery-dot${i === galleryModalIdx ? ' active' : ''}" onclick="goToGalleryImg(${i})"></span>`
  ).join('');
}

function goToGalleryImg(i) { galleryModalIdx = i; renderGalleryModalImage(); }

function galleryNav(dir) {
  galleryModalIdx = (galleryModalIdx + dir + galleryModalImages.length) % galleryModalImages.length;
  renderGalleryModalImage();
}

function closeGalleryModal() {
  const modal = document.getElementById('galleryModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
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
    const rows = await fetchSupabasePortfolio();
    PORTFOLIO_DATA = rows.map(parseSupabaseItem);
    renderDetail('all');
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:#666;">데이터를 불러오지 못했습니다.<br><small style="font-size:11px;">${err.message}</small></div>`;
  }

  const tab = new URLSearchParams(location.search).get('tab');
  if (tab === 'website') switchTab('website', document.querySelectorAll('.main-tab')[1]);
  else if (tab === 'template') switchTab('template', document.querySelectorAll('.main-tab')[2]);
});