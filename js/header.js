// js/header.js
document.addEventListener("DOMContentLoaded", function () {
  // 1. 헤더 마크업 정의 (햄버거 + 드로어 포함)
  const headerHTML = `
    <header class="global-header">
      <nav class="nav-container">
        <a href="index.html" class="nav-logo">STUDIO <span>O.D.D</span></a>
        <ul class="nav-links">
          <li><a href="index.html" id="nav-home">HOME</a></li>
          <li><a href="website_showcase.html" id="nav-website">홈페이지 제작 &amp; 템플릿</a></li>
          <li><a href="portfolio_showcase.html" id="nav-portfolio">포트폴리오</a></li>
          <li><a href="designer_lineup.html" id="nav-designer">전문가 라인업</a></li>
        </ul>
        <a href="#" class="nav-cta header-trigger-btn">상담 문의하기</a>
        <button class="nav-hamburger" id="nav-hamburger" aria-label="메뉴 열기">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </header>

    <!-- 모바일 드로어 -->
    <div class="nav-drawer" id="nav-drawer">
      <ul>
        <li><a href="index.html" id="drawer-home">HOME</a></li>
        <li><a href="website_showcase.html" id="drawer-website">홈페이지 제작 &amp; 템플릿</a></li>
        <li><a href="portfolio_showcase.html" id="drawer-portfolio">포트폴리오</a></li>
        <li><a href="designer_lineup.html" id="drawer-designer">전문가 라인업</a></li>
      </ul>
      <a href="#" class="nav-drawer-cta header-trigger-btn">상담 문의하기</a>
      <div class="nav-drawer-bottom">STUDIO O.D.D © 2026</div>
    </div>
  `;

  // 2. <body> 최상단에 헤더 주입
  document.body.prepend(document.createRange().createContextualFragment(headerHTML));

  // 3. URL 판단 후 현재 메뉴 활성화
  const path = window.location.pathname;
  const page = path.split("/").pop() || "index.html";

  const pageMap = {
    "index.html": ["nav-home", "drawer-home"],
    "": ["nav-home", "drawer-home"],
    "portfolio_showcase.html": ["nav-portfolio", "drawer-portfolio"],
    "designer_lineup.html": ["nav-designer", "drawer-designer"],
    "website_showcase.html": ["nav-website", "drawer-website"],
  };

  const activeIds = pageMap[page] || [];
  activeIds.forEach(id => document.getElementById(id)?.classList.add("active"));

  // 4. 햄버거 토글
  const hamburger = document.getElementById("nav-hamburger");
  const drawer = document.getElementById("nav-drawer");

  function openDrawer() {
    hamburger.classList.add("open");
    drawer.classList.add("open");
    document.body.style.overflow = "hidden";
    hamburger.setAttribute("aria-label", "메뉴 닫기");
  }

  function closeDrawer() {
    hamburger.classList.remove("open");
    drawer.classList.remove("open");
    document.body.style.overflow = "";
    hamburger.setAttribute("aria-label", "메뉴 열기");
  }

  hamburger.addEventListener("click", function () {
    drawer.classList.contains("open") ? closeDrawer() : openDrawer();
  });

  // 드로어 바깥(배경) 터치 시 닫기
  drawer.addEventListener("click", function (e) {
    if (e.target === drawer) closeDrawer();
  });

  // 드로어 내 링크 클릭 시 자동으로 닫기
  drawer.querySelectorAll("a:not(.nav-drawer-cta)").forEach(link => {
    link.addEventListener("click", closeDrawer);
  });

  // 5. 헤더/드로어 CTA 버튼 → openModal 연결
  setTimeout(() => {
    document.querySelectorAll('.header-trigger-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        closeDrawer();
        if (typeof window.openModal === 'function') {
          window.openModal(e);
        } else {
          console.error('openModal 함수를 찾을 수 없습니다. main.js가 먼저 로드되었는지 확인하세요.');
        }
      });
    });
  }, 150);
});