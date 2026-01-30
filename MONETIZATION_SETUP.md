# Cliniko Voice - Monetization Setup Guide

This guide walks you through setting up App Store Connect, Superwall, and analytics for the MVP monetization layer.

---

## Prerequisites Checklist

- [ ] Apple Developer Account ($99/year)
- [ ] Superwall Account (free tier available)
- [ ] PostHog Account (free tier available)
- [ ] Facebook/Meta Business Account (free)
- [ ] Environment variables added to `.env`:
  - [ ] `EXPO_PUBLIC_SUPERWALL_API_KEY`
  - [ ] `EXPO_PUBLIC_POSTHOG_API_KEY`

---

## Part 1: App Store Connect Setup

### 1.1 Create App Listing

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Cliniko Voice
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: Select your bundle ID (from Xcode)
   - **SKU**: `cliniko-voice-ios` (unique identifier)
   - **User Access**: Full Access

### 1.2 Configure In-App Purchase

1. In your app, go to **Monetization** → **In-App Purchases**
2. Click **+** → **Create In-App Purchase**
3. Select **Auto-Renewable Subscription**
4. Fill in:
   - **Reference Name**: `Cliniko Voice Pro Monthly`
   - **Product ID**: `com.clinikovoice.pro.monthly` (must match Superwall)
   
5. Click **Create**

### 1.3 Configure Subscription Details

1. Click on your new subscription
2. **Subscription Duration**: 1 Month
3. **Subscription Group**: Create new → `Cliniko Voice Pro`
4. **Free Trial**: 
   - Click **Add Subscription Price**
   - Select your base price (e.g., $9.99/month)
   - Click **Introductory Offers** → **+**
   - **Type**: Free Trial
   - **Duration**: 3 Days
   - **Eligibility**: All eligible subscribers

### 1.4 Localization

1. Under your subscription, click **App Store Localization**
2. Add for English (U.S.):
   - **Display Name**: `Pro Monthly`
   - **Description**: `Unlimited voice recording and transcription for your clinical notes. Cancel anytime.`

### 1.5 Review Information

1. Scroll to **Review Information**
2. Add a screenshot of your paywall
3. **Review Notes**: `This subscription unlocks voice recording functionality for clinical note transcription.`

### 1.6 Enable Sandbox Testing

1. Go to **Users and Access** → **Sandbox** tab
2. Click **+** to add a Sandbox Tester
3. Use a real email you control (Apple sends verification)
4. Note: Use a different email than your Apple ID

### 1.7 App Store Server Notifications (Optional for MVP)

1. Go to **App Information** → **App Store Server Notifications**
2. Leave empty for MVP (Superwall handles purchase validation)

---

## Part 2: Superwall Dashboard Setup

### 2.1 Create Account & App

