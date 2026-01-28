import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import { createServerSupabaseClient, EarlyAccessSignup } from '@/lib/supabase';

// Validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  profession: z.string().min(1, 'Profession is required'),
  country: z.string().min(1, 'Country is required'),
  event_id: z.string().optional(), // For Meta deduplication
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

// Hash function for Meta Conversions API (requires SHA-256 hashing)
function hashForMeta(value: string): string {
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

// Send event to Meta Conversions API
async function sendMetaConversionEvent({
  eventName,
  eventId,
  email,
  userAgent,
  clientIpAddress,
  pageUrl,
  country,
  profession,
}: {
  eventName: string;
  eventId?: string;
  email: string;
  userAgent?: string;
  clientIpAddress?: string;
  pageUrl?: string;
  country?: string;
  profession?: string;
}) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;

  if (!pixelId || !accessToken) {
    console.log('Meta Conversions API not configured - skipping server event');
    return;
  }

  const eventTime = Math.floor(Date.now() / 1000);

  const eventData = {
    event_name: eventName,
    event_time: eventTime,
    event_id: eventId, // For deduplication with client-side pixel
    action_source: 'website',
    event_source_url: pageUrl,
    user_data: {
      em: [hashForMeta(email)], // Hashed email
      client_ip_address: clientIpAddress,
      client_user_agent: userAgent,
      country: country ? [hashForMeta(country)] : undefined,
    },
    custom_data: {
      content_name: 'Early Access Signup',
      content_category: profession,
    },
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [eventData],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Meta Conversions API error:', errorData);
    } else {
      console.log('Meta Conversions API: Lead event sent successfully');
    }
  } catch (error) {
    console.error('Failed to send Meta conversion event:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { email, profession, country, event_id, utm_source, utm_medium, utm_campaign } =
      result.data;

    // Get user info from request headers for Meta Conversions API
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIpAddress = forwardedFor?.split(',')[0]?.trim() || undefined;
    const referer = request.headers.get('referer') || undefined;

    // Create Supabase client
    const supabase = createServerSupabaseClient();

    // Prepare signup data
    const signupData: EarlyAccessSignup = {
      email: email.toLowerCase().trim(),
      profession,
      country,
      source: 'landing',
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
    } as EarlyAccessSignup;

    // Insert into database
    const { error: dbError } = await supabase
      .from('early_access_signups')
      .insert(signupData);

    if (dbError) {
      // Handle duplicate email
      if (dbError.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already on the waitlist!' },
          { status: 409 }
        );
      }

      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save signup. Please try again.' },
        { status: 500 }
      );
    }

    // Send server-side Meta Conversions API event (non-blocking)
    sendMetaConversionEvent({
      eventName: 'Lead',
      eventId: event_id,
      email,
      userAgent,
      clientIpAddress,
      pageUrl: referer,
      country,
      profession,
    }).catch((err) => console.error('Meta conversion event failed:', err));

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: 'Successfully joined the waitlist!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Handle missing environment variables
    if (error instanceof Error && error.message.includes('Missing Supabase')) {
      console.error('Supabase configuration error - check environment variables');
      return NextResponse.json(
        { error: 'Server configuration error. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
