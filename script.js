AOS.init({ duration: 900, once: true, offset: 90 });

const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
});

const counters = document.querySelectorAll('[data-count]');
const runCounter = (counter) => {
  const target = parseFloat(counter.dataset.count);
  const isDecimal = String(counter.dataset.count).includes('.');
  let current = 0;
  const increment = target / 90;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      counter.textContent = isDecimal ? target.toFixed(1) : Math.round(target);
      clearInterval(timer);
    } else {
      counter.textContent = isDecimal ? current.toFixed(1) : Math.round(current);
    }
  }, 18);
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.started) {
      entry.target.dataset.started = 'true';
      runCounter(entry.target);
    }
  });
}, { threshold: 0.6 });

counters.forEach(counter => observer.observe(counter));

if (window.particlesJS) {
  particlesJS('particles-js', {
    particles: {
      number: { value: 75, density: { enable: true, value_area: 900 } },
      color: { value: ['#45f6ff', '#27ffd4', '#9b54ff'] },
      shape: { type: 'circle' },
      opacity: { value: 0.35, random: true },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: '#45f6ff', opacity: 0.18, width: 1 },
      move: { enable: true, speed: 1.4, direction: 'none', random: true, straight: false, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
      modes: { grab: { distance: 180, line_linked: { opacity: 0.35 } }, push: { particles_nb: 3 } }
    },
    retina_detect: true
  });
}
