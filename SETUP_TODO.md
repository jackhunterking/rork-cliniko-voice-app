# Cliniko Voice - Setup TODO List

## Your App Details
- **Bundle ID**: `app.cliniko-voice`
- **Product ID**: `com.clinikovoice.pro.monthly`
- **Placement**: `record_gate`
- **Entitlement**: `pro`

---

## 1. App Store Connect Setup
> URL: https://appstoreconnect.apple.com

### Create App
- [ ] My Apps → + → New App
- [ ] Platform: iOS
- [ ] Name: `Cliniko Voice`
- [ ] Bundle ID: `app.cliniko-voice`
- [ ] SKU: `cliniko-voice-ios`

### Create In-App Purchase
- [ ] Go to your app → Monetization → In-App Purchases
- [ ] Click + → Auto-Renewable Subscription
- [ ] Reference Name: `Cliniko Voice Pro Monthly`
- [ ] Product ID: `com.clinikovoice.pro.monthly`
- [ ] Subscription Duration: 1 Month
- [ ] Create Subscription Group: `Cliniko Voice Pro`

### Configure Pricing & Trial
- [ ] Add Subscription Price (e.g., $9.99/month)
- [ ] Introductory Offers → + → Free Trial → 3 Days

### Add Localization
- [ ] App Store Localization → English (U.S.)
- [ ] Display Name: `Pro Monthly`
- [ ] Description: `Unlimited voice recording and transcription for clinical notes.`

### Create Sandbox Tester
- [ ] Users and Access → Sandbox tab → +
- [ ] Add email for testing (use different email than Apple ID)

---

## 2. Superwall Dashboard Setup
> URL: https://superwall.com/dashboard

### Create App
- [ ] Sign in / Create account
- [ ] Create App → iOS
- [ ] App Name: `Cliniko Voice`
- [ ] Bundle ID: `app.cliniko-voice`

### Get API Key
- [ ] Settings → Keys
- [ ] Copy Public API Key
- [ ] Add to `.env` as `EXPO_PUBLIC_SUPERWALL_API_KEY`

### Add Product
- [ ] Products tab → + Add Product
- [ ] Product ID: `com.clinikovoice.pro.monthly` (exact match!)
- [ ] Name: `Pro Monthly`
- [ ] Type: Subscription

### Verify Entitlement
- [ ] Products → Entitlements tab
- [ ] Ensure `pro` exists (default)
- [ ] Link product to `pro` entitlement

### Create Placement
- [ ] Placements tab → + Add Placement
- [ ] Name: `record_gate`
- [ ] Identifier: `record_gate`

### Create Paywall
- [ ] Paywalls tab → + Create Paywall
- [ ] Design with: headline, price, trial info, features
- [ ] Link product to purchase button
- [ ] Save & Publish

### Create Campaign
- [ ] Campaigns tab → + Create Campaign
- [ ] Name: `Record Gate Campaign`
- [ ] Placement: `record_gate`
- [ ] Audience Filter: Subscription Status → is → Inactive
- [ ] Paywall: Select your paywall
- [ ] Status: Active

---

## 3. PostHog Setup
> URL: https://app.posthog.com

- [ ] Sign in / Create account
- [ ] Create project: `Cliniko Voice`
- [ ] Settings → Project → Copy Project API Key
- [ ] Add to `.env` as `EXPO_PUBLIC_POSTHOG_API_KEY`

---

## 4. Facebook/Meta Setup (Optional for MVP)
> URL: https://developers.facebook.com

- [ ] My Apps → Create App → Consumer
- [ ] App Name: `Cliniko Voice`
- [ ] Settings → Basic → Add Platform → iOS
- [ ] Bundle ID: `app.cliniko-voice`
- [ ] Copy App ID for later use

---

## 5. TestFlight Setup

### Build & Upload
- [ ] Run: `eas build --platform ios --profile preview`
- [ ] Or: Xcode → Product → Archive → Distribute

### Create Test Group
- [ ] App Store Connect → TestFlight tab
- [ ] Create Internal Testing group
- [ ] Add tester emails

### Test Purchases
- [ ] Sign out of App Store on device
- [ ] Use Sandbox tester account when purchasing
- [ ] Verify paywall shows and purchase completes

---

## 6. Final Verification Checklist

### Environment Variables
- [ ] `EXPO_PUBLIC_SUPERWALL_API_KEY` is set
- [ ] `EXPO_PUBLIC_POSTHOG_API_KEY` is set

### Superwall
- [ ] Product ID matches App Store Connect exactly
- [ ] Campaign is active
- [ ] Audience filter set to inactive subscribers

### Test Flow
- [ ] Open app as non-subscriber
- [ ] Tap mic button on recording screen
- [ ] Paywall appears
- [ ] Start trial (sandbox)
- [ ] Recording works after purchase

---

## Quick Links

| Service | URL |
|---------|-----|
| App Store Connect | https://appstoreconnect.apple.com |
| Superwall | https://superwall.com/dashboard |
| PostHog | https://app.posthog.com |
| Meta Developers | https://developers.facebook.com |

---

## Notes

- Product ID must be **identical** between App Store Connect and Superwall
- Sandbox purchases are free and auto-renew every few minutes for testing
- Events may take a few minutes to appear in analytics dashboards
- For production, disable Superwall sandbox mode
