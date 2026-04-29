'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (window.AOS) {
  AOS.init({ once: true, easing: 'ease-out-cubic', offset: 60, duration: 650 });
}

const header = document.querySelector('.site-header');

function updateHeaderState() {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
}

updateHeaderState();
window.addEventListener('scroll', updateHeaderState, { passive: true });

const menuBtn = document.getElementById('menu-btn');
const mobileNav = document.getElementById('mobile-menu');
const bar1 = document.getElementById('bar1');
const bar2 = document.getElementById('bar2');
const bar3 = document.getElementById('bar3');

function setMobileMenu(open) {
  mobileNav?.classList.toggle('open', open);
  menuBtn?.setAttribute('aria-expanded', String(open));

  if (bar1) bar1.style.transform = open ? 'rotate(45deg) translate(3px,3px)' : '';
  if (bar2) bar2.style.opacity = open ? '0' : '1';
  if (bar3) bar3.style.transform = open ? 'rotate(-45deg) translate(3px,-3px)' : '';
}

function closeMobileMenu() {
  setMobileMenu(false);
}

if (menuBtn && mobileNav) {
  menuBtn.addEventListener('click', () => {
    setMobileMenu(!mobileNav.classList.contains('open'));
  });

  mobileNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMobileMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileMenu();
  });

  document.addEventListener('click', (event) => {
    const clickedMenu = mobileNav.contains(event.target);
    const clickedButton = menuBtn.contains(event.target);
    if (!clickedMenu && !clickedButton) closeMobileMenu();
  });
}

window.closeMobileMenu = closeMobileMenu;

const heroImageContainer = document.querySelector('.hero-img-container');
const heroImageWrapper = document.querySelector('.hero-img-wrapper');
const canUsePointerMotion = window.matchMedia('(hover: hover) and (pointer: fine)');

if (
  heroImageContainer &&
  heroImageWrapper &&
  canUsePointerMotion.matches &&
  !prefersReducedMotion.matches
) {
  heroImageContainer.addEventListener('pointermove', (event) => {
    const rect = heroImageContainer.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    heroImageWrapper.style.setProperty('--tilt-x', `${x * 5}deg`);
    heroImageWrapper.style.setProperty('--tilt-y', `${y * -5}deg`);
  });

  heroImageContainer.addEventListener('pointerleave', () => {
    heroImageWrapper.style.setProperty('--tilt-x', '0deg');
    heroImageWrapper.style.setProperty('--tilt-y', '0deg');
  });
}

const carousel = document.getElementById('carousel');
const dotsEl = document.getElementById('dots');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const priceFormatter = new Intl.NumberFormat('fr-FR');
const whatsappNumber = '241066044714';

let carouselRaf = 0;
let autoplayTimer = 0;
let resumeAutoplayTimer = 0;
let carouselVisible = false;

function getCards() {
  return carousel ? Array.from(carousel.querySelectorAll('.prod-card')) : [];
}

function getCarouselGap() {
  if (!carousel) return 24;
  const styles = window.getComputedStyle(carousel);
  return parseFloat(styles.columnGap || styles.gap) || 24;
}

function getCardStep() {
  const card = carousel?.querySelector('.prod-card');
  if (!carousel || !card) return 320;
  return card.getBoundingClientRect().width + getCarouselGap();
}

function getCardsPerPage() {
  if (!carousel) return 1;
  return Math.max(1, Math.round((carousel.clientWidth + getCarouselGap()) / getCardStep()));
}

function updateDots(page) {
  if (!dotsEl) return;

  dotsEl.querySelectorAll('.dot').forEach((dot, index) => {
    const isActive = index === page;
    dot.classList.toggle('active', isActive);
    dot.setAttribute('aria-selected', String(isActive));
  });
}

function markActiveCard() {
  if (!carousel) return;

  const cards = getCards();
  const center = carousel.scrollLeft + carousel.clientWidth / 2;
  let activeCard = cards[0];
  let activeDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const distance = Math.abs(center - cardCenter);
    if (distance < activeDistance) {
      activeDistance = distance;
      activeCard = card;
    }
  });

  cards.forEach((card) => card.classList.toggle('is-active', card === activeCard));
}

function updateCarouselState() {
  if (!carousel || !dotsEl) return;

  const step = getCardStep() * getCardsPerPage();
  const maxPage = Math.max(0, dotsEl.querySelectorAll('.dot').length - 1);
  const page = Math.min(maxPage, Math.max(0, Math.round(carousel.scrollLeft / step)));

  updateDots(page);
  markActiveCard();
}

function scheduleCarouselState() {
  if (carouselRaf) return;
  carouselRaf = window.requestAnimationFrame(() => {
    updateCarouselState();
    carouselRaf = 0;
  });
}

