import { describe, expect, it } from 'vitest';
import { qrSvg } from '../src/lib/qr';

describe('qrSvg', () => {
  it('draws dark modules in the text colour, with no hardcoded colours', async () => {
    const svg = await qrSvg('https://cinemakom.sharon-xa.com/#android', 'QR "code"');
    expect(svg).toMatch(/^<svg role="img" aria-label="QR &quot;code&quot;"/);
    expect(svg).toContain('stroke="currentColor"');
    expect(svg).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });
});
