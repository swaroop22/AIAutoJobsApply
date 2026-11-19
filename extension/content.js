// RolePilot — AI Job Application Content Script
// Injected into job application pages (Greenhouse, Lever, Workday, Ashby, Taleo, etc.)

function setNativeValue(element, value) {
  if (!element) return;
  const proto = Object.getPrototypeOf(element);
  const set = Object.getOwnPropertyDescriptor(proto, 'value')?.set ||
              Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  if (set) {
    set.call(element, value);
  } else {
    element.value = value;
  }
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

function findInputByPatterns(patterns) {
  const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea'));
  for (const pattern of patterns) {
    for (const input of inputs) {
      const id = (input.id || '').toLowerCase();
      const name = (input.name || '').toLowerCase();
      const placeholder = (input.placeholder || '').toLowerCase();
      const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
      const labelText = input.labels?.[0]?.textContent?.toLowerCase() || '';

      if (
        pattern.test(id) ||
        pattern.test(name) ||
        pattern.test(placeholder) ||
        pattern.test(ariaLabel) ||
        pattern.test(labelText)
      ) {
        return input;
      }
    }
  }
  return null;
}

function autofillApplication(profile) {
  if (!profile) return { success: false, message: 'No profile found' };

  let filledCount = 0;

  const names = (profile.fullName || '').trim().split(/\s+/);
  const firstName = names[0] || '';
  const lastName = names.slice(1).join(' ') || '';

  // 1. First Name
  const firstInput = findInputByPatterns([/first.*name/i, /given.*name/i, /^fname$/i]);
  if (firstInput && firstName) {
    setNativeValue(firstInput, firstName);
    filledCount++;
  }

  // 2. Last Name
  const lastInput = findInputByPatterns([/last.*name/i, /family.*name/i, /surname/i, /^lname$/i]);
  if (lastInput && lastName) {
    setNativeValue(lastInput, lastName);
    filledCount++;
  }

  // Single Full Name input (e.g. Lever)
  if (!firstInput && !lastInput) {
    const fullInput = findInputByPatterns([/full.*name/i, /^name$/i]);
    if (fullInput && profile.fullName) {
      setNativeValue(fullInput, profile.fullName);
      filledCount++;
    }
  }

  // 3. Email
  const emailInput = findInputByPatterns([/email/i]);
  if (emailInput && profile.email) {
    setNativeValue(emailInput, profile.email);
    filledCount++;
  }

  // 4. Phone
  const phoneInput = findInputByPatterns([/phone/i, /mobile/i, /tel/i]);
  if (phoneInput && profile.phone) {
    setNativeValue(phoneInput, profile.phone);
    filledCount++;
  }

  // 5. LinkedIn / Website
  if (profile.linkedin) {
    const linkedinInput = findInputByPatterns([/linkedin/i]);
    if (linkedinInput) {
      setNativeValue(linkedinInput, profile.linkedin);
      filledCount++;
    }
  }

  // 6. Work Authorization (Yes to authorized, No to sponsorship)
  const allRadiosAndOptions = Array.from(document.querySelectorAll('input[type="radio"], option'));
  for (const el of allRadiosAndOptions) {
    const text = (el.textContent || el.parentElement?.textContent || el.value || '').toLowerCase();
    if (
      /authorized to work/i.test(text) &&
      /yes/i.test(text) &&
      !/not authorized/i.test(text)
    ) {
      if (el.tagName === 'OPTION') {
        const select = el.closest('select');
        if (select) {
          select.value = el.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          filledCount++;
        }
      } else {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
      }
    }
  }

  // Show visual feedback toast on the page
  showFeedbackToast(`RolePilot: Autofilled ${filledCount} application fields!`);
  return { success: true, count: filledCount };
}

function showFeedbackToast(text) {
  const existing = document.getElementById('rolepilot-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'rolepilot-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #15362b;
    color: #ffffff;
    padding: 12px 20px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    z-index: 9999999;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: rpFadeIn 0.2s ease-out;
  `;
  toast.innerHTML = `<span style="color:#fbbf24;">⚡</span> ${text}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Listen for messages from RolePilot popup or bookmarklet
chrome.runtime.onMessage?.addListener((request, sender, sendResponse) => {
  if (request.action === 'AUTOFILL') {
    const res = autofillApplication(request.profile);
    sendResponse(res);
  }
});

// Also expose on window for bookmarklet execution
window.RolePilotAutofill = autofillApplication;
