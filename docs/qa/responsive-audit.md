# Responsive Audit

Browser verification date: 2026-06-19. The DOM was inspected at each target width for document overflow, operational control overflow, sidebar/bottom navigation behavior, and Facilities heatmap columns.

| Page | iPhone | iPad | Laptop | Desktop | Issue | Fix | Evidence |
|---|---|---|---|---|---|---|---|
| Login | Pass: 375/390/430 | Pass | Pass | Pass | None observed | Existing responsive login retained | At 375: scroll width = viewport width; zero overflowing controls |
| System Admin | Pass: bottom nav | Pass: tablet nav | Pass: sidebar | Pass: sidebar | Dense legacy surface | Responsive CSS slices added | No document/control overflow at all seven widths |
| Facilities & Spaces | 2 heat columns | 3 heat columns | 5 at 1366 | 5 at 1440 | New screen needed explicit breakpoints | Mobile/tablet/desktop grid rules | 375,390,430,768,1024,1366,1440 browser measurements |
| Heatmap | Pass | Pass | Pass | Pass | Legacy map was not weighted | Risk-grid renderer added | 9 spaces rendered with score, level, building and floor |
| Employee/Worker/Supervisor/Manager | Existing smoke coverage | Existing tablet shell | Existing sidebar/content rules | Existing desktop rules | Full device walkthrough remains | Safe-area, cards, modal and table rules retained | Source audit + existing workflow tests; manual release QA still required |
| Modals | Full-width mobile behavior | Bounded | Bounded | Bounded | None observed in CSS audit | Existing fullscreen/bottom-sheet rules retained | Mobile media rules at 768 and 400 |
| Tables/Forms | Scroll/card-compatible container | Scrollable | Readable | Readable | Semantic card conversion is not universal | Bounded table wrappers and control widths | No page-level horizontal overflow |

The automated pass is evidence of layout integrity, not a replacement for manual testing on physical iOS/iPadOS devices, keyboard navigation, VoiceOver, and production data volumes.

## Verification scope

Completed:

- Browser viewport simulation.
- Widths: 375, 390, 430, 768, 1024, 1366, and 1440+ pixels.

Pending:

- Physical iPhone Safari.
- Physical iPhone Chrome.
- Physical iPad Safari Portrait.
- Physical iPad Safari Landscape.
- Mac Safari.
- Mac Chrome.
- Windows Chrome.
- Windows Edge.

| Device/Browser | Status | Notes | Blocking Issue |
|---|---|---|---|
| Simulated browser 375/390/430 | Completed | Layout and overflow checks | Not a physical-device result |
| Simulated browser 768/1024 | Completed | Portrait/landscape width checks | Not iPadOS Safari |
| Simulated browser 1366/1440+ | Completed | Desktop layout checks | Not OS/browser matrix |
| Physical iPhone Safari | Pending | Required before production approval | Device lab unavailable in this phase |
| Physical iPhone Chrome | Pending | Required before production approval | Device lab unavailable in this phase |
| Physical iPad Safari Portrait | Pending | Required before production approval | Device lab unavailable in this phase |
| Physical iPad Safari Landscape | Pending | Required before production approval | Device lab unavailable in this phase |
| Mac Safari | Pending | Required before production approval | Manual browser matrix pending |
| Mac Chrome | Pending | Required before production approval | Manual browser matrix pending |
| Windows Chrome | Pending | Required before production approval | Windows environment pending |
| Windows Edge | Pending | Required before production approval | Windows environment pending |

Readiness scores must not treat viewport simulation as physical-device certification.

