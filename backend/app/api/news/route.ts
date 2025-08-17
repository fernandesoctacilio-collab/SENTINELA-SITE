import { NextResponse } from 'next/server';
import { fromG1, fromBand } from '@/lib/news';

export const runtime = 'edge';
export const revalidate = 600; // 10min

export async function GET() {
  const out: any[] = [];
  try { out.push(...await fromG1()); } catch (e) { console.warn('G1 fail', e); }
  try { out.push(...await fromBand()); } catch (e) { console.warn('Band fail', e); }
  return NextResponse.json({ items: out.slice(0, 24) }, {
    headers: { 'access-control-allow-origin': '*' }
  });
}
