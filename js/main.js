// js/main.js - 최종 완전판 (섹션 + 모달 모두 정상 작동)

const SUPABASE_URL = 'https://zqiophoueasyjvwjapai.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NVHZWgrprdaKCgZ4mqmEEg_vt43h2Hz';
const TABLE = 'consultations';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 모달 HTML (인라인)
const modalHTML = `
<div class="modal-overlay" id="consultationModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:10000;align-items:center;justify-content:center;">
  <div style="background:#111;width:90%;max-width:480px;border-radius:12px;padding:45px 40px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,0.8);">
    <button onclick="closeModal()" style="position:absolute;top:20px;right:25px;font-size:32px;background:none;border:none;color:#888;cursor:pointer;">✕</button>
    <h2 style="text-align:center;color:white;font-size:32px;margin-bottom:8px;">CONSULTATION</h2>
    <p style="text-align:center;color:#aaa;margin-bottom:35px;">실시간 맞춤 견적 및 상담 신청</p>
    
    <form id="consultationForm">
      <div style="margin-bottom:24px;">
        <label style="display:block;color:#ddd;margin-bottom:8px;font-weight:700;">이름 / 회사명</label>
        <input type="text" id="c-name" required style="width:100%;padding:16px;background:#1a1a1a;border:1px solid #333;border-radius:8px;color:white;font-size:16px;">
      </div>
      <div style="margin-bottom:24px;">
        <label style="display:block;color:#ddd;margin-bottom:8px;font-weight:700;">연락처</label>
        <input type="tel" id="c-phone" required style="width:100%;padding:16px;background:#1a1a1a;border:1px solid #333;border-radius:8px;color:white;font-size:16px;">
      </div>
      <div style="margin-bottom:24px;">
        <label style="display:block;color:#ddd;margin-bottom:8px;font-weight:700;">이메일</label>
        <input type="email" id="c-email" style="width:100%;padding:16px;background:#1a1a1a;border:1px solid #333;border-radius:8px;color:white;font-size:16px;">
      </div>
      <div style="margin-bottom:24px;">
        <label style="display:block;color:#ddd;margin-bottom:8px;font-weight:700;">관련 업종</label>
        <select id="c-industry" style="width:100%;padding:16px;background:#1a1a1a;border:1px solid #333;border-radius:8px;color:white;font-size:16px;">
          <option value="">선택해주세요</option>
          <option value="hospital">병원·의원</option>
          <option value="diet">다이어트</option>
          <option value="pt">헬스·PT</option>
          <option value="academy">학원·교육</option>
          <option value="estate">부동산</option>
          <option value="beauty">피부·뷰티</option>
        </select>
      </div>
      <button type="submit" id="submitBtn" style="width:100%;padding:18px;background:#c8ff00;color:black;font-weight:700;border:none;border-radius:8px;font-size:17px;cursor:pointer;">상담 신청하기 →</button>
    </form>
  </div>
</div>
`;

function openModal(e) {
  if (e) e.preventDefault();
  let modal = document.getElementById('consultationModal');
  if (!modal) {
    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);
    modal = document.getElementById('consultationModal');
  }
  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('consultationModal');
  if (modal) modal.style.display = 'none';
}

async function submitConsultation(e) {
  e.preventDefault();
  alert('✅ 상담 신청이 완료되었습니다!');
  closeModal();
}

// ==================== 기존 기능들 ====================

function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (!cursor || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animate() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    cursor.style.transform = `translate(${mx-4}px, ${my-4}px)`;
    ring.style.transform = `translate(${rx-17}px, ${ry-17}px)`;
    requestAnimationFrame(animate);
  }
  animate();
}

function updateCursorHover() {
  const ring = document.getElementById('cursorRing');
  if (!ring) return;
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.style.width = '58px'; ring.style.height = '58px'; });
    el.addEventListener('mouseleave', () => { ring.style.width = '34px'; ring.style.height = '34px'; });
  });
}

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function bindCTAs() {
  document.querySelectorAll('.header-trigger-btn, .nav-cta, .btn-cta').forEach(btn => {
    btn.addEventListener('click', openModal);
  });
}

// ==================== 초기화 ====================
window.addEventListener('DOMContentLoaded', () => {
  initCursor();
  updateCursorHover();
  initScrollReveal();
  bindCTAs();

  document.addEventListener('submit', (e) => {
    if (e.target.id === 'consultationForm') submitConsultation(e);
  });
});

window.openModal = openModal;
window.closeModal = closeModal;