// Geometry and timing of the marquee bulbs (src/components/Bulbs.astro).
//
// A row shows as many 6 px bulbs as fit with at least 7 px between them
// (k bulbs need 13k − 7 px); the rest wrap onto a hidden line. For a chase that
// ends exactly on time whatever the row's size, each bulb needs to know how
// many are visible (--n). CSS can't divide a length into a count, so these
// container-query rules set --n for every possible size: each row and column
// is a size container, and the last rule that matches wins.

export const BULB_PX = 6;
export const GAP_PX = 7;
const PITCH = BULB_PX + GAP_PX;

/** The chase rules, once per page that has a chasing row. */
export function chaseCss(maxAcross = 96, maxDown = 48): string {
  let css = '';
  for (let k = 2; k <= maxAcross; k++) css += `@container (min-width:${PITCH * k - GAP_PX}px){.bulbs.bulbs-chase>.bulb{--n:${k}}}`;
  for (let k = 2; k <= maxDown; k++) css += `@container (min-height:${PITCH * k - GAP_PX}px){.bulbs.bulbs-chase>.bulb{--n:${k}}}`;
  return css;
}
