import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
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
  test_event_code: z.string().optional(), // For Meta test events
});

// Send event to Meta Conversions API via Supabase Edge Function
async function sendMetaConversionEvent({
  eventName,
  eventId,
  email,
  userAgent,
  clientIpAddress,
  pageUrl,
  country,
  profession,
  testEventCode,
}: {
  eventName: string;
  eventId?: string;
  email: string;
  userAgent?: string;
  clientIpAddress?: string;
  pageUrl?: string;
  country?: string;
  profession?: string;
  testEventCode?: string;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    console.log('Supabase URL not configured - skipping Meta conversion event');
    return;
  }

  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/meta-conversion`;

  try {
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_name: eventName,
        email: email,
        event_id: eventId,
        client_ip_address: clientIpAddress,
        client_user_agent: userAgent,
        event_source_url: pageUrl,
        country: country,
        custom_data: {
          content_name: 'Early Access Signup',
          content_category: profession,
        },
        test_event_code: testEventCode,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Meta Conversions API error:', result);
    } else {
      console.log('Meta Conversions API: Lead event sent successfully', result);
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

    const { email, profession, country, event_id, utm_source, utm_medium, utm_campaign, test_event_code } =
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
      testEventCode: test_event_code,
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
