# Visual Identity Color Distribution Review

Date: 2026-06-21

## 1. Current branch
main

## 2. Starting commit
ee2abed

## 3. Files reviewed
- public/styles.css
- public/css/tokens.css
- public/css/app.css (load order)
- public/css/components.css
- public/css/layout.css
- public/app.js (button/active class references)

## 4. Primary colors found

In styles.css (correct palette):
  --mrfq-aqua:      #75CEC8
  --mrfq-green:     #00A488
  --mrfq-teal:      #00848D
  --mrfq-dark-teal: #005257
  --mrfq-navy:      #002F56

In tokens.css (BEFORE fix — wrong overrides):
  --mrfq-navy:   #0b2732  ← overriding correct #002F56
  --mrfq-teal:   #005257  ← overriding correct #00848D with dark-teal value
  --mrfq-green:  #2f6f5e  ← overriding correct #00A488 with wrong dark green
  --mrfq-canvas: #f4f7f6  ← unique token, unused

## 5. Where #005257 was used (before fix)
- styles.css: --mrfq-dark-teal (correct)
- styles.css: --btn-primary-hover (wrong — was used as button hover)
- tokens.css: --mrfq-teal (wrong override — caused brand-mid to resolve to dark-teal)
- gradients, headers, topbar — appropriate use

## 6. Where #00A488 was used (before fix)
- styles.css: --mrfq-green definition — correct, but overridden by tokens.css to #2f6f5e

## 7. Buttons reviewed
- .btn (primary) — was using --btn-primary-bg: #00848D → corrected to #00A488
- .btn:hover — was using --btn-primary-hover: #005257 → corrected to #00848D
- .btn.ok — same token, inherits fix
- .btn.secondary — uses --mrfq-green for border, now correctly resolves to #00A488
- .btn.ghost — uses --brand-mid for hover border, now correctly #00848D

## 8. Sidebar active reviewed
- .navBtn.active: gradient(--brand-dark → --brand)
  Before fix: gradient(#005257 → #2f6f5e) — two dark colors
  After fix:  gradient(#005257 → #00A488) — correct teal-to-green gradient
- .mobileBottomNav-item.active: color --mrfq-green
  Before fix: #2f6f5e (wrong dark green)
  After fix:  #00A488 (correct bright green)
- .mobileMoreItem.active: color --brand-dark (#005257) — appropriate, unchanged

## 9. Badges/status reviewed
- .badge.brand: uses --brand → now correctly #00A488
- .badge.role-fm: uses --brand → now correctly #00A488
- .filterChip.active: color --mrfq-green → now correctly #00A488
- .fieldTab.active: color --mrfq-green → now correctly #00A488
- .kpiCard-status.brand: uses --brand-mid → now correctly #00848D
- .kpiCard-icon.brand: uses --brand-mid → now correctly #00848D
- .progress-fill.brand: gradient(--brand → --brand-mid) → now #00A488 → #00848D ✅

## 10. Changes applied

File 1: public/css/tokens.css
  Removed 4 conflicting :root overrides (--mrfq-navy, --mrfq-teal, --mrfq-green, --mrfq-canvas)
  that were overriding the correct palette defined in styles.css.
  Replaced with a single comment pointing to styles.css as the source of truth.

File 2: public/styles.css
  Changed --btn-primary-bg from #00848D to #00A488
  Changed --btn-primary-hover from #005257 to #00848D

## 11. Before/after explanation

Before:
  tokens.css was loaded after styles.css (see app.css import order).
  This caused --mrfq-teal to resolve to #005257 and --mrfq-green to resolve to #2f6f5e
  in all elements using --brand and --brand-mid.
  Result: buttons, nav active, badges, chips, tabs all rendered in dark teal/dark green.

After:
  tokens.css no longer overrides palette variables.
  --mrfq-green = #00A488 (bright teal-green) — primary actions
  --mrfq-teal  = #00848D (secondary teal) — hover/secondary
  --mrfq-dark-teal = #005257 — gradients, header, strong emphasis only
  Primary buttons: #00A488 → hover #00848D
  Active nav gradient: #005257 → #00A488 (dark to light, correct)

## 12. Confirmation

Palette unchanged:                yes — no new colors added or removed
Primary action restored to #00A488: yes — --btn-primary-bg and --brand
Hover/secondary uses #00848D:       yes — --btn-primary-hover and --brand-mid
Dark teal limited to support use:   yes — only in gradient start, header, strong emphasis

## 13. Tests result
121/121 passed, 0 failed

## 14. Security test result
inlineHandlers: 0, inlineStyles: 0, cssomStyles: 0, failures: []

## 15. Smoke test result
30/30 passed; overall average 0.53 ms

## 16. CSP status
unchanged — inline allowances remain closed; script-src-attr 'none'; style-src-attr 'none'

## 17. Remaining visual notes
- Physical device QA pending (112 cases) — color change needs on-device visual confirmation
- Gradient on .navBtn.active now uses correct range; may appear lighter than before — expected
- All other layout, spacing, typography unchanged
