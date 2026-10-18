import { NextResponse } from 'next/server';
import { INITIAL_STAYS } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const stay = INITIAL_STAYS.find(s => s.accessTokenHash === token) || INITIAL_STAYS[0];

    return NextResponse.json({
      success: true,
      stayId: stay.id,
      roomId: stay.roomId,
      guestName: stay.guestName,
      customToken: 'mock_custom_jwt_token_for_' + stay.id,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process token' }, { status: 500 });
  }
}
