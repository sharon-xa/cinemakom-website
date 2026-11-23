// /version.json: the release this build used. The scheduled workflow compares
// it with GitHub's latest release and skips the rebuild when they match.
import type { APIRoute } from 'astro';
import { getRelease } from '../lib/release';

export const GET: APIRoute = async () => {
  const release = await getRelease();
  const body = { tag: release.tag, builtAt: new Date().toISOString() };
  return new Response(JSON.stringify(body) + '\n', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
