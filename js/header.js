document.addEventListener("DOMContentLoaded", function () {

  // 1. 헤더 + 공통 상담 모달 마크업 주입
  const headerHTML = `
    <header class="global-header">
      <nav class="nav-container">
        <a href="index.html" class="nav-logo">STUDIO <span>O.D.D</span></a>
        <ul class="nav-links">
          <li><a href="index.html" id="nav-home">HOME</a></li>
          <li><a href="website_showcase.html" id="nav-website">서비스</a></li>
          <li><a href="portfolio_showcase.html" id="nav-portfolio">포트폴리오</a></li>
          <li><a href="template_showcase.html" id="nav-template">템플릿</a></li>
        </ul>
        <a href="#" class="nav-cta" id="header-cta-btn">상담 문의하기</a>
      </nav>
    </header>

    <!-- 헤더 공통 상담 모달 -->
    <div class="hd-modal-overlay" id="hdConsultModal">
      <div class="hd-modal-box" onclick="event.stopPropagation()">
        <button class="hd-modal-close" id="hdModalClose">✕</button>
        <div class="hd-modal-title">CONSULTATION</div>
        <div class="hd-modal-subtitle">실시간 맞춤 견적 및 상담 신청</div>
        <form id="hdConsultForm">
          <div class="hd-form-group">
            <label class="hd-form-label">이름 / 회사명</label>
            <input type="text" id="hd-c-name" class="hd-form-input" placeholder="이름을 입력해 주세요" required>
          </div>
          <div class="hd-form-group">
            <label class="hd-form-label">연락처</label>
            <input type="tel" id="hd-c-phone" class="hd-form-input" placeholder="010-0000-0000" required>
          </div>
          <div class="hd-form-group">
            <label class="hd-form-label">이메일</label>
            <input type="email" id="hd-c-email" class="hd-form-input" placeholder="example@email.com">
          </div>
          <div class="hd-form-group">
            <label class="hd-form-label">문의 유형</label>
            <select id="hd-c-type" class="hd-form-select" required>
              <option value="" disabled selected>유형을 선택해 주세요</option>
              <option value="detail">상세페이지 제작</option>
              <option value="landing">랜딩페이지 제작</option>
              <option value="brand">브랜드 홈페이지</option>
              <option value="shop">쇼핑몰 · 예약 사이트</option>
              <option value="template">템플릿 문의</option>
              <option value="etc">기타</option>
            </select>
          </div>
          <button type="submit" class="hd-btn-submit" id="hdSubmitBtn">상담 신청하기 →</button>
        </form>
      </div>
    </div>
  `;

  // 2. <body> 최상단에 주입
  document.body.prepend(document.createRange().createContextualFragment(headerHTML));

  // 3. 모달 스타일 동적 주입 (header.css에 추가하셔도 됩니다)
  const style = document.createElement('style');
  style.textContent = `
    .hd-modal-overlay {
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(8px);
      display: none; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.3s ease;
    }
    .hd-modal-overlay.open { display: flex; opacity: 1; }
    .hd-modal-box {
      width: 100%; max-width: 480px;
      background: #141414; border: 1px solid #222; border-radius: 4px;
      padding: 44px; position: relative;
      transform: translateY(20px); transition: transform 0.3s ease;
      margin: 16px;
    }
    .hd-modal-overlay.open .hd-modal-box { transform: translateY(0); }
    .hd-modal-close {
      position: absolute; top: 24px; right: 24px;
      font-size: 20px; color: #a0a0a0; cursor: pointer;
      background: none; border: none; transition: color 0.2s;
    }
    .hd-modal-close:hover { color: #f5f5f0; }
    .hd-modal-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 34px; letter-spacing: 1px; color: #f5f5f0; margin-bottom: 6px;
    }
    .hd-modal-subtitle { font-size: 14px; color: #a0a0a0; margin-bottom: 28px; font-weight: 300; }
    .hd-form-group { margin-bottom: 18px; display: flex; flex-direction: column; gap: 8px; }
    .hd-form-label { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #f5f5f0; text-transform: uppercase; }
    .hd-form-input, .hd-form-select {
      width: 100%; background: #0a0a0a; border: 1px solid #222;
      padding: 13px 16px; color: #f5f5f0;
      font-family: 'Noto Sans KR', sans-serif; font-size: 14px;
      outline: none; border-radius: 2px; transition: border-color 0.2s;
    }
    .hd-form-input:focus, .hd-form-select:focus { border-color: #c8ff00; }
    .hd-form-select { appearance: none; }
    .hd-btn-submit {
      width: 100%; padding: 16px; background: #c8ff00; color: #0a0a0a;
      font-family: 'Noto Sans KR', sans-serif; font-size: 14px; font-weight: 700;
      border: none; border-radius: 2px; margin-top: 8px;
      cursor: pointer; transition: opacity 0.2s;
    }
    .hd-btn-submit:hover { opacity: 0.88; }
  `;
  document.head.appendChild(style);

  // 4. URL 판단 후 현재 메뉴 활성화 (수정 완료)
  const currentPath = window.location.pathname;

  // 모든 active 클래스 초기화 함수 (혹시 모를 중복 방지)
  const removeActive = () => {
    document.getElementById("nav-home")?.classList.remove("active");
    document.getElementById("nav-website")?.classList.remove("active");
    document.getElementById("nav-portfolio")?.classList.remove("active");
    document.getElementById("nav-template")?.classList.remove("active");
  };

  removeActive();

  if (currentPath.includes("website_showcase.html")) {
    document.getElementById("nav-website")?.classList.add("active");
  } else if (currentPath.includes("portfolio_showcase.html")) {
    document.getElementById("nav-portfolio")?.classList.add("active");
  } else if (currentPath.includes("template_showcase.html")) {
    document.getElementById("nav-template")?.classList.add("active");
  } else if (currentPath === "/" || currentPath.includes("index.html") || currentPath.endsWith("/")) {
    // 메인 홈 (경로가 완전히 비어있거나 index.html인 경우)
    document.getElementById("nav-home")?.classList.add("active");
  }

  // 5. 헤더 모달 열기/닫기
  const overlay  = document.getElementById('hdConsultModal');
  const closeBtn = document.getElementById('hdModalClose');
  const ctaBtn   = document.getElementById('header-cta-btn');

  function openHdModal(e) {
    if (e) e.preventDefault();
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }
  function closeHdModal() {
    overlay.classList.remove('open');
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
    document.body.style.overflow = '';
  }

   // ↓ 이 두 줄 추가
  window.openHdModal = openHdModal;
  window.closeHdModal = closeHdModal;

  ctaBtn.addEventListener('click', openHdModal);
  closeBtn.addEventListener('click', closeHdModal);
  overlay.addEventListener('click', closeHdModal);

  // 6. Supabase 연동 폼 제출
  document.getElementById('hdConsultForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('hdSubmitBtn');
    btn.textContent = '전송 중...';
    btn.disabled = true;

    try {
      const { createClient } = supabase;
      const db = createClient(
        'https://zqiophoueasyjvwjapai.supabase.co',
        'sb_publishable_NVHZWgrprdaKCgZ4mqmEEg_vt43h2Hz'
      );
      const { error } = await db.from('consultations').insert({
        name:     document.getElementById('hd-c-name').value.trim(),
        phone:    document.getElementById('hd-c-phone').value.trim(),
        email:    document.getElementById('hd-c-email').value.trim(),
        industry: document.getElementById('hd-c-type').value,
        status:   'wait',
        memo:     '[헤더 상담 문의]'
      });
      if (error) throw error;
      btn.textContent = '신청 완료! 24시간 내 연락드립니다 ✓';
      btn.style.background = '#1a1a1a';
      btn.style.color = '#c8ff00';
      document.getElementById('hdConsultForm').reset();
      setTimeout(closeHdModal, 2200);
    } catch (err) {
      btn.textContent = '전송 실패. 다시 시도해 주세요.';
      btn.style.background = '#ff4d00';
      btn.style.color = '#fff';
      btn.disabled = false;
      setTimeout(() => {
        btn.textContent = '상담 신청하기 →';
        btn.style.background = '';
        btn.style.color = '';
      }, 2500);
    }
  });
});