import axe from 'axe-core';
import { expect } from 'vitest';

export async function checkAccessibility() {
  // jsdom cannot measure rendered contrast. That check is performed in the browser.
  const result = await axe.run(document.body, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
    rules: { 'color-contrast': { enabled: false } },
  });
  expect(
    result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })),
  ).toEqual([]);
}
