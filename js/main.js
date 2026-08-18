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

// 수정 후 완전히 교체할 submitConsultation 함수
async function submitConsultation(e) {
  e.preventDefault();

  // 버튼 비활성화 (더블 클릭 방지)
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = '신청 중...';
  }

  // 폼 데이터 가져오기
  const name = document.getElementById('c-name').value;
  const phone = document.getElementById('c-phone').value;
  const email = document.getElementById('c-email').value;
  const industry = document.getElementById('c-industry').value;

  try {
    // Supabase DB(consultations 테이블)에 데이터 삽입
    const { error } = await db.from(TABLE).insert([
      { 
        name: name, 
        phone: phone, 
        email: email, 
        industry: industry, 
        status: 'wait', // 기본 상태는 대기 중
        memo: '' 
      }
    ]);

    if (error) {
      throw error;
    }

    alert('✅ 상담 신청이 정상적으로 완료되었습니다!');
    closeModal();
    
    // 폼 초기화
    document.getElementById('consultationForm').reset();

  } catch (err) {
    console.error('상담 신청 오류:', err);
    alert('❌ 신청 중 오류가 발생했습니다. 다시 시도해 주세요: ' + err.message);
  } finally {
    // 버튼 상태 복구
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = '상담 신청하기 →';
    }
  }
}
// ==================== 기존 기능들 ====================

function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  const heroBgText = document.querySelector('.hero-bg-text');
  if (!cursor || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  let px = 0, py = 0; // parallax smoothing
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animate() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    cursor.style.transform = `translate(${mx-4}px, ${my-4}px)`;
    ring.style.transform = `translate(${rx-17}px, ${ry-17}px)`;

    if (heroBgText) {
      const targetX = (mx / window.innerWidth - 0.5) * 24;
      const targetY = (my / window.innerHeight - 0.5) * 24;
      px += (targetX - px) * 0.05;
      py += (targetY - py) * 0.05;
      heroBgText.style.transform = `translateY(-50%) translate(${px}px, ${py}px)`;
    }

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

function initStoryScroll() {
  const section = document.getElementById('brandStory');
  if (!section) return;

  const items = section.querySelectorAll('.story-reveal');
  if (!items.length) return;

  // Story-like sequential thresholds (0~6)
  // label → quote → para1 → para2 → para3 → sign → stats
  const thresholds = [0.05, 0.12, 0.24, 0.36, 0.48, 0.60, 0.72];

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    if (total <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.min(1, Math.max(0, scrolled / total));

    items.forEach((el, i) => {
      const t = thresholds[i] != null ? thresholds[i] : (i + 1) * 0.12;
      if (progress >= t) {
        el.classList.add('is-visible');
      } else {
        el.classList.remove('is-visible');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}




/* =========================================================
   HERO SCROLL SPLIT TEXT EFFECT (smooth rAF + lerp)
   Scene 0: ONE | DESIGN  → horizontal → 한 번의 디자인
   Scene 1: TWO | CHANGES → vertical   → 두 번의 변화
   Scene 2: DESIGN | FOR ALL → horizontal → 모두를 위한 디자인은 세상을 바꿉니다
   ========================================================= */
function initHeroScroll() {
  const section = document.querySelector('.hero-scroll-effect');
  if (!section) return;

  const scenes = Array.from(section.querySelectorAll('.scroll-scene'));
  const progressBar = section.querySelector('.scroll-progress-bar');
  const progressWrap = section.querySelector('.scroll-progress');
  const indicator = section.querySelector('.scroll-indicator');
  if (!scenes.length) return;

  const sceneCount = scenes.length;

  // DOM 한 번만 캐싱
  const sceneData = scenes.map((scene) => ({
    el: scene,
    splitEl: scene.querySelector('.split-text'),
    left: scene.querySelector('.left'),
    right: scene.querySelector('.right'),
    inner: scene.querySelector('.inner-text , .inner-text2'),
    isVertical: !!scene.querySelector('.split-vertical'),
    staticSize: 0, // 화면 밖으로 밀려나지 않도록 벌어짐 폭/높이를 제한하는 기준값
  }));

  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  // 각 씬의 "안 벌어진" 원본 크기를 측정 (transform은 레이아웃 크기에 영향 없음)
  function measureScenes() {
    sceneData.forEach((s) => {
      if (!s.splitEl) return;
      const rect = s.splitEl.getBoundingClientRect();
      s.staticSize = s.isVertical ? rect.height : rect.width;
    });
  }

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }

  let targetProgress = 0;
  let currentProgress = 0;
  let ticking = false;
  let lastInView = true;

  // 0.08~0.18 권장. 낮을수록 더 부드럽고, 높을수록 스크롤에 더 즉각 반응
  const LERP = 0.12;

  function measureProgress() {
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-rect.top / total, 0, 1);
  }

  function apply(progress) {
    const rect = section.getBoundingClientRect();
    const inView = rect.bottom > 0 && rect.top < window.innerHeight;

    if (progressBar) {
      progressBar.style.width = (progress * 100).toFixed(3) + '%';
    }
    if (progressWrap && inView !== lastInView) {
      progressWrap.style.opacity = inView ? '1' : '0';
      lastInView = inView;
    }
    if (indicator) {
      const hide = progress > 0.06 || !inView;
      if (hide !== indicator.classList.contains('is-hidden')) {
        indicator.classList.toggle('is-hidden', hide);
      }
    }

    const slice = 1 / sceneCount;

    for (let i = 0; i < sceneCount; i++) {
      const s = sceneData[i];
      const start = i * slice;
      let local = (progress - start) / slice;
      local = clamp(local, 0, 1);

      // 씬 크로스페이드
      let opacity = 0;
      if (local <= 0) {
        opacity = 0;
      } else if (local < 0.15) {
        opacity = easeOutQuad(local / 0.15);
      } else if (local > 0.85) {
        opacity = easeOutQuad((1 - local) / 0.15);
      } else {
        opacity = 1;
      }
      if (i === 0 && progress < 0.04) opacity = 1;
      if (i === sceneCount - 1 && progress > 0.96) opacity = 1;

      s.el.style.opacity = opacity < 0.01 ? '0' : opacity.toFixed(4);
      s.el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';

      // 스플릿: 잠깐 유지 → 부드럽게 벌어짐 → 유지
      let splitT = 0;
      if (local < 0.12) {
        splitT = 0;
      } else if (local < 0.62) {
        splitT = easeInOutCubic((local - 0.12) / 0.5);
      } else {
        splitT = 1;
      }

      const vw = Math.min(window.innerWidth, 1400);
      const baseH = vw * 0.12;
      const baseV = Math.min(window.innerHeight * 0.12, 100);
      let dist = s.isVertical
        ? baseV + splitT * baseV * 0.6
        : baseH + splitT * baseH * 0.7;

      // 문구가 길어(scene 2 등) 화면 밖으로 잘려나가지 않도록,
      // 뷰포트 안에 들어올 수 있는 최대 벌어짐 폭/높이로 제한
      if (s.staticSize) {
        const viewportSize = s.isVertical ? window.innerHeight : window.innerWidth;
        const margin = 20; // 가장자리 여백
        const maxDist = Math.max(0, (viewportSize - s.staticSize) / 2 - margin);
        dist = Math.min(dist, maxDist);
      }

      if (s.left && s.right) {
        if (s.isVertical) {
          const y = dist * splitT;
          s.left.style.transform = `translate3d(0, ${(-y).toFixed(2)}px, 0)`;
          s.right.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        } else {
          const x = dist * splitT;
          s.left.style.transform = `translate3d(${(-x).toFixed(2)}px, 0, 0)`;
          s.right.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
        }
      }

      if (s.inner) {
        let io = 0;
        if (splitT > 0.2) {
          io = clamp((splitT - 0.2) / 0.55, 0, 1);
          io = easeOutQuad(io);
        }
        const scale = 0.92 + io * 0.08;
        s.inner.style.opacity = io.toFixed(4);
        s.inner.style.transform =
          `translate3d(-50%, -50%, 0) scale(${scale.toFixed(4)})`;
      }
    }
  }

  function tick() {
    targetProgress = measureProgress();
    currentProgress += (targetProgress - currentProgress) * LERP;

    if (Math.abs(targetProgress - currentProgress) < 0.0004) {
      currentProgress = targetProgress;
    }

    apply(currentProgress);

    const catchingUp = Math.abs(targetProgress - currentProgress) > 0.0004;
    const rect = section.getBoundingClientRect();
    const near = rect.bottom > -200 && rect.top < window.innerHeight + 200;

    if (catchingUp || near) {
      requestAnimationFrame(tick);
    } else {
      ticking = false;
    }
  }

  function requestTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(tick);
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', () => {
    measureScenes();
    currentProgress = measureProgress();
    targetProgress = currentProgress;
    apply(currentProgress);
    requestTick();
  }, { passive: true });

  measureScenes();
  currentProgress = measureProgress();
  targetProgress = currentProgress;
  apply(currentProgress);
  requestTick();

  // 폰트(Bebas Neue) 로딩 후 실제 글자 폭으로 다시 측정
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      measureScenes();
      apply(currentProgress);
    });
  }
}

