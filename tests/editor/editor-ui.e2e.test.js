import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const REPO_ROOT = '/Users/jeffrey/Projects/ppt_team_agent';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeSlides(workspace) {
  const slidesDir = join(workspace, 'slides');
  await mkdir(slidesDir, { recursive: true });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    html, body { margin: 0; padding: 0; width: 960px; height: 540px; overflow: hidden; }
    .wrap { width: 960px; height: 540px; padding: 48px; box-sizing: border-box; }
    h1 { margin: 0; font-size: 56px; }
    p { margin: 20px 0 0 0; font-size: 24px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Hello World</h1>
    <p>UI bbox e2e</p>
  </div>
</body>
</html>`;

  await writeFile(join(slidesDir, 'slide-01.html'), html, 'utf8');
}

async function waitForServerReady(port, child, outputRef) {
  const started = Date.now();
  while (Date.now() - started < 20000) {
    if (child.exitCode !== null) {
      throw new Error(`server exited early: ${child.exitCode}\n${outputRef.value}`);
    }

    try {
      const res = await fetch(`http://localhost:${port}/api/slides`);
      if (res.ok) return;
    } catch {
      // retry
    }

    await sleep(150);
  }

  throw new Error(`server did not become ready\n${outputRef.value}`);
}

test('supports multi-bbox selection and delete in chat composer flow', async () => {
  const workspace = await mkdtemp(join(os.tmpdir(), 'editor-ui-e2e-'));
  await writeSlides(workspace);

  const port = 3652;
  const serverOutput = { value: '' };
  const serverScriptPath = join(REPO_ROOT, 'scripts', 'editor-server.js');
  const server = spawn(process.execPath, [serverScriptPath, '--port', String(port)], {
    cwd: workspace,
    env: {
      ...process.env,
      PPT_AGENT_PACKAGE_ROOT: REPO_ROOT,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  server.stdout.on('data', (chunk) => {
    serverOutput.value += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    serverOutput.value += chunk.toString();
  });

  let browser;
  try {
    await waitForServerReady(port, server, serverOutput);

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('#draw-layer');
    await page.waitForTimeout(800);

    await page.click('#btn-draw-bbox');

    const drawLayer = await page.locator('#draw-layer').boundingBox();
    assert.ok(drawLayer, 'draw layer not found');

    // draw bbox #1
    await page.mouse.move(drawLayer.x + drawLayer.width * 0.08, drawLayer.y + drawLayer.height * 0.08);
    await page.mouse.down();
    await page.mouse.move(drawLayer.x + drawLayer.width * 0.42, drawLayer.y + drawLayer.height * 0.24, { steps: 6 });
    await page.mouse.up();

    // draw bbox #2
    await page.mouse.move(drawLayer.x + drawLayer.width * 0.20, drawLayer.y + drawLayer.height * 0.34);
    await page.mouse.down();
    await page.mouse.move(drawLayer.x + drawLayer.width * 0.66, drawLayer.y + drawLayer.height * 0.62, { steps: 6 });
    await page.mouse.up();

    await page.waitForFunction(() => {
      const el = document.querySelector('#bbox-count');
      return el && /2 boxes/.test(el.textContent || '');
    });

    await page.locator('.bbox-item').first().click();
    await page.locator('.bbox-item.selected .bbox-delete').click();

    await page.waitForFunction(() => {
      const el = document.querySelector('#bbox-count');
      return el && /1 box/.test(el.textContent || '');
    });

    let capturedBody = null;
    await page.route('**/api/apply', async (route) => {
      const req = route.request();
      capturedBody = JSON.parse(req.postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          runId: 'run-ui-e2e',
          code: 0,
          message: 'ok',
        }),
      });
    });

    await page.fill('#prompt-input', 'Change heading text.');
    await page.click('#btn-send');

    await page.waitForFunction(() => {
      const el = document.querySelector('#status-message');
      return el && /ok/i.test(el.textContent || '');
    });

    assert.ok(capturedBody, 'apply payload was not captured');
    assert.equal(capturedBody.slide, 'slide-01.html');
    assert.ok(Array.isArray(capturedBody.selections));
    assert.equal(capturedBody.selections.length, 1);
    assert.ok(Array.isArray(capturedBody.selections[0].targets));
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    server.kill('SIGTERM');
    await sleep(400);
    await rm(workspace, { recursive: true, force: true }).catch(() => {});
  }
});
