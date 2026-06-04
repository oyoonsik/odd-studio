
window.openGlobalModal = openModal; // main.js의 openModal을 공유
/* ── 카드 데이터 ── */
const cards = [
  { id:0, cat:'hospital', title:'원장 신뢰형 병원 상담 랜딩', desc:'원장 소개·수상 이력·환자 후기 섹션이 핵심. 신뢰 기반 상담 예약 전환에 최적화된 구조입니다.', tag:'병원·의원', free:true, features:['원장 프로필 + 수상·인증 섹션','환자 후기 카드 슬라이더','카카오 채널 즉시연결 CTA','모바일 최적화 완료'] },
  { id:1, cat:'hospital', title:'비포·애프터 시술 특화 랜딩', desc:'전후 사진 갤러리 + 실시간 예약 폼 + 한정 프로모션 배너 포함.', tag:'병원·의원', free:false, price:'₩12,000', features:['비포·애프터 갤러리 섹션','실시간 예약 폼 연동','한정 프로모션 카운트다운','카카오·전화 플로팅 버튼'] },
  { id:2, cat:'diet',     title:'체험단 모집 다이어트 랜딩',  desc:'한정 체험단 배너 + 체중감량 후기 카드 + 긴박감 유도 카운트다운.', tag:'헬스·다이어트', free:true, features:['체험단 모집 배너','후기 카드 슬라이더','카운트다운 타이머','카카오 즉시연결'] },
  { id:3, cat:'diet',     title:'PT 등록 전환 헬스장 랜딩',   desc:'트레이너 소개·수강 후기·PT 패키지 비교 섹션 포함. 카카오 즉시연결.', tag:'헬스·다이어트', free:false, price:'₩12,000', features:['트레이너 프로필 카드','수강 후기 슬라이더','PT 패키지 비교표','카카오 즉시연결 CTA'] },
  { id:4, cat:'academy',  title:'합격률 강조 입시학원 랜딩',  desc:'성적향상 그래프 + 합격 후기 + 강사 프로필 섹션. 무료 상담 신청 폼.', tag:'학원·교육', free:true, features:['성적향상 그래프 섹션','합격 후기 카드','강사 프로필','무료 상담 신청 폼'] },
  { id:5, cat:'academy',  title:'커리큘럼 중심 어학원 랜딩',  desc:'단계별 커리큘럼 타임라인 + 레벨 테스트 CTA + 원비 비교표 포함.', tag:'학원·교육', free:false, price:'₩12,000', features:['커리큘럼 타임라인','레벨 테스트 CTA','원비 비교표','카카오 즉시연결'] },
  { id:6, cat:'estate',   title:'매물 신뢰형 부동산 상담 랜딩', desc:'매물 카드 섹션 + 공인중개사 소개 + 즉시 전화·카카오 플로팅 버튼.', tag:'부동산', free:true, features:['매물 카드 섹션','공인중개사 소개','즉시 전화·카카오 버튼','모바일 최적화'] },
  { id:7, cat:'beauty',   title:'시술 전환형 피부샵 랜딩',    desc:'시술 메뉴 카드 + 피부 고민별 필터 + 당일 예약 강조 CTA 섹션.', tag:'피부·뷰티', free:true, features:['시술 메뉴 카드','피부 고민 필터','당일 예약 CTA','카카오 즉시연결'] },
];

let currentCard = null;

/* ── Supabase 설정 및 초기화 ── */
const SUPABASE_URL = 'https://zqiophoueasyjvwjapai.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NVHZWgrprdaKCgZ4mqmEEg_vt43h2Hz';
const TABLE = 'consultations';

// HTML에서 글로벌 supabase 스크립트가 정상적으로 로드되었는지 확인 후 초기화
const _db = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

/* ══════════════════════════════════════════════
   DB 연동: Supabase 실데이터 저장 함수
══════════════════════════════════════════════ */
async function saveLead(payload) {
  console.log('[리드 수집]', payload);

  if (!_db) {
    console.error('Supabase 라이브러리가 로드되지 않았습니다. CDN 링크를 확인하세요.');
    throw new Error('Supabase 미설치');
  }

  const { data, error } = await _db.from(TABLE).insert({
    name: payload.name,
    phone: payload.phone,
    email: payload.email || null,
    industry: payload.template_category || payload.type || 'general',
    status: 'wait',
    memo: payload.template_title ? `[템플릿 신청] ${payload.template_title}` : `[일반 문의] 무료 상담`
  });

  if (error) {
    console.error('Supabase 저장 오류:', error);
    throw error;
  }

  return data;
}

/* ══════════════════════════════════════════════
   Nav / Banner 버튼 클릭 시 헤더 모달 연동
══════════════════════════════════════════════ */
function openGlobalHeaderModal(e) {
  if (e) e.preventDefault();
  
  // header.js에 선언된 공통 모달 관련 요소를 직접 제어합니다.
  const overlay = document.getElementById('hdConsultModal');
  if (overlay) {
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';
  } else {
    console.warn("헤더 상담 모달(hdConsultModal)을 찾을 수 없습니다. header.js가 먼저 로드되었는지 확인하세요.");
  }
}

