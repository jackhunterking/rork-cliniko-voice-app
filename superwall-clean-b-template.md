# Superwall Template: Clean B Timeline Paywall

Step-by-step guide to build this paywall in Superwall's visual editor.

---

## Colors Reference (HEX only)

| Name | Hex |
|------|-----|
| Teal Primary | `#007FA3` |
| Teal Gradient Start | `#0891B2` |
| Teal Gradient End | `#0E7490` |
| White | `#FFFFFF` |
| Card Background | `#FFFFFF` |
| Page Background | `#F8FAFC` |
| Text Primary | `#1A1A1A` |
| Text Secondary | `#6B7280` |
| Text Tertiary | `#9CA3AF` |
| Step Icon BG | `#E6F2F5` |
| Divider Line | `#E5E7EB` |
| Pill Background | `#FFFFFF33` |

---

## Step-by-Step Build

### 1. Simple Navbar

In **Layout panel** (left side), click **Simple Navbar**.

**Right panel settings:**
- Tap the **X icon** element
- **Size → Width**: 32 px
- **Size → Height**: 32 px
- **Corners → Radius**: 16 px
- **Fill**: `#FFFFFF33`
- **Color** (icon): `#FFFFFF`
- **Tap Behavior**: Add Action → Close

---

### 2. Main → Heading Section

In **Layout panel**, expand **Main** → click **Heading**.

#### 2a. Icon Circle

Click **+ Add Element** → **Icon**

**Right panel settings:**
- **Size → Width**: 48 px
- **Size → Height**: 48 px
- **Corners → Radius**: 24 px
- **Fill**: `#FFFFFF2E`
- **Icon**: microphone (or mic)
- **Color** (icon): `#FFFFFF`
- **Padding**: 12 px all sides

#### 2b. Headline Text

Click first **Text** under Heading.

**Right panel settings:**
- **Content**: `Clinical Voice`
- **Font Size**: 28 px
- **Font Weight**: Extra Bold (800)
- **Color**: `#FFFFFF`
- **Alignment**: Center

#### 2c. Subheadline Text

Click second **Text** under Heading.

**Right panel settings:**
- **Content**: `Document with your voice`
- **Font Size**: 14 px
- **Font Weight**: Regular (400)
- **Color**: `#FFFFFFD9`
- **Alignment**: Center
- **Margin → Top**: 4 px

---

### 3. Feature Pills Row

Under **Main**, click **+ Add Element** → **Stack** (horizontal).

**Stack settings:**
- **Direction**: Horizontal
- **Alignment**: Center
- **Gap**: 8 px
- **Margin → Bottom**: 20 px

#### 3a. Create First Pill

Inside the Stack, click **+ Add Element** → **Stack** (horizontal).

**Pill Stack settings:**
- **Direction**: Horizontal
- **Fill**: `#FFFFFF33`
- **Corners → Radius**: 20 px
- **Padding → Vertical**: 6 px
- **Padding → Horizontal**: 12 px
- **Gap**: 5 px

Inside this pill, add:

**Icon:**
- **Icon**: microphone
- **Size**: 14 px
- **Color**: `#FFFFFF`

**Text:**
- **Content**: `Recording`
- **Font Size**: 12 px
- **Font Weight**: Semi Bold (600)
- **Color**: `#FFFFFF`

#### 3b. Duplicate for Other Pills

Duplicate the pill 2 more times. Update each:

| Pill | Icon | Text |
|------|------|------|
| 1 | microphone | Recording |
| 2 | zap / lightning | Transcription |
| 3 | send / arrow-right | Cliniko Sync |

---

### 4. Body (White Card)

In **Layout panel**, click **Body**.

**Right panel settings:**
- **Fill**: `#FFFFFF`
- **Corners → Radius**: 20 px
- **Padding**: 24 px all sides
- **Margin → Horizontal**: 24 px
- **Shadow**: Enable
  - **Color**: `#00000014`
  - **Offset X**: 0 px
  - **Offset Y**: 8 px
  - **Blur**: 20 px

---

### 5. Card Title

Inside **Body**, click **+ Add Element** → **Text**.

**Right panel settings:**
- **Content**: `3-Day Free Trial`
- **Font Size**: 20 px
- **Font Weight**: Bold (700)
- **Color**: `#1A1A1A`
- **Alignment**: Center
- **Margin → Bottom**: 20 px

---

### 6. Timeline Steps

Inside **Body**, click **+ Add Element** → **Stack** (vertical).

**Steps Stack settings:**
- **Direction**: Vertical
- **Margin → Bottom**: 24 px

#### 6a. Step 1 - Today

Add **Stack** (horizontal) inside Steps Stack.

**Row settings:**
- **Direction**: Horizontal
- **Alignment**: Center (vertical)

