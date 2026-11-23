// /llms.txt (llmstxt.org): a plain-text summary for AI assistants, both languages.
import type { APIRoute } from 'astro';
import { getRelease } from '../lib/release';
import { llmsTxt } from '../lib/seo';

export const GET: APIRoute = async () =>
  new Response(llmsTxt(await getRelease()), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