function buildDots() {
  if (!carousel || !dotsEl) return;

  const cards = getCards();
  const totalPages = Math.max(1, Math.ceil(cards.length / getCardsPerPage()));

  dotsEl.innerHTML = '';
  for (let i = 0; i < totalPages; i += 1) {
    const btn = document.createElement('button');
    btn.className = `dot${i === 0 ? ' active' : ''}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-label', `Page ${i + 1} sur ${totalPages}`);
    btn.setAttribute('aria-selected', String(i === 0));
    btn.addEventListener('click', () => {
      stopAutoplay();
      carousel.scrollTo({ left: i * getCardStep() * getCardsPerPage(), behavior: 'smooth' });
      resumeAutoplaySoon();
    });
    dotsEl.appendChild(btn);
  }

  updateCarouselState();
}

function scrollCar(direction) {
  if (!carousel) return;

  const amount = getCardStep() * getCardsPerPage();
  carousel.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
}

btnPrev?.addEventListener('click', () => {
  stopAutoplay();
  scrollCar('left');
  resumeAutoplaySoon();
});

btnNext?.addEventListener('click', () => {
  stopAutoplay();
  scrollCar('right');
  resumeAutoplaySoon();
});

window.scrollCar = scrollCar;

function canAutoplay() {
  return Boolean(
    carousel &&
    carouselVisible &&
    !document.hidden &&
    !prefersReducedMotion.matches &&
    getCards().length > getCardsPerPage()
  );
}

function advanceCarousel() {
  if (!carousel) return;

  const maxScroll = carousel.scrollWidth - carousel.clientWidth - 4;
  const nextLeft = carousel.scrollLeft >= maxScroll ? 0 : carousel.scrollLeft + getCardStep();
  carousel.scrollTo({ left: nextLeft, behavior: 'smooth' });
}

function startAutoplay() {
  stopAutoplay();
  if (!canAutoplay()) return;
  autoplayTimer = window.setInterval(advanceCarousel, 5200);
}

function stopAutoplay() {
  if (autoplayTimer) {
    window.clearInterval(autoplayTimer);
    autoplayTimer = 0;
  }
}

function resumeAutoplaySoon() {
  window.clearTimeout(resumeAutoplayTimer);
  resumeAutoplayTimer = window.setTimeout(startAutoplay, 5000);
}

if (carousel) {
  carousel.addEventListener('scroll', scheduleCarouselState, { passive: true });

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  carousel.addEventListener('focusin', stopAutoplay);
  carousel.addEventListener('focusout', startAutoplay);
  carousel.addEventListener('touchstart', stopAutoplay, { passive: true });
  carousel.addEventListener('touchend', resumeAutoplaySoon, { passive: true });

  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      stopAutoplay();
      scrollCar('right');
      resumeAutoplaySoon();
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stopAutoplay();
      scrollCar('left');
      resumeAutoplaySoon();
    }

    const cards = getCards();
    const currentIndex = cards.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    if (event.key === 'ArrowRight' && currentIndex < cards.length - 1) {
      event.preventDefault();
      cards[currentIndex + 1].focus();
      cards[currentIndex + 1].scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
    }

    if (event.key === 'ArrowLeft' && currentIndex > 0) {
      event.preventDefault();
      cards[currentIndex - 1].focus();
      cards[currentIndex - 1].scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
    }

    if (event.key === 'Enter' || event.key === ' ') {
      const link = document.activeElement.querySelector('a.btn-green-card');
      if (link) {
        event.preventDefault();
        link.click();
      }
    }
  });

  if ('IntersectionObserver' in window) {
    const carouselObserver = new IntersectionObserver(([entry]) => {
      carouselVisible = entry.isIntersecting;
      if (carouselVisible) startAutoplay();
      else stopAutoplay();
    }, { threshold: 0.35 });

    carouselObserver.observe(carousel);
  } else {
    carouselVisible = true;
  }
}

window.addEventListener('resize', () => {
  window.clearTimeout(resumeAutoplayTimer);
  resumeAutoplayTimer = window.setTimeout(() => {
    buildDots();
    startAutoplay();
  }, 160);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoplay();
  else startAutoplay();
});

function getAbsoluteImageUrl(imageUrl) {
  return new URL(imageUrl, window.location.href).href;
}

function buildWhatsAppUrl(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function buildProductOrderMessage({ ref, description, prix, imageUrl }) {
  return [
    `Bonjour BRND, je souhaite commander le modele ${ref}.`,
    `Description : ${description}`,
    `Prix : ${priceFormatter.format(prix)} FCFA.`,
    `Photo du modele : ${getAbsoluteImageUrl(imageUrl)}`,
    'Merci!'
  ].join('\n');
}

async function chargerEtGenerer() {
  if (!carousel || !dotsEl) return;

  try {
    const response = await fetch('produits.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const produits = Array.isArray(data.produits) ? data.produits : [];

    carousel.innerHTML = '';

    produits.forEach((produit, index) => {
      const ref = produit.ref;
      const description = produit.description || produit.nom;
      const prix = Number(produit.prix);
      const ancienPrix = Number(produit.ancien_prix);
      const imageUrl = produit.image;
      const orderMessage = buildProductOrderMessage({ ref, description, prix, imageUrl });
      const waUrl = buildWhatsAppUrl(orderMessage);

      const card = document.createElement('article');
      card.className = 'prod-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'article');
      card.innerHTML = `
        <div class="prod-thumb-wrap">
          <img src="${imageUrl}" alt="${description} - ${ref}" class="prod-thumb" loading="${index < 6 ? 'eager' : 'lazy'}" onerror="this.src='https://placehold.co/400x300/e2e8f0/475569?text=${encodeURIComponent(ref)}'">
        </div>
        <div class="prod-body">
          <div>
            <p class="prod-ref">${ref}</p>
            <h3 class="prod-name">${description}</h3>
          </div>
          <div class="prod-prices">
            <span class="prod-price">${priceFormatter.format(prix)} F</span>
            <del class="prod-old">${priceFormatter.format(ancienPrix)} F</del>
          </div>
          <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-green-card" aria-label="Commander ${ref} avec sa photo sur WhatsApp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Commander
          </a>
        </div>
      `;

      carousel.appendChild(card);

      const revealDelay = prefersReducedMotion.matches ? 0 : Math.min(index * 35, 650);
      window.setTimeout(() => card.classList.add('card-ready'), revealDelay);
    });

    buildDots();
    window.AOS?.refreshHard();
    startAutoplay();
  } catch (error) {
    console.error('Erreur chargement produits.json:', error);
    carousel.innerHTML = '<div style="padding:2rem;text-align:center;">Impossible de charger le catalogue. Verifiez que le fichier <strong>produits.json</strong> est bien present.</div>';
  }
}

chargerEtGenerer();
