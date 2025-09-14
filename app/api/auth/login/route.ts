import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // Hasło bezpiecznie przechowywane na serwerze
    const correctPassword = process.env.ADMIN_PASSWORD;
    
    if (!correctPassword) {
      return NextResponse.json(
        { error: 'Błąd konfiguracji serwera' }, 
        { status: 500 }
      );
    }
    
    if (password === correctPassword) {
      return NextResponse.json({ 
        success: true,
        message: 'Zalogowano pomyślnie' 
      });
    } else {
      // Dodaj małe opóźnienie przeciwko brute force
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowe hasło' }, 
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Błąd logowania:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' }, 
      { status: 500 }
    );
  }
}
