// js/header.js
document.addEventListener("DOMContentLoaded", function () {
  // 1. 헤더 마크업 정의
  const headerHTML = `
    <header class="global-header">
      <nav class="nav-container">
        <a href="index.html" class="nav-logo">STUDIO <span>O.D.D</span></a>
        <ul class="nav-links">
          <li><a href="index.html" id="nav-home">HOME</a></li>
          <li><a href="website_showcase.html" id="nav-website">홈페이지 제작 & 템플릿</a></li>
          <li><a href="portfolio_showcase.html" id="nav-portfolio">포트폴리오</a></li>
          <li><a href="designer_lineup.html" id="nav-designer">전문가 라인업</a></li>
        </ul>
        <a href="#" class="nav-cta header-trigger-btn">상담 문의하기</a>
      </nav>
    </header>
  `;

  // 2. <body> 최상단에 헤더 주입
  document.body.prepend(document.createRange().createContextualFragment(headerHTML));

  // 3. URL 판단 후 현재 메뉴 활성화
  const path = window.location.pathname;
  const page = path.split("/").pop() || "index.html";

  if (page === "index.html" || page === "") {
    document.getElementById("nav-home")?.classList.add("active");
  } else if (page === "portfolio_showcase.html") {
    document.getElementById("nav-portfolio")?.classList.add("active");
  } else if (page === "designer_lineup.html") {
    document.getElementById("nav-designer")?.classList.add("active");
  } else if (page === "website_showcase.html") {
    document.getElementById("nav-website")?.classList.add("active");
  }

  // 🔥 4. 헤더 CTA 버튼에 모달 연결 (main.js의 openModal과 연동)
  setTimeout(() => {
    const headerBtn = document.querySelector('.header-trigger-btn');
    if (headerBtn) {
      headerBtn.addEventListener('click', function (e) {
        e.preventDefault();
        
        // main.js에서 노출된 openModal 함수 호출
        if (typeof window.openModal === 'function') {
          window.openModal(e);
        } else {
          console.error('openModal 함수를 찾을 수 없습니다. main.js가 먼저 로드되었는지 확인하세요.');
        }
      });
    }
  }, 150); // 헤더 주입 후 약간의 딜레이
});