import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCodexEditPrompt,
  buildCodexExecArgs,
  normalizeSelection,
  scaleSelectionToScreenshot,
} from '../../src/editor/codex-edit.js';

test('normalizeSelection rounds values and clamps to slide bounds', () => {
  const selection = normalizeSelection(
    {
      x: -10.7,
      y: 15.2,
      width: 980.9,
      height: 700.6,
    },
    { width: 960, height: 540 },
  );

  assert.deepEqual(selection, {
    x: 0,
    y: 15,
    width: 960,
    height: 525,
  });
});

test('scaleSelectionToScreenshot maps slide bbox to screenshot pixels', () => {
  const scaled = scaleSelectionToScreenshot(
    { x: 96, y: 54, width: 480, height: 270 },
    { width: 960, height: 540 },
    { width: 1600, height: 900 },
  );

  assert.deepEqual(scaled, {
    x: 160,
    y: 90,
    width: 800,
    height: 450,
  });
});

test('buildCodexEditPrompt includes user prompt, bbox, and XPath targets', () => {
  const prompt = buildCodexEditPrompt({
    slideFile: 'slide-01.html',
    userPrompt: 'Make this title larger and move it left.',
    selections: [
      {
        bbox: { x: 100, y: 40, width: 300, height: 120 },
        targets: [
          {
            xpath: '/html/body/div[1]/h1[1]',
            tag: 'h1',
            text: 'Q1 Revenue',
          },
          {
            xpath: '/html/body/div[1]/p[2]',
            tag: 'p',
            text: 'Source: Internal',
          },
        ],
      },
    ],
  });

  assert.match(prompt, /slides\/slide-01\.html/);
  assert.match(prompt, /Make this title larger and move it left\./);
  assert.match(prompt, /x=100, y=40, width=300, height=120/);
  assert.match(prompt, /\/html\/body\/div\[1\]\/h1\[1\]/);
  assert.match(prompt, /Q1 Revenue/);
  assert.match(prompt, /Region 1/);
});

test('buildCodexExecArgs attaches image and prompt to codex exec', () => {
  const args = buildCodexExecArgs({
    prompt: 'Edit slide',
    imagePath: '/tmp/slide-annotated.png',
    model: 'gpt-5.3',
  });

  assert.deepEqual(args, [
    '--dangerously-bypass-approvals-and-sandbox',
    'exec',
    '--color',
    'never',
    '--model',
    'gpt-5.3',
    '--image',
    '/tmp/slide-annotated.png',
    '--',
    'Edit slide',
  ]);
});
