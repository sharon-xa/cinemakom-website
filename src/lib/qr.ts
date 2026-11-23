// QR codes as inline SVG, made at build time (GUIDE §6.4). The dark modules
// take the text colour (currentColor) and the light ones are left out, so the
// page's tokens decide both: dark modules on a light tile, as scanners expect.
import QRCode from 'qrcode';

export async function qrSvg(text: string, label: string): Promise<string> {
  const svg = await QRCode.toString(text, { type: 'svg', margin: 0, errorCorrectionLevel: 'M' });
  return svg
    .replace(/<path fill="#ffffff"[^>]*\/>/, '')
    .replace(/stroke="#000000"/, 'stroke="currentColor"')
    .replace('<svg ', `<svg role="img" aria-label="${label.replace(/"/g, '&quot;')}" width="100%" height="100%" `);
}
