// Visual Identity Studio - Main Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. Preloader dismissal ──
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    preloader.style.pointerEvents = 'none';
    preloader.style.display = 'none';
  }

  // ── 2. Header Mobile Navigation Toggle ──
  const navToggle = document.querySelector('.elementor-menu-toggle');
  const dropdownMenu = document.querySelector('.elementor-nav-menu--dropdown');
  
  if (navToggle && dropdownMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      dropdownMenu.classList.toggle('active');
    });

    // Close mobile menu on link click
    dropdownMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        dropdownMenu.classList.remove('active');
      });
    });
  }

  // ── 3. Services Accordion Toggle ──
  const accordionItems = document.querySelectorAll('.e-n-accordion-item');
  accordionItems.forEach(item => {
    const summary = item.querySelector('.e-n-accordion-item-title');
    if (!summary) return;

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = item.hasAttribute('open');

      // Close all other items (single expanded item mode)
      accordionItems.forEach(other => {
        if (other !== item) {
          other.removeAttribute('open');
          const otherSummary = other.querySelector('.e-n-accordion-item-title');
          if (otherSummary) otherSummary.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.removeAttribute('open');
        summary.setAttribute('aria-expanded', 'false');
      } else {
        item.setAttribute('open', '');
        summary.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ── 4. Interactive Work Process Circular Wheel ──
  const processWheel = document.querySelector('.process-wheel-section');
  if (processWheel) {
    const wheelNodes = processWheel.querySelectorAll('.wheel-node');
    const centerText = document.getElementById('process-center-text');

    const processDescriptions = [
      "We identify your brand essence, audience and aesthetic direction. This creates the foundation for identity and digital experience.",
      "We define the visual universe — aesthetic direction, identity concept, and brand rules.",
      "We design the complete visual identity system: logo, typography, colour, layout rules.",
      "We translate the identity into a premium digital experience with intentional UX flows and clean, editorial interfaces.",
      "Our development team builds your website, ensuring pixel-perfect execution of the creative direction.",
      "We test, refine, launch, and provide post-launch creative support. This full-cycle model ensures consistency, speed, and world-class execution."
    ];

    const setWheelStep = (index) => {
      wheelNodes.forEach((node, idx) => {
        node.classList.toggle('active', idx === index);
      });
      if (centerText && index >= 0) {
        centerText.style.opacity = '0';
        centerText.style.transform = 'translateY(4px)';
        setTimeout(() => {
          centerText.textContent = processDescriptions[index];
          centerText.style.opacity = '1';
          centerText.style.transform = 'translateY(0)';
        }, 150);
      }
    };

    const clearWheelSteps = () => {
      wheelNodes.forEach(node => node.classList.remove('active'));
    };

    wheelNodes.forEach((node, idx) => {
      node.addEventListener('mouseenter', () => {
        setWheelStep(idx);
      });
      node.addEventListener('click', () => {
        setWheelStep(idx);
      });
    });

    processWheel.addEventListener('mouseleave', () => {
      clearWheelSteps();
    });
  }

  // ── 5. Testimonial Slider / Carousel ──
  const sliderContainer = document.querySelector('.eael-testimonial-slider-main');
  if (sliderContainer) {
    const slides = sliderContainer.querySelectorAll('.swiper-slide');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    const dotsContainer = document.querySelector('.testimonial-dots');
    
    let activeSlideIndex = 0;

    // Create pagination dots
    if (dotsContainer && slides.length > 0) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, idx) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (idx === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(idx));
        dotsContainer.appendChild(dot);
      });
    }

    const goToSlide = (index) => {
      if (slides.length === 0) return;
      activeSlideIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, idx) => {
        slide.style.transform = `translateX(-${activeSlideIndex * 100}%)`;
      });
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === activeSlideIndex);
        });
      }
    };

    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(activeSlideIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(activeSlideIndex + 1));

    // Auto rotate testimonials
    setInterval(() => {
      goToSlide(activeSlideIndex + 1);
    }, 5000);
  }

  // ── 6. Contact Form Submission ──
  const contactForm = document.querySelector('.elementor-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerText : 'Send';

      if (submitBtn) {
        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        alert('Thank you! Your message has been sent successfully. We will get back to you shortly.');
        contactForm.reset();
        if (submitBtn) {
          submitBtn.innerText = originalText;
          submitBtn.disabled = false;
        }
      }, 1000);
    });
  }

  // ── 7. Scroll Animation Observer (fadeInUp) ──
  const animatedElements = document.querySelectorAll('.elementor-invisible');
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('elementor-invisible');
        entry.target.classList.add('animated', 'fadeInUp');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));

  // ── 8. Stat Cards Animated Counter & 3D Tilt Spotlight ──
  const statCards = document.querySelectorAll('.stat-card[data-tilt]');
  const statNumbers = document.querySelectorAll('.stat-number');

  // Animated Live Ticking Counter Observer
  if (statNumbers.length > 0) {
    const runLiveCounter = (el) => {
      const targetVal = parseInt(el.getAttribute('data-target'), 10);
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      
      let currentVal = 0;
      const stepTime = Math.max(16, Math.floor(1500 / targetVal)); // Step time per increment
      
      el.textContent = `${prefix}0${suffix}`;

      if (el._counterTimer) clearInterval(el._counterTimer);

      el._counterTimer = setInterval(() => {
        currentVal++;
        el.textContent = `${prefix}${currentVal}${suffix}`;
        if (currentVal >= targetVal) {
          el.textContent = `${prefix}${targetVal}${suffix}`;
          clearInterval(el._counterTimer);
        }
      }, stepTime);
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runLiveCounter(entry.target);
        } else {
          const prefix = entry.target.getAttribute('data-prefix') || '';
          const suffix = entry.target.getAttribute('data-suffix') || '';
          entry.target.textContent = `${prefix}0${suffix}`;
          if (entry.target._counterTimer) clearInterval(entry.target._counterTimer);
        }
      });
    }, { threshold: 0.2 });

    statNumbers.forEach(num => counterObserver.observe(num));
  }

  // 3D Tilt & Mouse Spotlight Tracking
  const tiltCards = document.querySelectorAll('.stat-card, .team-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px) scale(1.03)`;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
    });
  });

  // ── 9. Deck Metrics Animated Counter Observer ──
  const metricNums = document.querySelectorAll('.metric-num');
  if (metricNums.length > 0) {
    const deckCounterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetVal = parseInt(el.getAttribute('data-target'), 10);
          const duration = 1600;
          const startTime = performance.now();

          const updateMetricCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentCount = Math.floor(easeOutProgress * targetVal);

            el.textContent = currentCount;

            if (progress < 1) {
              requestAnimationFrame(updateMetricCounter);
            } else {
              el.textContent = targetVal;
            }
          };

          requestAnimationFrame(updateMetricCounter);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    metricNums.forEach(num => deckCounterObserver.observe(num));
  }

  // ── 10. Interactive Blog Reader Modal ──
  const blogData = [
    {
      title: "The Power of Strategic User Journeys: Converting Visitors into Clients",
      date: "2026-08-01",
      tag: "UI/UX & Conversion",
      body: `<p>Designing a high-converting website goes far beyond surface-level aesthetics. Every color choice, button placement, and typography hierarchy plays a crucial role in shaping the user's journey.</p>
             <p>At BitDev Studio, we engineer user flows that lead visitors naturally toward conversion. By removing friction points, optimizing loading performance, and establishing trust through clean visual proof, your website transforms into an automated 24/7 client acquisition engine across Real Estate, E-Commerce, Corporate, and Tech sectors.</p>
             <p><strong>Key Takeaways:</strong></p>
             <ul style="margin-left: 20px; margin-top: 10px;">
               <li>Establish clear visual hierarchy above the fold.</li>
               <li>Reduce interactive friction and redundant form fields.</li>
               <li>Leverage dynamic social proof near key decision touchpoints.</li>
             </ul>`
    },
    {
      title: "Why Custom Web Engineering Beats Pre-Made Templates Every Time",
      date: "2026-07-28",
      tag: "Development",
      body: `<p>Off-the-shelf templates often come bloated with thousands of lines of unused code, slow loading scripts, and rigid structures that limit your brand's growth.</p>
             <p>Bespoke web engineering ensures every line of code is written with intent. From custom WebGL 3D micro-animations to tailored CMS architectures, custom development grants your business absolute scalability, bulletproof security, and unmatched search engine visibility.</p>
             <p><strong>Why Custom Wins:</strong></p>
             <ul style="margin-left: 20px; margin-top: 10px;">
               <li>Zero bloated plugins or unnecessary dependencies.</li>
               <li>100% custom brand design with no template limitations.</li>
               <li>Sub-second page load times out of the box.</li>
             </ul>`
    },
    {
      title: "Optimizing Website Speed: How 1 Second Drives 27% Higher Conversion",
      date: "2026-07-24",
      tag: "Performance & SEO",
      body: `<p>Studies show that over 53% of mobile users abandon a website if it takes longer than 3 seconds to load. Modern web users demand instantaneous responsiveness.</p>
             <p>By leveraging asset optimization, lazy-loading image pipelines, clean CSS, and edge CDN delivery, BitDev Studio ensures your platform loads in under a single second, maximizing visitor retention and search engine dominance.</p>
             <p>When pages load instantaneously, user engagement spikes, dwell time increases, and overall revenue conversion improves drastically.</p>`
    },
    {
      title: "Designing Across Diverse Markets: Real Estate, Tech, E-Commerce & Beyond",
      date: "2026-07-20",
      tag: "Cross-Industry UX",
      body: `<p>Every industry possesses unique audience expectations and emotional triggers. Real estate buyers seek prestige and high-resolution spatial clarity; tech founders prioritize sleek innovation and feature clarity; e-commerce platforms demand seamless checkout speed.</p>
             <p>A multi-disciplinary design approach synthesizes these industry-specific principles into bespoke web solutions tailored specifically to your target demographic.</p>
             <p>Whether launching a corporate portal or a luxury digital product, tailoring the user experience to market expectations creates instant trust.</p>`
    }
  ];

  const blogModal = document.getElementById('blog-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTag = document.getElementById('modal-blog-tag');
  const modalDate = document.getElementById('modal-blog-date');
  const modalTitle = document.getElementById('modal-blog-title');
  const modalBody = document.getElementById('modal-blog-body');
  const modalCtaLink = document.getElementById('modal-cta-link');

  window.openBlogModal = function(index) {
    const data = blogData[index];
    if (!data) return;
    const modalTag = document.getElementById('modal-blog-tag');
    const modalDate = document.getElementById('modal-blog-date');
    const modalTitle = document.getElementById('modal-blog-title');
    const modalBody = document.getElementById('modal-blog-body');
    const blogModal = document.getElementById('blog-modal');

    if (modalTag) modalTag.textContent = data.tag;
    if (modalDate) modalDate.textContent = data.date;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalBody) modalBody.innerHTML = data.body;

    if (blogModal) {
      blogModal.classList.add('active');
      blogModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeBlogModal = function() {
    const blogModal = document.getElementById('blog-modal');
    if (blogModal) {
      blogModal.classList.remove('active');
      blogModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', window.closeBlogModal);
  }

  if (blogModal) {
    blogModal.addEventListener('click', (e) => {
      if (e.target === blogModal) window.closeBlogModal();
    });
  }

  if (modalCtaLink) {
    modalCtaLink.addEventListener('click', window.closeBlogModal);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeBlogModal();
    }
  });

  // ── 11. Contact Form Submission Handler ──
  const contactForm = document.getElementById('contact-form');
  const statusMsg = document.getElementById('form-status-msg');
  const submitBtn = document.getElementById('btn-submit-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('form-name')?.value || 'Friend';
      const email = document.getElementById('form-email')?.value;

      if (!email) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Request...';
        submitBtn.style.opacity = '0.7';
      }

      setTimeout(() => {
        if (statusMsg) {
          statusMsg.innerHTML = `✓ <strong>Thank you, ${name}!</strong> Your proposal request has been submitted successfully. The BitDev Studio team will contact you at <u>${email}</u> within 24 hours.`;
          statusMsg.style.display = 'block';
        }

        contactForm.reset();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Proposal Request Sent!';
          submitBtn.style.opacity = '1';

          setTimeout(() => {
            submitBtn.textContent = 'Send Proposal Request';
          }, 5000);
        }
      }, 800);
    });
  }

  // ── 12. Ask BitDev AI Chatbot Logic ──
  const chatTrigger = document.getElementById('bitdev-chat-trigger');
  const chatWindow = document.getElementById('bitdev-chat-window');
  const chatClose = document.getElementById('bitdev-chat-close');
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-input-form');
  const chatInput = document.getElementById('chat-user-input');
  const faqChips = document.querySelectorAll('.faq-chip');

  if (chatTrigger && chatWindow) {
    const toggleChat = () => {
      chatWindow.classList.toggle('chat-window-hidden');
      if (!chatWindow.classList.contains('chat-window-hidden') && chatInput) {
        chatInput.focus();
      }
    };

    chatTrigger.addEventListener('click', toggleChat);
    if (chatClose) chatClose.addEventListener('click', toggleChat);

    const appendMessage = (sender, text) => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-msg ${sender}-msg`;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      msgDiv.innerHTML = `
        <div class="chat-bubble">${text}</div>
        <span class="chat-timestamp">${timeStr}</span>
      `;

      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const generateBotResponse = (userText) => {
      const text = userText.toLowerCase();
      let response = "";

      if (text.includes("inspiration") || text.includes("design") || text.includes("figma") || text.includes("dribbble") || text.includes("clone") || text.includes("custom website") || text.includes("like this")) {
        response = "Yes! Absolutely 🚀 At <strong>The BitDev Studio</strong>, we specialize in 100% custom web engineering from any design inspiration (Figma, Dribbble, live reference sites, or PDF brand guidelines). We turn any design concept into a sub-second loading, pixel-perfect digital experience!";
      } else if (text.includes("service") || text.includes("offer") || text.includes("do you do")) {
        response = "We provide full-suite digital solutions including:<br>• 🌐 <strong>Bespoke Web Engineering</strong> (Custom HTML/JS, Next.js, WebGL 3D)<br>• 🎨 <strong>Visual Identity & Brand Systems</strong> (Logos, Style Guides)<br>• 🛒 <strong>E-Commerce Platforms</strong> (Custom Storefronts, Payment Gateways)<br>• ⚡ <strong>Speed & SEO Optimization</strong><br>• 📱 <strong>Mobile App & UI/UX Design</strong>";
      } else if (text.includes("price") || text.includes("cost") || text.includes("pricing") || text.includes("how much") || text.includes("package") || text.includes("time") || text.includes("timeline") || text.includes("turnaround")) {
        response = "Our packages start from <strong>$499/mo</strong> for retainer support, <strong>$799</strong> for Visual Identity Systems, <strong>$999</strong> for Bespoke Web Development, up to <strong>$1,499</strong> for Full Brand & Web Experiences. Most custom website projects are completed in <strong>1 to 3 weeks</strong> with 24/7 dedicated support!";
      } else if (text.includes("ecommerce") || text.includes("e-commerce") || text.includes("shop") || text.includes("store") || text.includes("app")) {
        response = "Yes! We build high-converting custom E-Commerce storefronts with seamless checkout integrations, inventory management, and mobile app UI/UX experiences tailored for maximum sales volume.";
      } else if (text.includes("meeting") || text.includes("book") || text.includes("call") || text.includes("contact") || text.includes("hire") || text.includes("talk")) {
        response = "You can book a consultation meeting or request a proposal directly using the <strong>Get Proposal</strong> button on our site, or leave your name & email here and I will instantly forward your request to our team!";
      } else if (text.includes("@") || text.includes("email") || text.includes("phone") || text.includes("number")) {
        response = "Thank you! I have recorded your details and forwarded your message directly to senior director <strong>Hamza Latif</strong> and the team at <strong>The BitDev Studio</strong>. We will reach out to you within 24 hours! 🚀";
      } else {
        response = "Thank you for reaching out! I've noted your question: <em>\"" + userText + "\"</em>.<br><br>I've forwarded your inquiry directly to our senior team at <strong>The BitDev Studio</strong>. If you'd like a direct callback, please share your <strong>Email or WhatsApp number</strong> below!";
      }

      setTimeout(() => {
        appendMessage('bot', response);
      }, 500);
    };

    faqChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const question = chip.getAttribute('data-question');
        appendMessage('user', question);
        generateBotResponse(question);
      });
    });

    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage('user', text);
        chatInput.value = '';
        generateBotResponse(text);
      });
    }
  }
});
