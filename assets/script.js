const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const letters = '01 Linux VMware Server Cloud Cyber DevOps SQL Bash PowerShell';
const chars = letters.split('');
const fontSize = 16;
let columns = Math.floor(canvas.width / fontSize);
let drops = Array(columns).fill(1);

function drawMatrix() {
  ctx.fillStyle = 'rgba(5, 8, 22, 0.08)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#00f7ff';
  ctx.font = `${fontSize}px monospace`;

  columns = Math.floor(canvas.width / fontSize);
  if (drops.length !== columns) {
    drops = Array(columns).fill(1);
  }

  for (let i = 0; i < drops.length; i++) {
    const text = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

setInterval(drawMatrix, 45);

const reveals = document.querySelectorAll('.reveal');

function revealOnScroll() {
  for (const element of reveals) {
    const windowHeight = window.innerHeight;
    const elementTop = element.getBoundingClientRect().top;
    const revealPoint = 120;

    if (elementTop < windowHeight - revealPoint) {
      element.classList.add('active');
    }
  }
}

window.addEventListener('scroll', revealOnScroll);
revealOnScroll();
