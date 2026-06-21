import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const origin = req.headers.get('origin') || '';
  const isLovableOrigin = origin.endsWith('.lovableproject.com');
  const allowedOrigins = new Set([
    'https://unipage.io',
    'http://localhost:5173',
    'http://localhost:3000',
  ]);
  const allowOrigin = isLovableOrigin || allowedOrigins.has(origin) ? origin : 'https://unipage.io';

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  } as const;

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const startedAt = new Date().toISOString();

  try {
    const { name, email, message } = await req.json();

    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (name.length > 200 || email.length > 320 || message.length > 5000) {
      return new Response(JSON.stringify({ error: 'Payload too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = { name, email, message, timestamp: startedAt, requestId };

    const webhookResponse = await fetch('https://primary-production-4a757.up.railway.app/webhook/queries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let n8nResponse: Record<string, unknown> = {};
    try {
      const text = await webhookResponse.text();
      if (text) n8nResponse = JSON.parse(text);
    } catch {
      n8nResponse = {};
    }

    return new Response(JSON.stringify({
      success: true,
      requestId,
      message: (n8nResponse.message as string) || "Your message has been received successfully!",
      ...n8nResponse,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('contact-webhook error', { requestId, error: (error as Error).message });
    return new Response(JSON.stringify({ error: 'Internal error', requestId }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
