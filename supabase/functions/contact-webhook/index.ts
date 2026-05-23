import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const origin = req.headers.get('origin') || '';
  
  // Allow all lovableproject.com subdomains and known origins
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

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const startedAt = new Date().toISOString();

  try {
    const { name, email, message } = await req.json();

    // Basic input validation and size limits
    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' },
      });
    }
    if (name.length > 200 || email.length > 320 || message.length > 5000) {
      return new Response(JSON.stringify({ error: 'Payload too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' },
      });
    }

    const maskEmail = (e: string) => {
      const [local, domain] = e.split('@');
      if (!domain) return '***';
      const first = local[0] ?? '';
      const last = local.slice(-1) ?? '';
      const maskedLocal = `${first}${'*'.repeat(Math.max(0, local.length - 2))}${last}`;
      return `${maskedLocal}@${domain}`;
    };

    // Avoid logging raw PII
    console.log('contact-webhook received', { requestId, startedAt, email: maskEmail(email) });

    const payload = { name, email, message, timestamp: startedAt, requestId };

    // Send to the external webhook (n8n)
    const webhookResponse = await fetch('https://primary-production-4a757.up.railway.app/webhook/queries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Get response from n8n (handle both success and failure)
    let n8nResponse: Record<string, unknown> = {};
    try {
      const text = await webhookResponse.text();
      if (text) {
        n8nResponse = JSON.parse(text);
      }
    } catch {
      // If n8n doesn't return valid JSON, use empty object
      n8nResponse = {};
    }

    if (!webhookResponse.ok) {
      console.error('contact-webhook: n8n returned error', { requestId, status: webhookResponse.status, n8nResponse });
      // Still return success to user - their message was received, n8n processing failed
      return new Response(JSON.stringify({ 
        success: true, 
        requestId,
        message: "Your message has been received! We'll get back to you soon.",
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' },
        status: 200,
      });
    }

    console.log('contact-webhook forwarded successfully', { requestId, n8nResponse });

    return new Response(JSON.stringify({ 
      success: true, 
      requestId,
      message: (n8nResponse.message as string) || "Your message has been received successfully!",
      ...n8nResponse 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' },
      status: 200,
    });
  } catch (error) {
    console.error('contact-webhook error', { requestId, error: (error as Error).message });
    return new Response(JSON.stringify({ error: 'Internal error', requestId }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' },
    });
  }
});