function initStatsBar() {
  const section = document.getElementById('statsBar');
  if (!section) return;

  const items = section.querySelectorAll('.stat-item');
  const counts = section.querySelectorAll('.stat-count');
  if (!items.length) return;

  let played = false;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCount(el, duration) {
    const target = parseFloat(el.getAttribute('data-target')) || 0;
    const pad = parseInt(el.getAttribute('data-pad'), 10) || 0;
    const start = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const value = Math.round(easeOutExpo(t) * target);
      el.textContent = pad > 0
        ? String(value).padStart(pad, '0')
        : String(value);

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = pad > 0
          ? String(target).padStart(pad, '0')
          : String(target);
      }
    }
    requestAnimationFrame(frame);
  }

  function play() {
    if (played) return;
    played = true;

    items.forEach((item) => item.classList.add('is-in'));

    counts.forEach((el, i) => {
      setTimeout(() => animateCount(el, 1400), 150 + i * 120);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          play();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.35 }
  );

  observer.observe(section);
}

window.addEventListener('DOMContentLoaded', () => {
  initCursor();
  updateCursorHover();
  initScrollReveal();
  initStoryScroll();
  initHeroScroll();
  bindCTAs();
  initStatsBar();

  document.addEventListener('submit', (e) => {
    if (e.target.id === 'consultationForm') submitConsultation(e);
  });
});

window.openModal = openModal;
window.closeModal = closeModal;

