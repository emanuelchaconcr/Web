const text = `> whoami
Emanuel Chacón - Especialista TI

> skills --list
Linux | Windows Server | VMware | Seguridad | Monitoreo

> status
Disponible para nuevos retos tecnológicos...`;

const typingElement = document.getElementById('typing');
let index = 0;

function typeText() {
  if (index < text.length) {
    typingElement.textContent += text.charAt(index);
    index++;
    setTimeout(typeText, 35);
  }
}

typeText();

const reveals = document.querySelectorAll('.reveal');

function revealOnScroll() {
  reveals.forEach((element) => {
    const windowHeight = window.innerHeight;
    const elementTop = element.getBoundingClientRect().top;

    if (elementTop < windowHeight - 100) {
      element.classList.add('active');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);
revealOnScroll();
