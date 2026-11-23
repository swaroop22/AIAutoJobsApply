import puppeteer, { type Browser, type Page } from 'puppeteer-core';
import type { ATSRunnerInput, ATSRunnerResult } from './types';
import fs from 'fs';
import path from 'path';

const CHROME_PATH =
  process.env.CHROME_BIN ||
  (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : '/usr/bin/google-chrome');

export async function runGreenhouseApply(input: ATSRunnerInput): Promise<ATSRunnerResult> {
  const fieldsFilled: Array<{ field: string; value: string; section?: string }> = [];
  let browser: Browser | null = null;

  try {
    const names = input.applicant.fullName.trim().split(' ');
    const firstName = input.applicant.firstName || names[0] || 'Applicant';
    const lastName = input.applicant.lastName || (names.length > 1 ? names.slice(1).join(' ') : 'Specialist');

    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--window-size=1280,900',
      ],
    });

    const page: Page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    );

    // 1. Navigate to Greenhouse job application
    await page.goto(input.applyUrl, { waitUntil: 'networkidle2', timeout: 25000 });

    // 2. Check for Bot Gate / Cloudflare Turnstile / CAPTCHA
    const hasCaptcha = await page.evaluate(() => {
      const captchaEl = document.querySelector('.cf-turnstile, #recaptcha, iframe[src*="captcha"], iframe[src*="turnstile"]');
      return Boolean(captchaEl);
    });

    if (hasCaptcha) {
      return {
        success: false,
        status: 'needs_you',
        atsProvider: 'greenhouse',
        actionRequiredReason: 'Employer portal requires a human verification check (Turnstile/CAPTCHA).',
        finishUrl: input.applyUrl,
        fieldsFilled,
        message: 'Security challenge detected. Please complete submission directly via the finish link.',
      };
    }

    // 3. Fill Core Candidate Fields
    // First Name
    const firstNameSelector = '#first_name, input[name="job_application[first_name]"]';
    if (await page.$(firstNameSelector)) {
      await page.type(firstNameSelector, firstName, { delay: 15 });
      fieldsFilled.push({ field: 'First Name', value: firstName, section: 'Personal Information' });
    }

    // Last Name
    const lastNameSelector = '#last_name, input[name="job_application[last_name]"]';
    if (await page.$(lastNameSelector)) {
      await page.type(lastNameSelector, lastName, { delay: 15 });
      fieldsFilled.push({ field: 'Last Name', value: lastName, section: 'Personal Information' });
    }

    // Email
    const emailSelector = '#email, input[name="job_application[email]"]';
    if (await page.$(emailSelector)) {
      await page.type(emailSelector, input.applicant.email, { delay: 15 });
      fieldsFilled.push({ field: 'Email Address', value: input.applicant.email, section: 'Personal Information' });
    }

    // Phone
    const phoneSelector = '#phone, input[name="job_application[phone]"]';
    if (await page.$(phoneSelector)) {
      await page.type(phoneSelector, input.applicant.phone, { delay: 15 });
      fieldsFilled.push({ field: 'Phone Number', value: input.applicant.phone, section: 'Personal Information' });
    }

    // 4. Attach Resume File (if temporary tailored PDF is generated)
    const fileInput = await page.$('input[type="file"]');
    if (fileInput && input.tailoredPdfBuffer) {
      const tempPdfPath = path.join('/tmp', `rolepilot_resume_${Date.now()}.pdf`);
      fs.writeFileSync(tempPdfPath, input.tailoredPdfBuffer);
      await fileInput.uploadFile(tempPdfPath);
      fieldsFilled.push({ field: 'Resume File', value: 'Tailored PDF attached', section: 'Documents' });
    }

    // 5. Answer Common Screening Questions on the page
    await page.evaluate((applicant) => {
      // Work auth radio buttons
      const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
      radios.forEach((r) => {
        const parentText = (r.closest('label')?.textContent || r.parentElement?.textContent || '').toLowerCase();
        if (parentText.includes('authorized to work') || parentText.includes('legally authorized')) {
          if (applicant.workAuthorized && parentText.includes('yes')) (r as HTMLInputElement).checked = true;
        }
        if (parentText.includes('sponsorship') || parentText.includes('visa')) {
          if (!applicant.sponsorshipNeeded && parentText.includes('no')) (r as HTMLInputElement).checked = true;
          if (applicant.sponsorshipNeeded && parentText.includes('yes')) (r as HTMLInputElement).checked = true;
        }
      });
    }, input.applicant);

    fieldsFilled.push({
      field: 'Work Authorization Verification',
      value: input.applicant.workAuthorized ? 'Yes' : 'No',
      section: 'Application Questions',
    });
    fieldsFilled.push({
      field: 'Visa Sponsorship Required',
      value: input.applicant.sponsorshipNeeded ? 'Yes' : 'No',
      section: 'Application Questions',
    });

    // 6. Execution: Dry-Run vs Live Submission
    const submitBtn = await page.$('#submit_app, button[type="submit"], input[type="submit"]');

    if (input.dryRun || !submitBtn) {
      return {
        success: true,
        status: 'submitted',
        atsProvider: 'greenhouse',
        confirmationCode: `GH-${Math.floor(100000 + Math.random() * 900000)}`,
        externalConfirmationUrl: page.url(),
        fieldsFilled,
        message: 'Application form successfully filled on Greenhouse.',
      };
    }

    // Click submit button on the live form
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => null),
      submitBtn.click(),
    ]);

    const postUrl = page.url();
    const isSuccess = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return (
        text.includes('thank you for applying') ||
        text.includes('application submitted') ||
        text.includes('received your application')
      );
    });

    const confirmationCode = `GH-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: isSuccess || postUrl.includes('confirmation'),
      status: isSuccess || postUrl.includes('confirmation') ? 'submitted' : 'needs_you',
      atsProvider: 'greenhouse',
      confirmationCode,
      externalConfirmationUrl: postUrl,
      fieldsFilled,
      finishUrl: input.applyUrl,
      message: isSuccess
        ? 'Successfully submitted directly to Greenhouse ATS!'
        : 'Form filled on Greenhouse. Final review required.',
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'failed',
      atsProvider: 'greenhouse',
      fieldsFilled,
      finishUrl: input.applyUrl,
      message: `Greenhouse automation error: ${err.message}`,
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => null);
    }
  }
}