/* ══════════════════════════════════════════════
   템플릿 다운로드 모달 (카드 클릭)
══════════════════════════════════════════════ */
function validateForm() {
  const name  = document.getElementById('f-name').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const email = document.getElementById('f-email').value.trim();

  ['f-name','f-phone','f-email'].forEach(id => document.getElementById(id).classList.remove('error'));

  if (!name)  { document.getElementById('f-name').classList.add('error');  showStatus('이름을 입력해 주세요.', 'error');  return null; }
  if (!phone || !/^[0-9\-+\s]{7,20}$/.test(phone)) { document.getElementById('f-phone').classList.add('error'); showStatus('올바른 연락처를 입력해 주세요.', 'error'); return null; }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById('f-email').classList.add('error'); showStatus('올바른 이메일 주소를 입력해 주세요.', 'error'); return null; }
  return { name, phone, email };
}

function showStatus(msg, type) {
  const el = document.getElementById('form-status');
  if (!el) return;
  el.textContent = msg;
  el.className = 'form-status ' + type;
  
  el.style.color = type === 'error' ? '#FF503C' : type === 'success' ? '#3DD68C' : '';
  el.style.display = msg ? 'block' : 'none';
}

async function handleDownload() {
  if (!currentCard) return;
  const data = validateForm();
  if (!data) return;

  const btn = document.getElementById('m-cta');
  btn.disabled = true;
  btn.classList.add('loading');
  showStatus('', '');

  try {
    await saveLead({
      name: data.name, 
      phone: data.phone, 
      email: data.email || null,
      template_title: currentCard.title, 
      template_category: currentCard.tag,
    });

    showStatus('✓ 신청 완료! 곧 연락드릴게요 😊', 'success');

    btn.innerHTML = '<span class="btn-text">✓ 완료</span>';
    btn.style.background = '#3DD68C';
    
    setTimeout(() => {
      document.getElementById('modal').classList.remove('open');
      btn.disabled = false;
      btn.classList.remove('loading');
      btn.innerHTML = '<span class="btn-text">무료 다운로드</span><div class="spinner"></div>';
      btn.style.background = '';
      ['f-name', 'f-phone', 'f-email'].forEach(id => { document.getElementById(id).value = ''; });
      showStatus('', '');
    }, 2000);

  } catch (err) {
    showStatus('오류가 발생했습니다. 다시 시도해 주세요.', 'error');
    btn.disabled = false;
    btn.classList.remove('loading');
  }
}

function openModal(id) {
  currentCard = cards[id];
  const c = currentCard;

  document.getElementById('m-tag').innerHTML =
    `<span class="tag tag-industry">${c.tag}</span>
     <span class="tag ${c.free ? 'tag-free' : 'tag-pro'}">${c.free ? '무료' : '프리미엄'}</span>`;
  document.getElementById('m-title').textContent = c.title;
  document.getElementById('m-desc').textContent  = c.desc;
  document.getElementById('m-features').innerHTML =
    c.features.map(f => `<li class="modal-feat"><span class="feat-check">✓</span>${f}</li>`).join('');

  const btn = document.getElementById('m-cta');
  btn.innerHTML = `<span class="btn-text">${c.free ? '무료 다운로드' : '구매하기'}</span><div class="spinner"></div>`;
  btn.style.background = ''; btn.disabled = false; btn.classList.remove('loading');

  ['f-name','f-phone','f-email'].forEach(id => { const el = document.getElementById(id); el.value = ''; el.classList.remove('error'); });
  const st = document.getElementById('form-status'); if (st) { st.className = 'form-status'; st.textContent = ''; st.style.display = 'none'; }

  document.getElementById('modal').classList.add('open');
}

function closeModal(e) {
  if (e.target === document.getElementById('modal'))
    document.getElementById('modal').classList.remove('open');
}

/* ── 초기 이벤트 바인딩 ── */
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. 네비게이션 CTA 및 배너 버튼 클릭 시 header.js의 모달을 열도록 바인딩
  const navCta = document.querySelector('.nav-cta');
  if (navCta) navCta.addEventListener('click', openGlobalHeaderModal);

  const bannerBtn = document.querySelector('.btn-banner');
  if (bannerBtn) bannerBtn.addEventListener('click', openGlobalHeaderModal);

  // 2. 템플릿 개별 카드 클릭 이벤트
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openModal(+card.dataset.id));
  });

  document.querySelectorAll('.card-dl-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const url = btn.dataset.preview;
      if (url) window.open(url, '_blank');
      else openModal(+btn.closest('.card').dataset.id);
    });
  });

  // 3. 필터링 탭 기능
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.card').forEach(c => {
        c.classList.toggle('hidden', f !== 'all' && c.dataset.cat !== f);
      });
    });
  });
});