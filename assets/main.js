 'use strict';

    AOS.init({ once: true, easing: 'ease-out-cubic', offset: 60 });

    // Menu mobile (identique)
    const menuBtn = document.getElementById('menu-btn');
    const mobileNav = document.getElementById('mobile-menu');
    const bar1 = document.getElementById('bar1');
    const bar2 = document.getElementById('bar2');
    const bar3 = document.getElementById('bar3');

    function closeMobileMenu() {
      mobileNav?.classList.remove('open');
      menuBtn?.setAttribute('aria-expanded', 'false');
      if (bar1) bar1.style.transform = '';
      if (bar2) bar2.style.opacity = '1';
      if (bar3) bar3.style.transform = '';
    }

    if (menuBtn && mobileNav) {
      menuBtn.addEventListener('click', () => {
        const open = mobileNav.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(open));
        if (bar1) bar1.style.transform = open ? 'rotate(45deg) translate(3px,3px)' : '';
        if (bar2) bar2.style.opacity = open ? '0' : '1';
        if (bar3) bar3.style.transform = open ? 'rotate(-45deg) translate(3px,-3px)' : '';
      });
    }
    window.closeMobileMenu = closeMobileMenu;

    // Récupération des éléments du carrousel
    const carousel = document.getElementById('carousel');
    const dotsEl = document.getElementById('dots');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    // Fonction de défilement
    function scrollCar(direction) {
      const amount = 960;
      carousel.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
    if (btnPrev) btnPrev.addEventListener('click', () => scrollCar('left'));
    if (btnNext) btnNext.addEventListener('click', () => scrollCar('right'));
    window.scrollCar = scrollCar;

    // ---------- CHARGEMENT DES PRODUITS DEPUIS produits.json ----------
    async function chargerEtGenerer() {
      try {
        const response = await fetch('produits.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const produits = data.produits; // tableau des 50 produits

        // Générer les cartes
        carousel.innerHTML = '';
        produits.forEach((produit, idx) => {
          const ref = produit.ref;
          const nom = produit.nom;
          const prix = produit.prix;
          const ancienPrix = produit.ancien_prix;
          const imageUrl = produit.image; // ex: "images/drap1.jpg"
          const waMsg = encodeURIComponent(
            `Bonjour BRND, je souhaite commander le modèle ${ref} (${nom}) - ${prix} FCFA. Merci!`
          );
          const waUrl = `https://wa.me/+241066044714?text=${waMsg}`;

          const card = document.createElement('article');
          card.className = 'prod-card';
          card.setAttribute('tabindex', '0');
          card.setAttribute('role', 'article');
          card.innerHTML = `
            <div class="prod-thumb-wrap">
              <img src="${imageUrl}" alt="${nom} - ${ref}" class="prod-thumb" loading="${idx < 6 ? 'eager' : 'lazy'}" onerror="this.src='https://placehold.co/400x300/e2e8f0/475569?text=${encodeURIComponent(ref)}'">
              <span class="badge-promo">-15%</span>
            </div>
            <div class="prod-body">
              <div>
                <p class="prod-ref">${ref}</p>
                <h3 class="prod-name">${nom}</h3>
              </div>
              <div class="prod-prices">
                <span class="prod-price">${prix.toLocaleString()} F</span>
                <del class="prod-old">${ancienPrix.toLocaleString()} F</del>
              </div>
              <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-green-card">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Commander
              </a>
            </div>
          `;
          carousel.appendChild(card);
        });

        // Générer les points de pagination
        const PER_PAGE = 3;
        const totalPages = Math.ceil(produits.length / PER_PAGE);
        dotsEl.innerHTML = '';
        for (let i = 0; i < totalPages; i++) {
          const btn = document.createElement('button');
          btn.className = 'dot' + (i === 0 ? ' active' : '');
          btn.setAttribute('role', 'tab');
          btn.setAttribute('aria-label', `Page ${i+1} sur ${totalPages}`);
          btn.addEventListener('click', () => {
            carousel.scrollTo({ left: i * (300 + 24) * PER_PAGE, behavior: 'smooth' });
          });
          dotsEl.appendChild(btn);
        }

        // Mise à jour des points actifs au scroll
        carousel.addEventListener('scroll', () => {
          const page = Math.round(carousel.scrollLeft / ((300 + 24) * PER_PAGE));
          document.querySelectorAll('.dot').forEach((dot, idx) => {
            dot.classList.toggle('active', idx === page);
            dot.setAttribute('aria-selected', String(idx === page));
          });
        }, { passive: true });

        // Navigation clavier (inchangée)
        carousel.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); scrollCar('right'); }
          if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollCar('left'); }
          const cards = Array.from(carousel.querySelectorAll('.prod-card'));
          const idx = cards.indexOf(document.activeElement);
          if (idx === -1) return;
          if (e.key === 'ArrowRight' && idx < cards.length - 1) {
            e.preventDefault();
            cards[idx+1].focus();
            cards[idx+1].scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
          }
          if (e.key === 'ArrowLeft' && idx > 0) {
            e.preventDefault();
            cards[idx-1].focus();
            cards[idx-1].scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
          }
          if (e.key === 'Enter' || e.key === ' ') {
            const link = document.activeElement.querySelector('a.btn-green-card');
            if (link) { e.preventDefault(); link.click(); }
          }
        });

      } catch (error) {
        console.error('Erreur chargement produits.json:', error);
        carousel.innerHTML = '<div style="padding:2rem;text-align:center;">⚠️ Impossible de charger le catalogue. Vérifiez que le fichier <strong>produits.json</strong> est bien présent.</div>';
      }
    }

    // Lancer le chargement
    chargerEtGenerer();