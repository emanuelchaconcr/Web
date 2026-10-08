const shareButton = document.getElementById("shareButton");
const toast = document.getElementById("toast");
const currentYear = document.getElementById("currentYear");

currentYear.textContent = new Date().getFullYear();

function showToast(message = "Enlace copiado") {
  toast.lastChild.textContent = ` ${message}`;
  toast.classList.add("show");

  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

shareButton.addEventListener("click", async () => {
  const shareData = {
    title: document.title,
    text: "Conoce mis enlaces oficiales.",
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    showToast();
  } catch (error) {
    if (error.name !== "AbortError") {
      showToast("No se pudo compartir");
    }
  }
});

if (window.particlesJS) {
  particlesJS("particles-js", {
    particles: {
      number: {
        value: 55,
        density: { enable: true, value_area: 850 }
      },
      color: {
        value: ["#45f6ff", "#27ffd4", "#9b54ff"]
      },
      shape: { type: "circle" },
      opacity: {
        value: 0.32,
        random: true
      },
      size: {
        value: 2.6,
        random: true
      },
      line_linked: {
        enable: true,
        distance: 145,
        color: "#45f6ff",
        opacity: 0.14,
        width: 1
      },
      move: {
        enable: true,
        speed: 1.1,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out"
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: true, mode: "push" },
        resize: true
      },
      modes: {
        grab: {
          distance: 160,
          line_linked: { opacity: 0.28 }
        },
        push: { particles_nb: 2 }
      }
    },
    retina_detect: true
  });
}
