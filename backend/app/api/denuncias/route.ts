import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

type Payload = {
  description: string;
  subject?: string;
  email?: string;
  phone?: string;
  area?: string;
};

function protocol() {
  return 'SNT-' + Date.now().toString(36).toUpperCase();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;
    if (!body?.description || body.description.trim().length < 30) {
      return NextResponse.json({ error: 'Descreva os fatos (mín. 30 caracteres).' }, { status: 400 });
    }
    const id = crypto.randomUUID();
    const proto = protocol();
    const item = {
      id,
      proto,
      subject: body.subject?.trim() || null,
      description: body.description.trim(),
      contact: { email: body.email || null, phone: body.phone || null },
      area: body.area || null,
      status: 'recebida',
      createdAt: new Date().toISOString()
    };
    await kv.hset('denuncia:' + id, item);
    await kv.zadd('denuncia:index', { score: Date.now(), member: id });

    return NextResponse.json({ ok: true, id, protocol: proto }, {
      headers: { 'access-control-allow-origin': '*' }
    });
  } catch (e) {
    return NextResponse.json({ error: 'Falha ao registrar denúncia.' }, { status: 500 });
  }
}
