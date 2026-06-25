// StudyAbroad Network - Frontend JavaScript

(function() {
  'use strict';

  // ============ Form submission handler ============
  function handleSubmit(form, endpoint, resultId) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const resultDiv = document.getElementById(resultId);
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;

      // Show loading
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Processing...';
      resultDiv.classList.add('hidden');

      // Gather form data
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => { data[key] = value; });

      // Special handling for community post channel
      const channel = form.getAttribute('data-channel');
      if (channel) data.channelId = channel;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();

        resultDiv.classList.remove('hidden');
        if (result.success) {
          resultDiv.className = 'p-4 rounded-lg alert-success';
          resultDiv.innerHTML = '<i class="fas fa-check-circle mr-2"></i>' + (result.message || 'Success!');
          form.reset();

          // Special handling for buddy matches
          if (result.matches && result.matches.length > 0) {
            displayBuddyMatches(result.matches);
          }
          // Special handling for waitlist position
          if (result.position) {
            resultDiv.innerHTML += `<div class="mt-2 text-sm">Your referral code: <strong>${result.referralCode}</strong> — Share it to move up!</div>`;
          }
        } else {
          resultDiv.className = 'p-4 rounded-lg alert-error';
          resultDiv.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>' + (result.error || result.message || 'Something went wrong.');
        }
      } catch (err) {
        resultDiv.classList.remove('hidden');
        resultDiv.className = 'p-4 rounded-lg alert-error';
        resultDiv.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>Network error. Please try again.';
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    });
  }

  // Map data-form attributes to endpoints and result divs
  const formMap = {
    'register': { endpoint: '/api/register', result: 'register-result' },
    'waitlist': { endpoint: '/api/waitlist', result: 'waitlist-result' },
    'partner': { endpoint: '/api/partner', result: 'partner-result' },
    'contact': { endpoint: '/api/contact', result: 'contact-result' },
    'buddy': { endpoint: '/api/buddy', result: 'buddy-result' },
    'login': { endpoint: '/api/register', result: 'login-result' },
    'community-post': { endpoint: '/api/community/post', result: 'post-result' },
  };

  document.querySelectorAll('[data-form]').forEach(form => {
    const formType = form.getAttribute('data-form');
    const config = formMap[formType];
    if (config) {
      handleSubmit(form, config.endpoint, config.result);
    }
  });

  // ============ Display buddy matches ============
  function displayBuddyMatches(matches) {
    const container = document.getElementById('buddy-matches');
    if (!container) return;
    container.innerHTML = '<h2 class="text-2xl font-bold text-slate-800 mb-4 mt-8">Your Matches</h2>';
    const grid = document.createElement('div');
    grid.className = 'grid sm:grid-cols-2 gap-4';
    matches.forEach(m => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl shadow-sm p-5';
      card.innerHTML = `
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">${m.userName.charAt(0).toUpperCase()}</div>
          <div>
            <div class="font-bold text-slate-800">${m.userName}</div>
            <div class="text-xs text-slate-500">${m.destination} • ${m.field || 'Various'}</div>
          </div>
        </div>
        ${m.bio ? `<p class="text-sm text-slate-600 mb-2">${m.bio}</p>` : ''}
        <div class="text-xs text-slate-400">
          <span>Level: ${m.level || 'Any'}</span> • <span>Start: ${m.startTerm || 'TBD'}</span>
        </div>
      `;
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  // ============ Upvote handler ============
  document.querySelectorAll('[data-upvote]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const postId = btn.getAttribute('data-upvote');
      const voterEmail = localStorage.getItem('userEmail') || 'anonymous@studyabroad.network';
      try {
        const res = await fetch('/api/community/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, voterEmail, value: 1 })
        });
        const result = await res.json();
        if (result.success) {
          const countSpan = btn.querySelector('span') || btn;
          const current = parseInt(btn.textContent.trim()) || 0;
          btn.innerHTML = `<i class="fas fa-arrow-up mr-1"></i>${current + 1}`;
          btn.classList.add('text-emerald-600');
        }
      } catch (err) {
        console.error('Vote failed:', err);
      }
    });
  });

  // ============ Page view analytics ============
  function trackPageView() {
    const page = window.location.pathname;
    const sessionId = sessionStorage.getItem('sessionId') || generateSessionId();
    sessionStorage.setItem('sessionId', sessionId);

    // Fire and forget analytics
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'page_view', sessionId, page })
    }).catch(() => {});
  }

  function generateSessionId() {
    return 'sess-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  // Track page view on load
  trackPageView();

  // ============ Search functionality ============
  const searchInputs = document.querySelectorAll('input[name="q"][placeholder*="Search"]');
  searchInputs.forEach(input => {
    let timeout;
    input.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const q = e.target.value.trim();
        if (q.length < 2) return;
        // Could implement live search dropdown here
      }, 300);
    });
  });

  // ============ Affiliate link tracking ============
  document.querySelectorAll('[data-affiliate]').forEach(link => {
    link.addEventListener('click', async () => {
      const partner = link.getAttribute('data-affiliate');
      const url = link.href;
      const registrationId = localStorage.getItem('registrationId');
      fetch('/api/affiliate/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partner, url, registrationId })
      }).catch(() => {});
    });
  });

})();
