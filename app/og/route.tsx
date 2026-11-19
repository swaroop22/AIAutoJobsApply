import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') ?? 'RolePilot';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#fdfcfc',
          padding: '72px',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, color: '#000000' }}>RolePilot</div>
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            lineHeight: 1.1,
            color: '#000000',
            maxWidth: '950px',
          }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#ff4704' }}>
          Free. No account. No card.
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
