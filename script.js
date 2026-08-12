(function(){
  'use strict';

  /* ---------- Backend config ----------
     Paste your deployed Google Apps Script Web App URL here.
     See apps-script/SETUP.md for how to get this. */
  var CONFIG = {
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzeE87wfxdoMJm2EzpkxboWFmQAGZbn6iflQIKMAaAp-h5ybro1qFXXXCkbssFFvap3fQ/exec'
  };

  function submitToBackend(fields){
    if(!CONFIG.SCRIPT_URL || CONFIG.SCRIPT_URL.indexOf('PASTE_YOUR') === 0){
      console.warn('9ja Delta Food: Apps Script URL not configured yet — skipping backend submit.');
      return;
    }
    var body = new URLSearchParams(fields);
    // mode:'no-cors' is required for Apps Script web apps; the response
    // is opaque (unreadable) but the request still reaches the script,
    // writes the sheet row, and sends the emails. The UI already shows
    // its own success state below, independent of this response.
    fetch(CONFIG.SCRIPT_URL, { method:'POST', mode:'no-cors', body: body })
      .catch(function(err){ console.error('9ja Delta Food: backend submit failed', err); });
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Loader ---------- */
  window.addEventListener('load', function(){
    var loader = document.getElementById('loader');
    if(loader){ loader.classList.add('loaded'); }
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Back to top (declared early so onScroll can safely use it) ---------- */
  var topBtn = document.getElementById('topBtn');
  function toggleTopBtn(){ topBtn.classList.toggle('show', window.scrollY > 500); }

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById('header');
  function onScroll(){
    if(window.scrollY > 40){ header.classList.add('scrolled'); }
    else{ header.classList.remove('scrolled'); }
    toggleTopBtn();
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var menuBtn = document.getElementById('menu-btn');
  var navbar = document.getElementById('navbar');

  function closeNav(){
    navbar.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded','false');
  }
  function openNav(){
    navbar.classList.add('open');
    menuBtn.classList.add('open');
    menuBtn.setAttribute('aria-expanded','true');
  }
  menuBtn.addEventListener('click', function(){
    navbar.classList.contains('open') ? closeNav() : openNav();
  });
  navbar.addEventListener('click', function(e){
    if(e.target.tagName === 'A'){ closeNav(); }
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){ closeNav(); }
  });

  /* ---------- Smooth scroll w/ header offset ---------- */
  var headerOffset = 88;
  document.querySelectorAll('a[href^="#"]').forEach(function(link){
    link.addEventListener('click', function(e){
      var id = link.getAttribute('href');
      if(id.length < 2) return;
      var target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Scrollspy ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#navbar a'));
  var sections = navLinks.map(function(l){ return document.querySelector(l.getAttribute('href')); }).filter(Boolean);

  var spy = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var id = '#' + entry.target.id;
        navLinks.forEach(function(l){ l.classList.toggle('active', l.getAttribute('href') === id); });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(function(s){ spy.observe(s); });

  /* ---------- Reveal on scroll ----------
     Content is visible by default (see CSS: .reveal has opacity:1 unless
     the .js class is present). Here we simply add .in-view the first
     time each element enters the viewport - no timers, no class that
     could leave a section stuck hidden. */
  if(!reduceMotion && 'IntersectionObserver' in window){
    var revealEls = document.querySelectorAll('.reveal');

    var revealObserver = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold:0, rootMargin:'0px 0px 150px 0px' });
    revealEls.forEach(function(el){ revealObserver.observe(el); });
  }

  /* ---------- Menu filter ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var menuCards = document.querySelectorAll('#menuGrid .menu-card');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');
      menuCards.forEach(function(card){
        var match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---------- Menu item WhatsApp order links ---------- */
  document.querySelectorAll('.order-link').forEach(function(link){
    link.addEventListener('click', function(e){
      e.preventDefault();
      var dish = link.getAttribute('data-dish');
      var price = link.getAttribute('data-price');
      var msg = "Hi 9ja Delta Food, I'd like to order: " + dish + " (" + price + ").";
      window.open('https://wa.me/2349157470742?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  });

  /* ---------- Testimonial carousel ---------- */
  var slides = document.querySelectorAll('.t-slide');
  var dotsWrap = document.getElementById('tDots');
  var current = 0, timer;

  slides.forEach(function(_, i){
    var dot = document.createElement('button');
    dot.className = 't-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to testimonial ' + (i+1));
    dot.addEventListener('click', function(){ goTo(i); resetAutoplay(); });
    dotsWrap.appendChild(dot);
  });
  var dots = document.querySelectorAll('.t-dot');

  function goTo(index){
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }
  document.getElementById('tNext').addEventListener('click', function(){ goTo(current+1); resetAutoplay(); });
  document.getElementById('tPrev').addEventListener('click', function(){ goTo(current-1); resetAutoplay(); });

  function startAutoplay(){
    if(reduceMotion) return;
    timer = setInterval(function(){ goTo(current+1); }, 6000);
  }
  function resetAutoplay(){ clearInterval(timer); startAutoplay(); }
  var carousel = document.querySelector('.t-carousel');
  carousel.addEventListener('mouseenter', function(){ clearInterval(timer); });
  carousel.addEventListener('mouseleave', startAutoplay);
  carousel.addEventListener('focusin', function(){ clearInterval(timer); });
  carousel.addEventListener('focusout', startAutoplay);
  startAutoplay();

  /* ---------- Reservation date min ---------- */
  var resDate = document.getElementById('resDate');
  if(resDate){ resDate.min = new Date().toISOString().split('T')[0]; }

  /* ---------- Form validation helper ---------- */
  function validateField(field, message){
    var input = field.querySelector('input, textarea');
    var errorEl = field.querySelector('.field-error');
    var valid = input.checkValidity();
    field.classList.toggle('invalid', !valid);
    if(errorEl){ errorEl.textContent = valid ? '' : (message || 'This field is required.'); }
    return valid;
  }

  /* ---------- Reservation form ---------- */
  var resForm = document.getElementById('reservationForm');
  resForm.addEventListener('submit', function(e){
    e.preventDefault();
    var fields = resForm.querySelectorAll('.field');
    var allValid = true;
    fields.forEach(function(field){
      var input = field.querySelector('input, textarea');
      if(input && input.hasAttribute('required')){
        if(!validateField(field)) allValid = false;
      }
    });
    if(!allValid) return;

    var name = document.getElementById('resName').value;
    var email = document.getElementById('resEmail').value;
    var phone = document.getElementById('resPhone').value;
    var date = document.getElementById('resDate').value;
    var time = document.getElementById('resTime').value;
    var guests = document.getElementById('resGuests').value;
    var note = document.getElementById('resNote').value;

    submitToBackend({
      formType: 'reservation',
      name: name, email: email, phone: phone,
      date: date, time: time, guests: guests, note: note
    });

    document.getElementById('resSummary').textContent =
      'Thanks, ' + name + ' — a table for ' + guests + ' on ' + date + ' at ' + time +
      ' is on its way to confirmation. A confirmation email is heading to your inbox.';

    var waMsg = "Hi 9ja Delta Food, I'd like to book a table.\nName: " + name +
      "\nDate: " + date + "\nTime: " + time + "\nGuests: " + guests +
      (note ? ("\nNote: " + note) : "");
    document.getElementById('resWhatsapp').href = 'https://wa.me/2349157470742?text=' + encodeURIComponent(waMsg);

    resForm.style.display = 'none';
    document.getElementById('resSuccess').classList.add('show');
  });

  /* ---------- Contact form ---------- */
  var contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    var fields = contactForm.querySelectorAll('.field');
    var allValid = true;
    fields.forEach(function(field){
      var input = field.querySelector('input, textarea');
      if(input && input.hasAttribute('required')){
        if(!validateField(field)) allValid = false;
      }
    });
    if(!allValid) return;

    submitToBackend({
      formType: 'contact',
      name: document.getElementById('cName').value,
      email: document.getElementById('cEmail').value,
      subject: document.getElementById('cSubject').value,
      message: document.getElementById('cMessage').value
    });

    document.getElementById('contactSuccess').style.display = 'block';
    contactForm.reset();
  });

  /* ---------- Newsletter ---------- */
  var newsletterForm = document.getElementById('newsletterForm');
  newsletterForm.addEventListener('submit', function(e){
    e.preventDefault();
    var input = document.getElementById('newsletterEmail');
    var msg = document.getElementById('newsletterMsg');
    if(input.checkValidity()){
      msg.textContent = "You're subscribed! Watch your inbox for Delta specials.";
      input.value = '';
    } else {
      msg.textContent = 'Please enter a valid email address.';
    }
  });

  /* ---------- Back to top (click handler only; declared above) ---------- */
  topBtn.addEventListener('click', function(){
    window.scrollTo({ top:0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

})();
