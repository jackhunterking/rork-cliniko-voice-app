# Voice Notes Landing Page

A production-ready landing page for capturing early access signups from clinicians. Built with Next.js 14, Tailwind CSS, and Supabase.

## Features

- **Mobile-first design** - Optimized for Meta ads traffic (90%+ mobile)
- **Fast performance** - < 100kb JS, optimized for fast LCP
- **Supabase integration** - Signups stored securely with RLS
- **Analytics-ready** - Meta Pixel + Google Analytics hooks
- **Vercel-optimized** - One-click deployment

## Quick Start

### 1. Install dependencies

```bash
cd landing
npm install
```

### 2. Set up environment variables

Copy `env.example` to `.env.local` and fill in your values:

```bash
cp env.example .env.local
```

Required variables:

```env
# Supabase (your project is already set up!)
NEXT_PUBLIC_SUPABASE_URL=https://tlvaypewjkzwvifhrjvb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Analytics (optional)
NEXT_PUBLIC_META_PIXEL_ID=your-pixel-id
NEXT_PUBLIC_GA_ID=your-ga4-id
```

**Getting your Supabase Service Role Key:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your "Cliniko Voice" project
3. Go to Settings → API
4. Copy the `service_role` key (keep this secret!)

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the page.

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd landing
vercel
```

### Option 2: Deploy via GitHub

1. Push the `landing/` folder to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Set the **Root Directory** to `landing`
5. Add environment variables in Vercel dashboard
6. Deploy!

### Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tlvaypewjkzwvifhrjvb.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `NEXT_PUBLIC_META_PIXEL_ID` | Your Meta Pixel ID (optional) |
| `NEXT_PUBLIC_GA_ID` | Your GA4 Measurement ID (optional) |

## Custom Domain Setup

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain (e.g., `voicenotes.app`)
3. Configure DNS as instructed:
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or add A record pointing to Vercel's IP

Vercel will automatically provision SSL certificate.

## Meta Pixel Setup

1. Create a Meta Pixel at [business.facebook.com](https://business.facebook.com)
2. Copy your Pixel ID
3. Add to `NEXT_PUBLIC_META_PIXEL_ID` environment variable
4. Verify with [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper) Chrome extension

The landing page automatically tracks:
- `PageView` - On page load
- `Lead` - On successful form submission

## Google Analytics Setup

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com)
2. Copy your Measurement ID (starts with `G-`)
3. Add to `NEXT_PUBLIC_GA_ID` environment variable

## Viewing Signups

View signups in Supabase Dashboard:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select "Cliniko Voice" project
3. Go to Table Editor → `early_access_signups`

Or query directly:

```sql
SELECT * FROM early_access_signups ORDER BY created_at DESC;
```

## Project Structure

```
landing/
├── app/
│   ├── layout.tsx          # Root layout with fonts & analytics
│   ├── page.tsx            # Main landing page
│   ├── globals.css         # Tailwind + custom styles
│   └── api/
│       └── signup/
│           └── route.ts    # Signup API endpoint
├── components/
│   ├── Analytics.tsx       # Meta Pixel + GA4 scripts
│   ├── Hero.tsx            # Hero section with CTA
│   ├── VisualProof.tsx     # App mockups
│   ├── ProblemSection.tsx  # Pain points
│   ├── HowItWorks.tsx      # 4-step flow
│   ├── TrustSection.tsx    # Trust signals
│   ├── SignupForm.tsx      # Email capture form
│   └── Footer.tsx          # Minimal footer
├── lib/
│   └── supabase.ts         # Supabase server client
├── tailwind.config.ts      # Theme configuration
└── package.json
```

## Customization

### Changing Copy

Edit component files directly:
- **Headline**: `components/Hero.tsx`
- **Problem points**: `components/ProblemSection.tsx`
- **How it works steps**: `components/HowItWorks.tsx`
- **Trust points**: `components/TrustSection.tsx`

### Adding Screenshots

Replace the mockup SVGs in `components/VisualProof.tsx` with actual screenshots:

```tsx
import Image from 'next/image';

<Image
  src="/mockups/recording-screen.png"
  alt="Recording screen"
  width={320}
  height={693}
/>
```

### Changing Colors

Edit `tailwind.config.ts`:

```ts
colors: {
  primary: {
    DEFAULT: '#007FA3',  // Your brand color
    light: '#E6F4F8',
    dark: '#006080',
  },
  // ...
}
```

## A/B Testing Headlines

To test different headlines, create URL variants:

1. Control: `/` - "Stop typing. Start talking."
2. Variant A: `/?variant=a` - "Document faster. Finish sooner."
3. Variant B: `/?variant=b` - "Voice-to-notes in seconds."

Implement in `Hero.tsx`:

```tsx
const { searchParams } = new URL(window.location.href);
const variant = searchParams.get('variant');

const headlines = {
  default: 'Stop typing. Start talking.',
  a: 'Document faster. Finish sooner.',
  b: 'Voice-to-notes in seconds.',
};
```

## Meta Ad Copy Suggestions

### Pain-focused (Variant A)
> **Stop typing notes after hours**
> 
> Voice-to-notes for busy clinicians. Speak your documentation, get polished notes in seconds.
> 
> Request early access →

### Feature-focused (Variant B)
> **Voice notes for healthcare**
> 
> Turn natural speech into formatted clinical documentation. No more typing between patients.
> 
> Join the waitlist →

### Benefit-focused (Variant C)
> **Finish documentation in half the time**
> 
> Speak your patient notes instead of typing them. Built by clinicians, for clinicians.
> 
> Get early access →

## Troubleshooting

### Form submissions not working

1. Check Supabase environment variables are set
2. Verify service role key is correct (not the anon key)
3. Check browser console for errors
4. Verify the `early_access_signups` table exists

### Styles not loading

1. Run `npm run dev` to compile Tailwind
2. Check `globals.css` is imported in `layout.tsx`
3. Clear browser cache

### Analytics not tracking

1. Disable ad blockers during testing
2. Use Meta Pixel Helper to verify
3. Check environment variables are set with `NEXT_PUBLIC_` prefix

## License

Private - All rights reserved.
