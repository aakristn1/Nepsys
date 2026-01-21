/**
 * Nepsys Technologies - Main JavaScript
 * Handles all interactive functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initNavbar();
  initScrollToTop();
  initFAQAccordion();
  initFAQFilters();
  initForms();
  initSmoothScroll();
  initServicePreSelection();
});

/**
 * Navbar functionality
 * - Scroll shadow effect
 * - Mobile menu toggle
 */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navbarToggle = document.getElementById('navbarToggle');
  const navbarNav = document.getElementById('navbarNav');

  // Add shadow on scroll
  if (navbar) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Mobile menu toggle
  if (navbarToggle && navbarNav) {
    navbarToggle.addEventListener('click', function() {
      navbarNav.classList.toggle('open');

      // Animate hamburger icon
      const spans = navbarToggle.querySelectorAll('span');
      if (navbarNav.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close menu when clicking a link
    const navLinks = navbarNav.querySelectorAll('.navbar-link');
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        navbarNav.classList.remove('open');
        const spans = navbarToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }
}

/**
 * Scroll to top button
 */
function initScrollToTop() {
  const scrollTopBtn = document.getElementById('scrollTop');

  if (scrollTopBtn) {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
      if (window.scrollY > 500) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });

    // Scroll to top on click
    scrollTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/**
 * FAQ Accordion functionality
 */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function(item) {
    const question = item.querySelector('.faq-question');

    if (question) {
      question.addEventListener('click', function() {
        // Close other open items (optional - for single open item behavior)
        const currentlyOpen = document.querySelector('.faq-item.open');
        if (currentlyOpen && currentlyOpen !== item) {
          currentlyOpen.classList.remove('open');
        }

        // Toggle current item
        item.classList.toggle('open');
      });
    }
  });
}

/**
 * FAQ Category filters
 */
function initFAQFilters() {
  const filterBtns = document.querySelectorAll('.faq-category-btn');
  const faqItems = document.querySelectorAll('.faq-item');

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const category = btn.getAttribute('data-category');

      // Update active button
      filterBtns.forEach(function(b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      // Filter FAQ items
      faqItems.forEach(function(item) {
        const itemCategory = item.getAttribute('data-category');

        if (category === 'all' || itemCategory === category) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/**
 * Form handling
 */
function initForms() {
  // Booking form
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBookingFormSubmit);
  }

  // Website quote form
  const websiteQuoteForm = document.getElementById('websiteQuoteForm');
  if (websiteQuoteForm) {
    websiteQuoteForm.addEventListener('submit', handleWebsiteQuoteFormSubmit);
  }
}

/**
 * Handle booking form submission
 */
function handleBookingFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Log form data (for development)
  console.log('Booking form submitted:', data);

  // Show confirmation
  showConfirmation(form);

  // Here you would typically send the data to your backend/API
  // Example:
  // sendFormData('/api/book', data);
}

/**
 * Handle website quote form submission
 */
function handleWebsiteQuoteFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Log form data (for development)
  console.log('Website quote form submitted:', data);

  // Show confirmation message
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  submitBtn.textContent = 'Request Sent!';
  submitBtn.disabled = true;
  submitBtn.style.background = '#10b981';

  // Reset form
  setTimeout(function() {
    form.reset();
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    submitBtn.style.background = '';
  }, 3000);

  // Here you would typically send the data to your backend/API
  // Example:
  // sendFormData('/api/quote', data);
}

/**
 * Show confirmation modal/message
 */
function showConfirmation(form) {
  const modal = document.getElementById('confirmationModal');

  if (modal) {
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';

    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.style.background = 'white';
      modalContent.style.padding = '48px';
      modalContent.style.borderRadius = '16px';
      modalContent.style.maxWidth = '500px';
      modalContent.style.textAlign = 'center';
    }
  } else {
    // Fallback: Update the form to show confirmation
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Request Sent!';
    submitBtn.disabled = true;
    submitBtn.style.background = '#10b981';

    // Show an alert as fallback
    alert('Thanks! We\'ve received your request. We\'ll be in touch within 24 hours.');

    // Reset form
    form.reset();

    setTimeout(function() {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      submitBtn.style.background = '';
    }, 3000);
  }
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      const href = link.getAttribute('href');

      if (href === '#') return;

      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();

        const navbarHeight = 72; // Fixed navbar height
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Pre-select service from URL parameters
 */
function initServicePreSelection() {
  const urlParams = new URLSearchParams(window.location.search);

  // Pre-select service type
  const serviceParam = urlParams.get('service');
  if (serviceParam) {
    const serviceSelect = document.getElementById('serviceType');
    if (serviceSelect) {
      serviceSelect.value = serviceParam;
    }
  }

  // Check if it's an assessment request
  const assessmentParam = urlParams.get('assessment');
  if (assessmentParam === 'true') {
    const freeConsultation = document.querySelector('input[name="freeConsultation"]');
    if (freeConsultation) {
      freeConsultation.checked = true;
    }
  }

  // Check if it's a waitlist request
  const waitlistParam = urlParams.get('waitlist');
  if (waitlistParam === 'true') {
    // Could add special handling for waitlist requests
    console.log('Waitlist request for:', serviceParam);
  }
}

/**
 * Utility: Send form data to API
 * This is a placeholder for your actual API integration
 */
function sendFormData(endpoint, data) {
  // This would be replaced with your actual API call
  // For example, using fetch or a form submission service

  /*
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(result => {
    console.log('Success:', result);
  })
  .catch(error => {
    console.error('Error:', error);
  });
  */

  console.log('Would send to', endpoint, ':', data);
}

/**
 * Utility: Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Utility: Validate Australian phone number
 */
function isValidAustralianPhone(phone) {
  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');
  // Check for valid Australian mobile or landline
  const mobileRegex = /^(04|\+614)\d{8}$/;
  const landlineRegex = /^(0[2378]|\+61[2378])\d{8}$/;
  return mobileRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);
}

/**
 * Add animation on scroll (optional enhancement)
 */
function initScrollAnimations() {
  const animateElements = document.querySelectorAll('.problem-card, .service-card, .pricing-card, .testimonial-card, .value-card, .team-card');

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animateElements.forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// Uncomment to enable scroll animations
// initScrollAnimations();
