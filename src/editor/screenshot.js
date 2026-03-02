import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

export const SCREENSHOT_SIZE = { width: 1600, height: 900 };

/**
 * Launch a reusable headless Chromium browser.
 * Caller is responsible for closing the browser when done.
 */
export async function createScreenshotBrowser() {
  const browser = await chromium.launch({ headless: true });
  return { browser };
}

/**
 * Create a fresh screenshot page/context from an existing browser.
 * Caller must close the returned context.
 */
export async function createScreenshotPage(browser) {
  const context = await browser.newContext({ viewport: SCREENSHOT_SIZE });
  const page = await context.newPage();
  return { context, page };
}

/**
 * Capture a screenshot of a single slide HTML file.
 *
 * @param {import('playwright').Page} page  – reusable Playwright page
 * @param {string} slideFile               – filename, e.g. "slide-04.html"
 * @param {string} screenshotPath          – output PNG path
 * @param {string} slidesDir               – directory containing the slide files
 * @param {object} [options]
 * @param {boolean} [options.useHttp]       – if true, slidesDir is treated as a base URL
 */
export async function captureSlideScreenshot(page, slideFile, screenshotPath, slidesDir, options = {}) {
  const slideUrl = options.useHttp
    ? `${slidesDir}/${slideFile}`
    : pathToFileURL(join(slidesDir, slideFile)).href;

  await page.goto(slideUrl, { waitUntil: 'load' });
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });

  await page.evaluate(({ width, height }) => {
    const htmlStyle = document.documentElement.style;
    const bodyStyle = document.body.style;

    htmlStyle.margin = '0';
    htmlStyle.padding = '0';
    htmlStyle.overflow = 'hidden';
    htmlStyle.background = '#ffffff';

    bodyStyle.margin = '0';
    bodyStyle.padding = '0';
    bodyStyle.transformOrigin = 'top left';

    const rect = document.body.getBoundingClientRect();
    const sourceWidth = rect.width > 0 ? rect.width : width;
    const sourceHeight = rect.height > 0 ? rect.height : height;
    const scale = Math.min(width / sourceWidth, height / sourceHeight);

    bodyStyle.transform = `scale(${scale})`;
  }, SCREENSHOT_SIZE);

  await page.screenshot({
    path: screenshotPath,
    fullPage: false,
  });
}
