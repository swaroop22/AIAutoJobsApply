(function() {
  function setNativeValue(element, value) {
    if (!element || !value) return;
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

  // Retrieve stored profile from localStorage or prompt
  let profile = null;
  try {
    profile = JSON.parse(localStorage.getItem('rolepilot_autofill_profile') || 'null');
  } catch (e) {}

  if (!profile) {
    const name = prompt('RolePilot Autofill: Enter your Full Name:');
    const email = prompt('RolePilot Autofill: Enter your Email:');
    const phone = prompt('RolePilot Autofill: Enter your Phone Number:');
    profile = { fullName: name, email, phone };
    try {
      localStorage.setItem('rolepilot_autofill_profile', JSON.stringify(profile));
    } catch (e) {}
  }

  let filled = 0;
  const names = (profile.fullName || '').trim().split(/\s+/);
  const firstName = names[0] || '';
  const lastName = names.slice(1).join(' ') || '';

  const fInput = findInputByPatterns([/first.*name/i, /given.*name/i, /^fname$/i]);
  if (fInput && firstName) { setNativeValue(fInput, firstName); filled++; }

  const lInput = findInputByPatterns([/last.*name/i, /family.*name/i, /surname/i, /^lname$/i]);
  if (lInput && lastName) { setNativeValue(lInput, lastName); filled++; }

  if (!fInput && !lInput) {
    const fullInput = findInputByPatterns([/full.*name/i, /^name$/i]);
    if (fullInput && profile.fullName) { setNativeValue(fullInput, profile.fullName); filled++; }
  }

  const eInput = findInputByPatterns([/email/i]);
  if (eInput && profile.email) { setNativeValue(eInput, profile.email); filled++; }

  const pInput = findInputByPatterns([/phone/i, /mobile/i, /tel/i]);
  if (pInput && profile.phone) { setNativeValue(pInput, profile.phone); filled++; }

  alert('⚡ RolePilot: Autofilled ' + filled + ' application fields!');
})();