1. Go to [Superwall Dashboard](https://superwall.com/dashboard)
2. Sign up / Log in
3. Click **Create App**
4. Fill in:
   - **App Name**: Cliniko Voice
   - **Platform**: iOS
   - **Bundle ID**: Your app's bundle ID

### 2.2 Get API Key

1. Go to **Settings** → **Keys**
2. Copy your **Public API Key**
3. Add to `.env` as `EXPO_PUBLIC_SUPERWALL_API_KEY`

### 2.3 Add Product

1. Go to **Products** tab
2. Click **+ Add Product**
3. Fill in:
   - **Product ID**: `com.clinikovoice.pro.monthly` (exact match with App Store Connect)
   - **Name**: Pro Monthly
   - **Type**: Subscription

### 2.4 Verify Entitlement

1. Go to **Products** → **Entitlements** tab
2. Verify `pro` entitlement exists (it's the default)
3. If not, click **+ Add Entitlement** → Name it `pro`
4. Link your product to the `pro` entitlement

### 2.5 Create Placement

1. Go to **Placements** tab
2. Click **+ Add Placement**
3. Fill in:
   - **Name**: `record_gate`
   - **Identifier**: `record_gate`
4. Save

### 2.6 Create Paywall

1. Go to **Paywalls** tab
2. Click **+ Create Paywall**
3. Choose a template or start from scratch
4. Design your paywall with:
   - Headline: e.g., "Unlock Voice Recording"
   - Subheadline: e.g., "Transcribe clinical notes hands-free"
   - CTA: e.g., "Start 3-Day Free Trial"
   - Price display: "Then $9.99/month"
   - Features list:
     - Unlimited voice recordings
     - Real-time transcription
     - 30 minutes per session
     - Cancel anytime
5. Link your product to the purchase button
6. Save & Publish

### 2.7 Create Campaign

1. Go to **Campaigns** tab
2. Click **+ Create Campaign**
3. Fill in:
   - **Name**: Record Gate Campaign
   - **Placement**: Select `record_gate`
4. **Audience**:
   - Click **Add Filter**
   - Select: `Subscription Status` → `is` → `Inactive`
5. **Paywall**: Select your paywall
6. **Status**: Set to Active
7. Save

### 2.8 Test in Sandbox

1. Go to **Settings** → **Testing**
2. Enable **Sandbox Mode** for development
3. Test purchases won't charge real money

---

## Part 3: PostHog Setup

### 3.1 Create Project

1. Go to [PostHog](https://app.posthog.com)
2. Sign up / Log in
3. Create new project → Name: `Cliniko Voice`

### 3.2 Get API Key

1. Go to **Settings** → **Project** → **Project API Key**
2. Copy the key
3. Add to `.env` as `EXPO_PUBLIC_POSTHOG_API_KEY`

### 3.3 Verify Events (After First Test)

1. Go to **Events** in PostHog
2. Look for these events:
   - `record_attempted`
   - `paywall_shown`
   - `trial_started`
   - `subscription_active`

---

## Part 4: Facebook SDK Setup

### 4.1 Create App in Meta

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Click **My Apps** → **Create App**
3. Select **Consumer** → **Next**
4. Fill in:
   - **App Name**: Cliniko Voice
   - **Contact Email**: Your email
5. Create App

### 4.2 Configure iOS Platform

1. In your app dashboard, go to **Settings** → **Basic**
2. Scroll to **Add Platform** → Select **iOS**
3. Fill in:
   - **Bundle ID**: Your app's bundle ID
4. Save Changes

### 4.3 Get App ID

1. Copy your **App ID** from the dashboard
2. Add to your `app.json` or native config:

```json
{
  "expo": {
    "ios": {
      "config": {
        "facebookAppId": "YOUR_FB_APP_ID",
        "facebookDisplayName": "Cliniko Voice"
      }
    }
  }
}
```

### 4.4 Configure Events

1. Go to **Events Manager** in Meta Business Suite
2. Your app events will appear here after first test
3. Look for:
   - `fb_mobile_complete_registration`
   - `StartTrial`
   - `Subscribe`

---

## Part 5: TestFlight Setup

### 5.1 Build for TestFlight

```bash
# In your project directory
eas build --platform ios --profile preview
```

Or if using Xcode directly:
1. Product → Archive
2. Distribute App → App Store Connect
3. Upload

### 5.2 Create Test Group

1. In App Store Connect, go to **TestFlight** tab
2. Click **+** next to Internal Testing or External Testing
3. **Internal**: Your team (up to 100, instant)
4. **External**: Beta testers (up to 10,000, requires review)

### 5.3 Add Testers

1. Click your test group
2. Click **+** → Add testers by email
3. They'll receive TestFlight invitation

### 5.4 Test In-App Purchases

1. On test device, sign out of App Store
2. When prompted to purchase, sign in with Sandbox tester account
3. Sandbox purchases are free and renewable

---

## Part 6: Production Checklist

Before submitting for App Store review:

### App Store Connect
- [ ] App screenshots uploaded (all required sizes)
- [ ] App description written
- [ ] Keywords added
- [ ] Privacy Policy URL added
- [ ] Support URL added
- [ ] Age Rating completed
- [ ] In-App Purchase approved (may need separate review)

### Superwall
- [ ] Paywall design finalized
- [ ] Campaign active
- [ ] Sandbox mode disabled for production

### Code
- [ ] Remove `__DEV__` logging from production builds
- [ ] Verify environment variables are set for production

### Legal
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Auto-renewal subscription disclosure in app

---

## Quick Reference

### Product IDs
| Product | ID |
|---------|-----|
| Pro Monthly | `com.clinikovoice.pro.monthly` |

### Superwall Placement
| Placement | Identifier |
|-----------|------------|
| Record Gate | `record_gate` |

### Entitlements
| Entitlement | Identifier |
|-------------|------------|
| Pro Access | `pro` |

### Analytics Events

**PostHog:**
- `record_attempted`
- `paywall_shown`
- `trial_started`
- `subscription_active`

**Facebook:**
- `fb_mobile_complete_registration`
- `StartTrial`
- `Subscribe`

---

## Troubleshooting

### Paywall Not Showing
1. Check Superwall API key is correct
2. Verify placement identifier matches (`record_gate`)
3. Check campaign is active
4. Verify audience filter (subscription inactive)

### Purchase Not Working
1. Verify Product ID matches exactly between App Store Connect and Superwall
2. Ensure product is in "Ready to Submit" or approved state
3. Check you're signed in with Sandbox tester on device

### Events Not Appearing
1. Events may take a few minutes to appear
2. Check API keys are correct
3. Verify SDK initialization in `_layout.tsx`

---

## Support Links

- [Superwall Docs](https://docs.superwall.com)
- [App Store Connect Help](https://help.apple.com/app-store-connect)
- [PostHog Docs](https://posthog.com/docs)
- [Facebook SDK Docs](https://developers.facebook.com/docs/ios)
