document.addEventListener("DOMContentLoaded", function () {
  // 1. 헤더 마크업 및 전용 스타일 통합 정의
  const headerHTML = `

    <header class="global-header">
      <nav class="nav-container">
        <a href="index.html" class="nav-logo">STUDIO <span>O.D.D</span></a>
        <ul class="nav-links">
          <li><a href="index.html" id="nav-home">HOME</a></li>
          <li><a href="portfolio_showcase.html" id="nav-portfolio">상세페이지</a></li>
          <li><a href="website_showcase.html" id="nav-website">홈페이지 제작 & 템플릿</a></li>
        </ul>
        <a href="#" class="nav-cta">상담 문의하기</a>
      </nav>
    </header>
  `;

  // 2. <body> 최상단에 헤더 주입
  document.body.prepend(document.createRange().createContextualFragment(headerHTML));

  // 3. URL 판단 후 현재 메뉴 활성화(active)
  const path = window.location.pathname;
  const page = path.split("/").pop();

  if (page === "index.html" || page === "") {
    document.getElementById("nav-home")?.classList.add("active");
  } else if (page === "portfolio_showcase.html") {
    document.getElementById("nav-portfolio")?.classList.add("active");
  } else if (page === "template_showcase.html") {
    document.getElementById("nav-template")?.classList.add("active");
  } else if (page === "website_showcase.html") {
    document.getElementById("nav-website")?.classList.add("active");
  }
});
