/**
 * Chhaya Photo Studio — Unified Frontend Client Engine
 * Connects all pages (Home, Services, Pricing, Contact) seamlessly to the Express Backend.
 * Handles Bookings Modal, Contact Form, Newsletter, and Navigation state.
 */

(function () {
  'use strict';

  // 1. Resolve API Base dynamically
  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isHttp = window.location.protocol.startsWith('http');
  const API_BASE = window.CHHAYA_API_BASE || (isHttp && (window.location.port === '3001' || !isLocalHost) ? '' : 'http://localhost:3001');

  window.CHHAYA_API_BASE = API_BASE;

  // 2. DOM Ready Initializer
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initBookingModal();
    initContactForm();
    initNewsletterForms();
  });

  // 3. Navigation Links Normalization & Active State
  function initNavigation() {
    // Replace broken 'dashboard.html' links with 'index.html'
    document.querySelectorAll('a[href*="dashboard.html"]').forEach((link) => {
      link.setAttribute('href', link.getAttribute('href').replace('dashboard.html', 'index.html'));
    });

    // Update active nav styling
    const path = window.location.pathname.toLowerCase();
    const currentFile = path.split('/').pop() || 'index.html';
    const activePage = currentFile === '' ? 'index.html' : currentFile;

    document.querySelectorAll('[data-site-nav-links] a').forEach((link) => {
      const href = (link.getAttribute('href') || '').toLowerCase().split('/').pop();
      const isMatch = href === activePage || (activePage === 'index.html' && (href === 'index.html' || href === ''));

      if (isMatch) {
        link.classList.remove('text-stone-600', 'text-slate-300', 'border-transparent');
        link.classList.add('text-[#D4AF37]', 'border-b', 'border-[#D4AF37]/40', 'pb-1');
      }
    });
  }

  // 4. Universal Booking Modal
  function initBookingModal() {
    // Check if modal already exists in DOM; if not, inject it
    let modal = document.querySelector('[data-booking-modal]');
    if (!modal) {
      modal = document.createElement('div');
      modal.setAttribute('data-booking-modal', '');
      modal.className = 'fixed inset-0 z-[120] hidden items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity duration-300';
      modal.innerHTML = `
        <div class="w-full max-w-xl bg-[#111111] text-white border border-[#D4AF37]/30 rounded-2xl shadow-2xl p-6 sm:p-10 relative max-h-[92vh] overflow-y-auto">
          <button aria-label="Close booking form" class="absolute right-5 top-5 text-gray-400 hover:text-white text-xl transition-colors" data-booking-close="" type="button">
            ✕
          </button>
          <div class="mb-6">
            <span class="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.25em] block mb-1">Chhaya Photo Studio</span>
            <h2 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">Book a Photography Session</h2>
            <p class="text-gray-400 text-sm mt-1">Reserve your date for weddings, portraits, or commercial shoots.</p>
          </div>
          <form class="space-y-5" data-booking-form="">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">Full Name *</label>
                <input class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition" name="name" placeholder="Your name" required="" type="text"/>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">Email Address *</label>
                <input class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition" name="email" placeholder="name@domain.com" required="" type="email"/>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">Phone / WhatsApp</label>
                <input class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition" name="phone" placeholder="+91 98765 43210" type="tel"/>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">Preferred Date *</label>
                <input class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition" name="date" required="" type="date"/>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">Service Type *</label>
              <select class="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition" name="serviceType" required="">
                <option disabled="" selected="" value="">Select a service</option>
                <option value="Portrait Session">Portrait Session</option>
                <option value="Wedding Coverage">Wedding Coverage</option>
                <option value="Commercial Shoot">Commercial Shoot</option>
                <option value="Pre-Wedding Experience">Pre-Wedding Experience</option>
                <option value="General Inquiry">General Photography</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">Notes / Shoot Details</label>
              <textarea class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition resize-none" name="message" placeholder="Tell us about location, theme, or requirements..." rows="3"></textarea>
            </div>
            <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p class="text-xs text-gray-400" data-booking-status=""></p>
              <button class="w-full sm:w-auto rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B5952F] hover:brightness-110 active:scale-95 px-8 py-3 font-semibold text-[#111111] shadow-lg shadow-[#D4AF37]/20 transition flex items-center justify-center gap-2" data-booking-submit="" type="submit">
                <span>Confirm Booking</span>
              </button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const openButtons = document.querySelectorAll('[data-book-session-trigger]');
    const closeButton = modal.querySelector('[data-booking-close]');
    const form = modal.querySelector('[data-booking-form]');
    const statusEl = modal.querySelector('[data-booking-status]');
    const submitButton = modal.querySelector('[data-booking-submit]');

    const openModal = () => {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
      if (statusEl) statusEl.textContent = '';
    };

    openButtons.forEach((btn) => {
      btn.removeEventListener('click', openModal);
      btn.addEventListener('click', openModal);
    });

    if (closeButton) {
      closeButton.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (statusEl) {
          statusEl.textContent = 'Sending booking request...';
          statusEl.className = 'text-xs text-[#D4AF37]';
        }
        if (submitButton) submitButton.disabled = true;

        const formData = new FormData(form);
        const payload = {
          name: String(formData.get('name') || '').trim(),
          email: String(formData.get('email') || '').trim(),
          phone: String(formData.get('phone') || '').trim(),
          date: String(formData.get('date') || '').trim(),
          serviceType: String(formData.get('serviceType') || '').trim(),
          message: String(formData.get('message') || '').trim(),
        };

        try {
          const res = await fetch(`${API_BASE}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Failed to submit booking.');
          }

          form.reset();
          if (statusEl) {
            statusEl.textContent = 'Booking received! We will contact you shortly.';
            statusEl.className = 'text-xs text-green-400 font-medium';
          }
          showToast('Booking request received successfully!');
          setTimeout(closeModal, 1800);
        } catch (err) {
          if (statusEl) {
            statusEl.textContent = err.message || 'Error occurred. Please try again.';
            statusEl.className = 'text-xs text-red-400 font-medium';
          }
        } finally {
          if (submitButton) submitButton.disabled = false;
        }
      });
    }
  }

  // 5. Contact Form Handler (on contact.html)
  function initContactForm() {
    const form = document.querySelector('[data-contact-form]');
    const statusEl = document.querySelector('[data-contact-status]');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (statusEl) {
        statusEl.textContent = 'Sending your inquiry...';
        statusEl.className = 'text-sm text-[#D4AF37]';
      }

      const formData = new FormData(form);
      const payload = {
        name: String(formData.get('name') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        subject: String(formData.get('service') || formData.get('subject') || 'General Inquiry').trim(),
        message: String(formData.get('message') || '').trim(),
      };

      try {
        const res = await fetch(`${API_BASE}/api/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to send inquiry.');
        }

        form.reset();
        if (statusEl) {
          statusEl.textContent = 'Inquiry sent successfully! We will get back to you soon.';
          statusEl.className = 'text-sm text-green-400 font-medium';
        }
        showToast('Inquiry received. Thank you for reaching out!');
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = err.message || 'Failed to send inquiry. Please try again.';
          statusEl.className = 'text-sm text-red-400 font-medium';
        }
      }
    });
  }

  // 6. Universal Newsletter Form Handler
  function initNewsletterForms() {
    document.querySelectorAll('[data-newsletter-form]').forEach((form) => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const email = String(input ? input.value : '').trim();
        const statusEl = form.querySelector('[data-newsletter-status]');

        if (!email) return;

        if (statusEl) {
          statusEl.textContent = 'Subscribing...';
          statusEl.className = 'text-xs text-[#D4AF37]';
        }

        try {
          const res = await fetch(`${API_BASE}/api/newsletter`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();

          if (!res.ok) throw new Error(data.error || 'Subscription failed.');

          if (input) input.value = '';
          const msg = data.message || 'Subscribed successfully!';
          if (statusEl) {
            statusEl.textContent = msg;
            statusEl.className = 'text-xs text-green-400';
          }
          showToast(msg);
        } catch (err) {
          if (statusEl) {
            statusEl.textContent = err.message;
            statusEl.className = 'text-xs text-red-400';
          }
        }
      });
    });
  }

  // 7. Toast Notification Helper
  function showToast(message) {
    let toast = document.getElementById('chhaya-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'chhaya-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: #111111;
        border: 1px solid #D4AF37;
        color: #FFFFFF;
        padding: 12px 24px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 500;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<span style="color: #D4AF37;">✓</span> ${message}`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, 3500);
  }
})();
