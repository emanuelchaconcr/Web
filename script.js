AOS.init({ duration: 850, once: true, offset: 80 });

const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('open')));

const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = 'inicio';
  sections.forEach(section => {
    if (scrollY >= section.offsetTop - 130) current = section.id;
  });
  navItems.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
});

const counters = document.querySelectorAll('[data-count]');
let counted = false;
function animateCounters(){
  if(counted) return;
  const stats = document.querySelector('.stats');
  if(!stats) return;
  const rect = stats.getBoundingClientRect();
  if(rect.top < window.innerHeight - 80){
    counted = true;
    counters.forEach(counter => {
      const target = parseFloat(counter.dataset.count);
      let current = 0;
      const duration = 1500;
      const start = performance.now();
      function update(now){
        const progress = Math.min((now - start) / duration, 1);
        current = target * progress;
        if(target % 1 !== 0){
          counter.textContent = current.toFixed(1);
        } else {
          counter.textContent = '+' + Math.floor(current);
        }
        if(target === 99.9) counter.textContent = current.toFixed(1);
        if(progress < 1) requestAnimationFrame(update);
        else counter.textContent = target % 1 !== 0 ? target.toFixed(1) : '+' + target;
      }
      requestAnimationFrame(update);
    });
  }
}
window.addEventListener('scroll', animateCounters);
animateCounters();

if (window.particlesJS) {
  particlesJS('particles-js', {
    particles: {
      number: { value: 65, density: { enable: true, value_area: 900 } },
      color: { value: '#45f6ff' },
      shape: { type: 'circle' },
      opacity: { value: 0.28, random: true },
      size: { value: 2.4, random: true },
      line_linked: { enable: true, distance: 145, color: '#45f6ff', opacity: 0.16, width: 1 },
      move: { enable: true, speed: 1.2, direction: 'none', random: false, straight: false, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
      modes: { grab: { distance: 150, line_linked: { opacity: 0.35 } }, push: { particles_nb: 3 } }
    },
    retina_detect: true
  });
}
