// ── SUPABASE 설정 (관리자 소스와 동일한 DB 연동) ──
const SUPABASE_URL = 'https://zqiophoueasyjvwjapai.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NVHZWgrprdaKCgZ4mqmEEg_vt43h2Hz';
const TABLE = 'consultations';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── 모달 제어 함수 ──
function openModal(e) {
  if(e) e.preventDefault();
  const modal = document.getElementById('consultationModal');
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('open'), 10);
}

function closeModal() {
  const modal = document.getElementById('consultationModal');
  modal.classList.remove('open');
  setTimeout(() => modal.style.display = 'none', 300);
}

// ── SUPABASE 데이터 인서트 함수 ──
async function submitConsultation(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  const name = document.getElementById('c-name').value;
  const phone = document.getElementById('c-phone').value;
  const email = document.getElementById('c-email').value;
  const industry = document.getElementById('c-industry').value;
  
  submitBtn.disabled = true;
  submitBtn.textContent = '신청을 전송 중입니다...';
  
  // Supabase DB에 인서트 실행
  const { error } = await db.from(TABLE).insert({
    name: name,
    phone: phone,
    email: email,
    industry: industry,
    status: 'wait', // 기본 상태값 대기(wait) 지정
    memo: ''
  });
  
  if (error) {
    alert('신청 처리 중 오류가 발생했습니다: ' + error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = '상담 신청하기 →';
  } else {
    alert('성공적으로 상담 신청이 완료되었습니다. 확인 후 신속히 연락드리겠습니다!');
    document.getElementById('consultationForm').reset();
    closeModal();
    submitBtn.disabled = false;
    submitBtn.textContent = '상담 신청하기 →';
  }
}

// Custom cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx=0, my=0, rx=0, ry=0;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
(function loop(){
  rx += (mx-rx)*0.14; ry += (my-ry)*0.14;
  cursor.style.transform = `translate(${mx-4}px,${my-4}px)`;
  ring.style.transform   = `translate(${rx-17}px,${ry-17}px)`;
  requestAnimationFrame(loop);
})();

// 커스텀 커서 마우스 엔터 이벤트를 동적 바인딩 및 정적 추가 처리
function updateCursorHover() {
  document.querySelectorAll('a, button, select, input').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.style.width = '58px'; ring.style.height = '58px'; });
    el.addEventListener('mouseleave', () => { ring.style.width = '34px'; ring.style.height = '34px'; });
  });
}
updateCursorHover();

// Scroll reveal
const obs = new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{
    if(e.isIntersecting){
      setTimeout(()=>e.target.classList.add('visible'), i*55);
      obs.unobserve(e.target);
    }
  });
},{threshold:0.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));