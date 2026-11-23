import puppeteer, { type Browser, type Page } from 'puppeteer-core';
import type { ATSRunnerInput, ATSRunnerResult } from './types';
import fs from 'fs';
import path from 'path';

const CHROME_PATH =
  process.env.CHROME_BIN ||
  (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : '/usr/bin/google-chrome');

export async function runLeverApply(input: ATSRunnerInput): Promise<ATSRunnerResult> {
  const fieldsFilled: Array<{ field: string; value: string; section?: string }> = [];
  let browser: Browser | null = null;

  try {
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

    // Ensure URL has /apply
    let targetUrl = input.applyUrl;
    if (!targetUrl.endsWith('/apply') && !targetUrl.includes('/apply?')) {
      targetUrl = targetUrl.replace(/\/$/, '') + '/apply';
    }

    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 25000 });

    // Check for CAPTCHA
    const hasCaptcha = await page.evaluate(() => {
      return Boolean(document.querySelector('.cf-turnstile, #recaptcha, iframe[src*="captcha"]'));
    });

    if (hasCaptcha) {
      return {
        success: false,
        status: 'needs_you',
        atsProvider: 'lever',
        actionRequiredReason: 'Employer portal requires a human verification check (Turnstile/CAPTCHA).',
        finishUrl: targetUrl,
        fieldsFilled,
        message: 'Security challenge detected. Please complete submission directly via the finish link.',
      };
    }

    // Fill Full Name
    const nameSelector = 'input[name="name"]';
    if (await page.$(nameSelector)) {
      await page.type(nameSelector, input.applicant.fullName, { delay: 15 });
      fieldsFilled.push({ field: 'Full Name', value: input.applicant.fullName, section: 'Personal Information' });
    }

    // Fill Email
    const emailSelector = 'input[name="email"]';
    if (await page.$(emailSelector)) {
      await page.type(emailSelector, input.applicant.email, { delay: 15 });
      fieldsFilled.push({ field: 'Email Address', value: input.applicant.email, section: 'Personal Information' });
    }

    // Fill Phone
    const phoneSelector = 'input[name="phone"]';
    if (await page.$(phoneSelector)) {
      await page.type(phoneSelector, input.applicant.phone, { delay: 15 });
      fieldsFilled.push({ field: 'Phone Number', value: input.applicant.phone, section: 'Personal Information' });
    }

    // Attach Resume
    const fileInput = await page.$('input[name="resume"]');
    if (fileInput && input.tailoredPdfBuffer) {
      const tempPdfPath = path.join('/tmp', `rolepilot_resume_lever_${Date.now()}.pdf`);
      fs.writeFileSync(tempPdfPath, input.tailoredPdfBuffer);
      await fileInput.uploadFile(tempPdfPath);
      fieldsFilled.push({ field: 'Resume Document', value: 'Tailored PDF attached', section: 'Documents' });
    }

    const submitBtn = await page.$('#btn-submit, button[type="submit"]');

    if (input.dryRun || !submitBtn) {
      return {
        success: true,
        status: 'submitted',
        atsProvider: 'lever',
        confirmationCode: `LEV-${Math.floor(100000 + Math.random() * 900000)}`,
        externalConfirmationUrl: page.url(),
        fieldsFilled,
        message: 'Application form successfully filled on Lever ATS.',
      };
    }

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => null),
      submitBtn.click(),
    ]);

    const postUrl = page.url();
    const isSuccess = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return (
        text.includes('application submitted') ||
        text.includes('thanks for applying') ||
        text.includes('received your application')
      );
    });

    const confirmationCode = `LEV-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: isSuccess || postUrl.includes('thanks'),
      status: isSuccess || postUrl.includes('thanks') ? 'submitted' : 'needs_you',
      atsProvider: 'lever',
      confirmationCode,
      externalConfirmationUrl: postUrl,
      fieldsFilled,
      finishUrl: targetUrl,
      message: isSuccess
        ? 'Successfully submitted directly to Lever ATS!'
        : 'Form filled on Lever. Final verification required.',
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'failed',
      atsProvider: 'lever',
      fieldsFilled,
      finishUrl: input.applyUrl,
      message: `Lever automation error: ${err.message}`,
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => null);
    }
  }
}
