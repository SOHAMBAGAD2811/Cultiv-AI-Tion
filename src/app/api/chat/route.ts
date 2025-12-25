import { NextResponse } from 'next/server';

export const runtime = 'edge';

const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

console.log('[api/chat] Environment variables:', {
  GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
  GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
  API_KEY: !!API_KEY,
});
console.log('[api/chat] Using model:', MODEL);
console.log('[api/chat] Using API URL:', API_URL);

// POST /api/chat
// If GEMINI_API_KEY is set, forwards the prompt to the Gemini (Generative Language) REST API and returns its text output.
// If GEMINI_API_KEY is missing, falls back to a local echo response so the UI still works.
export async function POST(req: Request) {
  const start = Date.now();
  try {
    console.log('[api/chat] Starting request processing');
    
    const body = await req.json();
    console.log('[api/chat] Request body:', body);
    
    const prompt = body?.prompt ?? '';
    console.log('[api/chat] Extracted prompt:', prompt);

    if (!prompt) {
      console.log('[api/chat] No prompt provided');
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    if (!API_KEY) {
      console.log('[api/chat] No API key configured');
      const reply = `Assistant (local echo): I received your prompt — "${prompt}"\n\n(To enable real Gemini responses set GOOGLE_API_KEY in your environment and restart the dev server.)`;
      return NextResponse.json({ result: reply });
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const fetchUrl = `${API_URL}?key=${encodeURIComponent(API_KEY)}`;
    
    console.log('[api/chat] Request URL (redacted):', fetchUrl.split('?')[0]);

    console.log('[api/chat] Making request to:', fetchUrl);
    console.log('[api/chat] With headers:', headers);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };
    
    console.log('[api/chat] Request URL:', fetchUrl);
    console.log('[api/chat] Request headers:', headers);
    console.log('[api/chat] Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('[api/chat] Response status:', response.status);
    console.log('[api/chat] Response text:', responseText);
      
    if (!response.ok) {
      console.error('[api/chat] API error:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
        
      return NextResponse.json({ 
        error: `API Error (${response.status}): ${responseText}`
      }, { status: 502 });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[api/chat] Failed to parse response:', e);
      return NextResponse.json({
        error: 'Invalid response from AI service',
        details: responseText
      }, { status: 500 });
    }

    // Parse the Gemini API response
    if (data && typeof data === 'object') {
      console.log('[api/chat] Parsed response:', JSON.stringify(data, null, 2));
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return NextResponse.json({ result: data.candidates[0].content.parts[0].text });
      } else if (data.error) {
        console.error('[api/chat] Gemini API error response:', data.error);
        return NextResponse.json({ 
          error: `API Error: ${data.error.message || 'Unknown error'}`,
          code: data.error.code
        }, { status: 502 });
      }
    }

    console.error('[api/chat] Unexpected response format:', data);
    return NextResponse.json({ 
      error: 'Unexpected response format from AI service',
      details: JSON.stringify(data)
    }, { status: 500 });
  } catch (err) {
    const error = err as Error;
    console.error('[api/chat] Error details:', {
      name: error?.name || 'UnknownError',
      message: error?.message || String(err),
      stack: error?.stack,
    });

    if (error?.message?.includes('fetch')) {
      return NextResponse.json({ 
        error: 'Could not connect to Gemini API. Please check your API key and internet connection.',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ 
      error: 'An error occurred while processing your request',
      details: error.message || String(err)
    }, { status: 500 });
  } finally {
    console.log('[api/chat] Request handled in', Date.now() - start, 'ms');
  }
}
