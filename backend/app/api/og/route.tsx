import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';
export const alt = 'Sentinela Nativense';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Transparência e Ação Cidadã';
  const tag = searchParams.get('tag') || 'Sentinela Nativense';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0A2342',
          color: '#fff',
          padding: '48px',
          fontFamily: 'Inter, Arial, sans-serif'
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ background: '#D72638', padding: '10px 16px', borderRadius: 9999, fontSize: 24, fontWeight: 700 }}>
            {tag}
          </div>
          <div style={{ opacity: .8, fontSize: 22 }}>sentinela.nativense</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