**Icon Circle:**
- Click **+ Add Element** → **Icon**
- **Size → Width**: 32 px
- **Size → Height**: 32 px
- **Corners → Radius**: 16 px
- **Fill**: `#E6F2F5`
- **Icon**: sparkles (or star)
- **Color** (icon): `#007FA3`
- **Margin → Right**: 12 px

**Text Stack** (vertical, next to icon):
- Click **+ Add Element** → **Stack** (vertical)

**Label Text:**
- **Content**: `Today`
- **Font Size**: 14 px
- **Font Weight**: Bold (700)
- **Color**: `#007FA3`

**Description Text:**
- **Content**: `Try everything free`
- **Font Size**: 13 px
- **Font Weight**: Regular (400)
- **Color**: `#6B7280`

#### 6b. Divider Line

After Step 1 row, add **+ Add Element** → **View** (rectangle).

**Right panel settings:**
- **Size → Width**: 2 px
- **Size → Height**: 16 px
- **Fill**: `#E5E7EB`
- **Margin → Left**: 15 px
- **Margin → Vertical**: 4 px

#### 6c. Step 2 - Day 2

Duplicate Step 1 row. Update:

- **Icon**: clock
- **Label**: `Day 2`
- **Description**: `Explore at your pace`

#### 6d. Divider Line

Add another divider (same as 6b).

#### 6e. Step 3 - Day 3

Duplicate Step 1 row. Update:

- **Icon**: check / checkmark
- **Label**: `Day 3`
- **Description**: `Billing begins`

---

### 7. CTA Button

Inside **Body**, click **+ Add Element** → **Button**.

**Right panel settings:**
- **Content**: `Start Free Trial`
- **Size → Width**: 100%
- **Size → Height**: 50 px
- **Fill**: `#007FA3`
- **Corners → Radius**: 14 px
- **Font Size**: 16 px
- **Font Weight**: Bold (700)
- **Color** (text): `#FFFFFF`
- **Margin → Bottom**: 10 px
- **Tap Behavior**: Add Action → Purchase

---

### 8. Price Note

Inside **Body**, click **+ Add Element** → **Text**.

**Right panel settings:**
- **Content**: `$14.99/mo after trial · Cancel anytime`
- **Font Size**: 12 px
- **Font Weight**: Regular (400)
- **Color**: `#6B7280`
- **Alignment**: Center

**With variables:**
```
{{product.price}}/mo after trial · Cancel anytime
```

---

### 9. Fixed Drawer (Footer)

In **Layout panel**, click **Fixed Drawer**.

**Right panel settings:**
- **Padding → Bottom**: 16 px
- **Alignment**: Center

#### 9a. Restore Purchases

Click **+ Add Element** → **Text**.

**Right panel settings:**
- **Content**: `Restore Purchases`
- **Font Size**: 13 px
- **Font Weight**: Medium (500)
- **Color**: `#6B7280`
- **Tap Behavior**: Add Action → Restore

#### 9b. Legal Links

Click **+ Add Element** → **Text**.

**Right panel settings:**
- **Content**: `Terms · Privacy`
- **Font Size**: 11 px
- **Font Weight**: Regular (400)
- **Color**: `#9CA3AF`
- **Margin → Top**: 6 px

Or use two separate text elements with tap actions:
- Terms → Open URL → `https://yourapp.com/terms`
- Privacy → Open URL → `https://yourapp.com/privacy`

---

## Header Gradient Background

Select **Main** in Layout panel.

**Right panel settings:**
- **Fill**: Gradient
- **Type**: Linear
- **Angle**: 135° (top-left to bottom-right)
- **Color 1**: `#0891B2`
- **Color 2**: `#0E7490`

Set gradient to cover only top ~35% of screen, or apply to a wrapper Stack at the top.

---

## Superwall Variables

| Variable | Example Output |
|----------|----------------|
| `{{product.price}}` | $14.99 |
| `{{product.trialPeriodDays}}` | 3 |

**Dynamic examples:**
- Title: `{{product.trialPeriodDays}}-Day Free Trial`
- Price: `{{product.price}}/mo after trial`

---

## Final Checklist

- [ ] Simple Navbar with close X button
- [ ] Mic icon circle in header
- [ ] "Clinical Voice" headline
- [ ] "Document with your voice" subheadline
- [ ] 3 feature pills (Recording, Transcription, Cliniko Sync)
- [ ] White card with shadow
- [ ] "3-Day Free Trial" card title
- [ ] Step 1: Today - Try everything free
- [ ] Divider line
- [ ] Step 2: Day 2 - Explore at your pace
- [ ] Divider line
- [ ] Step 3: Day 3 - Billing begins
- [ ] CTA button "Start Free Trial"
- [ ] Price note text
- [ ] Restore Purchases link
- [ ] Terms · Privacy links
- [ ] Gradient background on header
- [ ] Test on iPhone preview
- [ ] Connect purchase action to CTA button
