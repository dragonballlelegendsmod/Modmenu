const CONFIG = {
  contentLockerUrl: 'https://saveapp.store/cl/i/6n9888',
  // This is the download link you place INSIDE your OGAds content locker dashboard
  // Users will be redirected here after completing the content locker
  modDownloadLink: '#', // Replace with your actual mod download link
};

// ========== HEADER SCROLL EFFECT ==========
const header = document.getElementById('site-header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
});

// ========== MOBILE MENU ==========
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');

mobileMenuBtn.addEventListener('click', () => {
  mobileNav.classList.toggle('active');
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('active');
  });
});

// ========== SCROLL ANIMATIONS (Intersection Observer) ==========
const animElements = document.querySelectorAll('[data-anim="fade-up"]');

const animObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      // Stagger the animation
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 100);
      animObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
});

animElements.forEach(el => animObserver.observe(el));

// ========== STATS COUNTER ANIMATION ==========
const statNumbers = document.querySelectorAll('.stat-number');
let statsAnimated = false;

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'));
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);

    el.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !statsAnimated) {
      statsAnimated = true;
      statNumbers.forEach((num, i) => {
        setTimeout(() => animateCounter(num), i * 200);
      });
    }
  });
}, { threshold: 0.3 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) {
  statsObserver.observe(statsBar);
}

// ========== FAQ TOGGLE ==========
function toggleFaq(button) {
  const faqItem = button.closest('.faq-item');
  const isActive = faqItem.classList.contains('active');

  // Close all FAQs
  document.querySelectorAll('.faq-item').forEach(item => {
    item.classList.remove('active');
  });

  // Open clicked one if it wasn't active
  if (!isActive) {
    faqItem.classList.add('active');
  }
}

// ========== CONTENT LOCKER SYSTEM ==========
let currentPlatform = '';

function showContentLocker(platform) {
  currentPlatform = platform;
  const modal = document.getElementById('content-locker-modal');
  const container = document.getElementById('content-locker-container');

  // Inject the OGAds content locker iframe
  container.innerHTML = `<iframe 
    src="${CONFIG.contentLockerUrl}" 
    frameborder="0" 
    scrolling="yes"
    allow="clipboard-write"
    style="width: 100%; height: 450px; border: none; border-radius: 0.5rem;">
  </iframe>`;

  // Show modal
  modal.style.display = 'flex';
  requestAnimationFrame(() => {
    modal.classList.add('active');
  });

  // Prevent body scroll
  document.body.style.overflow = 'hidden';

  // Listen for content locker completion via postMessage
  window.addEventListener('message', handleContentLockerMessage);
}

function handleContentLockerMessage(event) {
  // OGAds sends a postMessage when the user completes an offer
  // The event data may vary; common patterns include:
  if (event.data === 'ogads_complete' || 
      event.data === 'completed' || 
      event.data?.type === 'ogads' ||
      event.data?.status === 'completed') {
    onContentLockerCompleted();
  }
}

function onContentLockerCompleted() {
  // Remove message listener
  window.removeEventListener('message', handleContentLockerMessage);

  // Close content locker modal
  closeContentLocker();

  // Show download ready modal
  showDownloadReady();
}

function closeContentLocker() {
  const modal = document.getElementById('content-locker-modal');
  modal.classList.remove('active');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
  document.body.style.overflow = '';
}

function showDownloadReady() {
  const modal = document.getElementById('download-ready-modal');
  const downloadLink = document.getElementById('final-download-link');

  // Set the download link
  // This link is what the user gets AFTER completing the content locker
  downloadLink.href = CONFIG.modDownloadLink;

  // Update progress indicators
  const step2 = document.getElementById('progress-step-2');
  if (step2) {
    step2.classList.add('active', 'completed');
  }

  modal.style.display = 'flex';
  requestAnimationFrame(() => {
    modal.classList.add('active');
  });
  document.body.style.overflow = 'hidden';
}

function closeDownloadReady() {
  const modal = document.getElementById('download-ready-modal');
  modal.classList.remove('active');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
  document.body.style.overflow = '';
}

// Close modals on overlay click (outside content)
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      if (overlay.id === 'content-locker-modal') {
        closeContentLocker();
      } else if (overlay.id === 'download-ready-modal') {
        closeDownloadReady();
      }
    }
  });
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeContentLocker();
    closeDownloadReady();
  }
});

// ========== SMOOTH SCROLL FOR NAV LINKS ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerHeight = header.offsetHeight;
      const targetPosition = target.offsetTop - headerHeight - 20;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  });
});

// ========== PARTICLE EFFECT (Subtle Blue Particles) ==========
function createParticles() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      background: rgba(30, 144, 255, ${Math.random() * 0.3 + 0.1});
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      pointer-events: none;
      animation: particleFloat ${Math.random() * 8 + 6}s ease-in-out infinite;
      animation-delay: ${Math.random() * 5}s;
    `;
    hero.appendChild(particle);
  }

  // Add particle animation keyframes
  if (!document.getElementById('particle-styles')) {
    const style = document.createElement('style');
    style.id = 'particle-styles';
    style.textContent = `
      @keyframes particleFloat {
        0%, 100% {
          transform: translate(0, 0) scale(1);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        50% {
          transform: translate(${Math.random() > 0.5 ? '' : '-'}${Math.random() * 100}px, -${Math.random() * 200 + 100}px) scale(1.5);
          opacity: 0.5;
        }
        90% {
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize particles on load
window.addEventListener('DOMContentLoaded', createParticles);

// ========== CONSOLE BRANDING ==========
console.log(
  '%c DBL Mod Menu %c Blue Edition ',
  'background: linear-gradient(135deg, #1E90FF, #00BFFF); color: white; padding: 8px 12px; border-radius: 4px 0 0 4px; font-weight: bold; font-size: 14px;',
  'background: #0a0a1a; color: #1E90FF; padding: 8px 12px; border-radius: 0 4px 4px 0; font-weight: bold; font-size: 14px; border: 1px solid #1E90FF;'
);
