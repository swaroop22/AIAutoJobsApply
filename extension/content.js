// RolePilot — AI Job Application Content Script
// Injected into job application pages (Workday, Greenhouse, Lever, Ashby, Taleo, iCIMS, etc.)

function setNativeValue(element, value) {
  if (!element || value === undefined || value === null) return;
  const proto = Object.getPrototypeOf(element);
  const set =
    Object.getOwnPropertyDescriptor(proto, 'value')?.set ||
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set ||
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  if (set) {
    set.call(element, value);
  } else {
    element.value = value;
  }
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

function findInput(selectors, regexPatterns = []) {
  // 1. Try exact CSS selectors first
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // ignore
    }
  }

  // 2. Try regex heuristics across input attributes and labels
  const inputs = Array.from(
    document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea')
  );

  for (const pattern of regexPatterns) {
    for (const input of inputs) {
      const id = (input.id || '').toLowerCase();
      const name = (input.name || '').toLowerCase();
      const placeholder = (input.placeholder || '').toLowerCase();
      const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
      const testId = (input.getAttribute('data-automation-id') || input.getAttribute('data-testid') || '').toLowerCase();
      const labelText = input.labels?.[0]?.textContent?.toLowerCase() || '';

      if (
        pattern.test(id) ||
        pattern.test(name) ||
        pattern.test(placeholder) ||
        pattern.test(ariaLabel) ||
        pattern.test(testId) ||
        pattern.test(labelText)
      ) {
        return input;
      }
    }
  }
  return null;
}

function getStoredProfile() {
  try {
    const raw = localStorage.getItem('rolepilot_autofill_profile');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return null;
}

function autofillApplication(customProfile) {
  const profile = customProfile || getStoredProfile() || {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '(555) 234-5678',
    workAuthorized: true,
  };

  let filledCount = 0;
  const names = (profile.fullName || '').trim().split(/\s+/);
  const firstName = names[0] || '';
  const lastName = names.slice(1).join(' ') || '';

  // 1. First Name (Workday, Greenhouse, Taleo)
  const firstInput = findInput(
    [
      '[data-automation-id="legalNameSection_firstName"]',
      '#first_name',
      'input[name="first_name"]',
      'input[name*="firstName"]',
    ],
    [/first.*name/i, /given.*name/i, /^fname$/i]
  );
  if (firstInput && firstName) {
    setNativeValue(firstInput, firstName);
    filledCount++;
  }

  // 2. Last Name (Workday, Greenhouse, Taleo)
  const lastInput = findInput(
    [
      '[data-automation-id="legalNameSection_lastName"]',
      '#last_name',
      'input[name="last_name"]',
      'input[name*="lastName"]',
    ],
    [/last.*name/i, /family.*name/i, /surname/i, /^lname$/i]
  );
  if (lastInput && lastName) {
    setNativeValue(lastInput, lastName);
    filledCount++;
  }

  // Single Full Name (Lever)
  if (!firstInput && !lastInput) {
    const fullInput = findInput(
      ['input[name="name"]', '#name'],
      [/full.*name/i, /^name$/i]
    );
    if (fullInput && profile.fullName) {
      setNativeValue(fullInput, profile.fullName);
      filledCount++;
    }
  }

  // 3. Email Address
  const emailInput = findInput(
    [
      '[data-automation-id="email"]',
      '#email',
      'input[type="email"]',
      'input[name="email"]',
    ],
    [/email/i]
  );
  if (emailInput && profile.email) {
    setNativeValue(emailInput, profile.email);
    filledCount++;
  }

  // 4. Phone Number
  const phoneInput = findInput(
    [
      '[data-automation-id="phone-number"]',
      '#phone',
      'input[type="tel"]',
      'input[name="phone"]',
    ],
    [/phone/i, /mobile/i, /tel/i]
  );
  if (phoneInput && profile.phone) {
    setNativeValue(phoneInput, profile.phone);
    filledCount++;
  }

  // 5. Postal Code / City (Workday)
  const zipInput = findInput(
    ['[data-automation-id="addressSection_postalCode"]', '#postal_code', 'input[name*="zip"]'],
    [/postal/i, /zip/i]
  );
  if (zipInput && profile.postalCode) {
    setNativeValue(zipInput, profile.postalCode);
    filledCount++;
  }

  // 6. Work Authorization (Yes to authorized, No to sponsorship needed)
  const allInputsAndOptions = Array.from(document.querySelectorAll('input[type="radio"], option, button[role="radio"]'));
  for (const el of allInputsAndOptions) {
    const text = (el.textContent || el.parentElement?.textContent || el.value || '').toLowerCase();

    // Are you legally authorized to work in the United States? -> YES
    if (/authorized to work/i.test(text) || /legally authorized/i.test(text)) {
      if (/yes/i.test(text) && !/not/i.test(text)) {
        if (el.tagName === 'OPTION') {
          const select = el.closest('select');
          if (select) {
            select.value = el.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
          }
        } else {
          el.checked = true;
          el.click();
          filledCount++;
        }
      }
    }

    // Will you now or in the future require visa sponsorship? -> NO
    if (/require.*sponsorship/i.test(text) || /need.*sponsorship/i.test(text) || /visa sponsorship/i.test(text)) {
      if (/no/i.test(text) && !/yes/i.test(text)) {
        if (el.tagName === 'OPTION') {
          const select = el.closest('select');
          if (select) {
            select.value = el.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
          }
        } else {
          el.checked = true;
          el.click();
          filledCount++;
        }
      }
    }
  }

  showFeedbackToast(`RolePilot: Autofilled ${filledCount} application fields on this portal!`);
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
    padding: 14px 22px;
    border-radius: 14px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    font-weight: 700;
    box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.35);
    z-index: 99999999;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(255, 255, 255, 0.15);
  `;
  toast.innerHTML = `<span style="color:#fbbf24;font-size:16px;">⚡</span> ${text}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Inject Floating Quick Action Button on career pages
function injectFloatingButton() {
  if (document.getElementById('rolepilot-floating-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'rolepilot-floating-btn';
  btn.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #0f172a;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 10px 18px;
    border-radius: 9999px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 12px;
    font-weight: 800;
    box-shadow: 0 10px 25px -4px rgba(0, 0, 0, 0.4);
    z-index: 9999999;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.15s ease, background 0.15s ease;
  `;
  btn.innerHTML = `<span style="color:#fbbf24;">⚡</span> Autofill with RolePilot`;

  btn.onmouseenter = () => {
    btn.style.transform = 'scale(1.05)';
    btn.style.background = '#1e293b';
  };
  btn.onmouseleave = () => {
    btn.style.transform = 'scale(1)';
    btn.style.background = '#0f172a';
  };
  btn.onclick = () => {
    autofillApplication();
  };

  document.body.appendChild(btn);
}

// Auto-inject floating helper on career portals
if (
  window.location.hostname.includes('workday') ||
  window.location.hostname.includes('greenhouse.io') ||
  window.location.hostname.includes('lever.co') ||
  window.location.hostname.includes('taleo') ||
  window.location.hostname.includes('icims') ||
  window.location.pathname.includes('/job') ||
  window.location.pathname.includes('/career') ||
  window.location.pathname.includes('/apply')
) {
  setTimeout(injectFloatingButton, 800);
}

// Listen for messages from RolePilot popup or bookmarklet
chrome.runtime.onMessage?.addListener((request, sender, sendResponse) => {
  if (request.action === 'AUTOFILL') {
    const res = autofillApplication(request.profile);
    sendResponse(res);
  }
});

window.RolePilotAutofill = autofillApplication;
