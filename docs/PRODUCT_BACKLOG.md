# Daypath Product Backlog

Updated: 2026-07-30

This backlog merges the EARTHWORK/PROOF and Groundwork/Daily Dig research into one evidence-honest Daypath product plan. It also includes testing feedback from the first Android APK and the recommended safety, accessibility, privacy, AI, soundscape, and validation controls.

## Product principle

Daypath is a guided self-reflection, self-regulation, and behavior-change experience. It helps a user notice a recurring pattern, understand its possible protective function without excusing harm, choose a value, perform one observable action, record evidence, and recover after misses.

Daypath is not psychotherapy, diagnosis, emergency support, medical treatment, or a system that can measure or guarantee dendritic or neurological change.

## Unified Daypath session

Use one user-facing six-part flow rather than presenting two competing methods.

1. **Settle** — present orientation and optional regulation.
2. **Notice** — facts, body signals, emotions, thoughts, urges, behavior, and results.
3. **Understand** — possible protective function, immediate payoff, cost, need, old rule, and optional history.
4. **Turn** — separate past from present, retain useful information, choose a value, name the real obstacle, and define a credible direction.
5. **Act** — create a minimum proof action, cue, obstacle response, environmental support, and recovery plan.
6. **Close** — record evidence, park unfinished material with a plan, check activation, and end the session explicitly.

Internal research mappings:

- EARTHWORK / PROOF: Pause, Record, Own, Open, Forge.
- Groundwork / Daily Dig: Ground, Scan, Dig, Turn, Plant, Seal.

## Priority 0 — correctness, accessibility, and installable build quality

### Android safe-area navigation

The bottom navigation must remain above the Android system navigation area in gesture and three-button modes.

Implementation:

- Add `react-native-safe-area-context`.
- Wrap the app in `SafeAreaProvider`.
- Apply bottom inset to the navigation container and scroll-content padding.
- Do not rely on fixed bottom margins.
- Maintain a minimum 48 dp touch target.

Acceptance criteria:

- Home, Sessions, Progress, and Settings are fully tappable on a Galaxy S24 Ultra in gesture and three-button navigation modes.
- The navigation bar never intersects the Android system bar in portrait mode.
- The final scroll item can be moved fully above the navigation bar.

### Text contrast and typography

Implementation:

- Use dark forest or charcoal text on beige, gold, sand, and light scenic surfaces.
- Use warm white only on dark surfaces.
- Create semantic color tokens instead of one-off colors.
- Preserve readability over artwork with gradients, scrims, or solid content panels.
- Support large text and system font scaling without truncating controls.

Acceptance criteria:

- Normal text meets at least WCAG AA contrast targets where measurable.
- No essential information relies on low-opacity text.
- All screens remain usable at 200% font scaling.

### Build verification

Every APK workflow must:

- install dependencies;
- validate Expo configuration;
- generate the Android project;
- assemble the release APK;
- verify ZIP/APK integrity;
- verify the APK signature;
- verify package name, version code, and version name;
- create a SHA-256 checksum;
- upload the APK and verification reports.

## Priority 1 — safety and session integrity

### Green / amber / red activation gate

**Green:** proceed with the selected session.

**Amber:** shorten and contain. Disable deeper origin prompts, use present facts and external grounding, reduce the proof to under two minutes, and schedule a follow-up check.

**Red:** stop reflective processing. Present orientation, trusted-contact and professional-support options, and immediate-danger guidance. Do not continue generative questioning.

Acceptance criteria:

- Deep prompts cannot be shown while the user is in a red state.
- The AI layer cannot override fixed safety routing.
- A user can exit any prompt without losing already saved non-sensitive progress.

### Fact, memory, interpretation, and inference labels

All statements about causes, childhood, another person's motives, attachment, shadow material, or unconscious function must remain explicitly uncertain unless directly observed.

Required labels:

- Fact
- Memory
- Interpretation
- Inference
- Unknown

AI wording must prefer:

- “One possible function is…”
- “This resembles…”
- “The earliest example that comes to mind may or may not be the origin.”

It must not state that it discovered the user's trauma, wound, attachment style, hidden motive, or cause.

### Consent and deep-prompt gating

Childhood, grief, shame, wound, or retirement-letter prompts require:

- explicit opt-in;
- stable recent activation history;
- intact present orientation;
- no recent red-state session;
- a skip option;
- a present-focused alternative;
- a clear closing flow.

Calendar progress alone must never unlock deeper material.

### External grounding first

Breath focus is optional rather than universal. Offer:

- eyes-open visual orientation;
- sound orientation;
- tactile grounding;
- standing or walking;
- cool-object contact;
- user-selected paced breathing.

Never tell a user they are safe merely because they completed a breathing exercise.

### Close / Seal flow

Every reflective session ends with:

- activation re-check;
- one-line finding;
- completed evidence from the prior action, if any;
- unfinished material placed in a parking list with a date or next step;
- next action and check-in time;
- explicit session closure;
- a transition cue such as movement, water, or return to an external task.

## Priority 1 — core 63-session experience

### Three-season journey

Use the Groundwork arc as the high-level experience while preserving EARTHWORK safety and behavioral specificity.

#### Season 1 — Excavate / Observe

- Build safety and ritual.
- Define one behaviorally specific target.
- Learn facts, body signals, emotions, thoughts, urges, actions, and results.
- Identify triggers, payoffs, costs, and old rules.
- Teach fact/memory/inference separation before optional origin work.

#### Season 2 — Turn / Choose

- Clarify values and behavioral standards.
- Reassign the protector's useful signal.
- Reclaim the healthy expression of disowned qualities.
- Practice boundaries, requests, repair, predictable relationship behavior, and ordinary commitment.
- Build identity statements from evidence rather than affirmation.

#### Season 3 — Plant / Consolidate

- Increase the number and stakes of proof actions gradually.
- Prepare for lapses and high-risk contexts.
- Build a written slip-and-recovery protocol.
- Inventory evidence.
- Design maintenance and the next cycle.

### Progressive identity language

- Early: “I am practicing…”
- Middle: “I am increasingly able to…”
- Later: “The evidence shows I can…”
- Completion: a user-written statement linked to concrete examples.

Do not force absolute identity claims.

### Weekly Compost / Review

First screen:

- What keeps appearing?
- What did I dodge?
- What worked?

Structured follow-up:

- session starts and completions;
- proof attempts and completions;
- recovery after misses;
- most frequent trigger;
- most frequent short-term payoff;
- earlier awareness;
- smaller damage;
- faster return;
- target safety and relevance;
- next calendar decision.

### Evidence Ledger

Separate:

- planned action;
- opportunity encountered;
- attempted action;
- completed action;
- result;
- value or quality practiced;
- lesson;
- next repetition.

Only completed or honestly attempted behavior counts as evidence. Intention alone does not.

### Recovery system

Combine Groundwork relapse education with EARTHWORK implementation precision.

Required fields:

- likely high-risk context;
- old pattern's opening move;
- minimum restart;
- next cue;
- environmental friction or support;
- witness or support contact, if chosen;
- repair action, if impact occurred.

One miss is data. No restart-from-zero rule.

## Priority 1 — immediate scenario guidance

### “Help Me Through This”

Scenarios are concrete life events, not diagnostic labels.

Examples:

- waiting for a reply;
- rejection;
- argument or anger surge;
- difficult conversation;
- setting a boundary;
- making an apology;
- serious mistake;
- shame spiral;
- grief wave;
- cannot start;
- decision paralysis;
- job or relationship change;
- financial stress;
- feeling overwhelmed without knowing why.

### Scenario flow

1. Field Reset.
2. Physical safety and urgency check.
3. Current activation.
4. Observable facts.
5. What is assumed or unknown.
6. What must happen now versus what can wait.
7. Likely urge and immediate payoff.
8. Chosen value.
9. One safe, reversible next action.
10. Close and schedule a check-in.
11. Save the event as a Sighting, not as a diagnosis.

### Field Reset

Make a 60–90 second reset available from every screen:

- Name: “I am reactive or overwhelmed right now.”
- Orient: external sight, sound, touch, or movement.
- Under it: identify a possible feeling without asserting certainty.
- Choose: decide the next thirty seconds intentionally.

Potential entry points:

- persistent in-app control;
- Android home-screen widget;
- quick settings tile;
- notification action;
- lock-screen shortcut where supported.

## Priority 1 — immersive nature experience

Daypath should feel like entering a restorative environment, not opening a form-based utility.

### Visual art direction

Core qualities:

- nature-based;
- hopeful;
- calm;
- spacious;
- premium;
- readable;
- non-clinical;
- non-mystical.

Visual worlds may include:

- Dawn
- Forest
- River
- Coast
- Mountain
- Rain
- Night Sky
- Ember
- Minimal

Section direction:

- Home: dawn, open horizon, welcoming path.
- Immediate support: shelter, rain easing, calm overlook.
- Settle: stable horizon and external natural detail.
- Notice: reflective water, clear structure, low visual noise.
- Understand: roots and layered earth without darkness or threat.
- Turn: clearing weather, widening path, changing light.
- Act: stepping stones, trail marker, bridge, or cultivated field.
- Progress: landscape becoming clearer through accumulated evidence.
- Settings: quieter and less scenic.

Artwork must never imply measured brain healing or neural growth.

### Motion

Use slow atmospheric movement, depth, light shifts, water, leaves, clouds, and restrained transitions.

Avoid:

- confetti after painful disclosures;
- rapid pulsing;
- fake neural animations;
- streak fireworks;
- emotionally manipulative reward effects.

Support reduced-motion mode.

### Soundscape engine

Audio is a configurable aid for comfort, attention, pacing, and state regulation. It is not a treatment claim.

Layers:

- nature ambience;
- low harmonic bed;
- sparse melodic fragments;
- optional subtle pulse;
- spoken guide;
- silence.

Session arc:

- Settle: stable and externally orienting.
- Notice: minimal and cognitively unobtrusive.
- Understand: warm, neutral, and contained.
- Turn: slightly more open harmonically.
- Act: gentle forward motion.
- Close: deceleration and resolution.

When activation rises, reduce density, melody, animation, and rhythmic complexity.

### Experimental audio

Solfeggio tones and binaural beats may exist only as optional experimental preference features with honest labeling.

Do not claim that a frequency releases trauma, repairs DNA, heals relationships, detoxifies cells, synchronizes brainwaves, or produces a specific psychological outcome.

## Priority 2 — AI assistance

AI is optional and disabled by default.

Modes:

- Private: no external AI.
- Current-session assistant: only the current session is shared.
- Limited history: user selects a time or target scope.
- Longitudinal coach: explicit opt-in to selected historical fields.

AI may:

- ask one question at a time;
- reflect the user's own language;
- distinguish fact from interpretation;
- suggest possible cognitive distortions;
- resize proof actions;
- help construct cue-action and recovery plans;
- draft requests, boundaries, and repair language;
- summarize repeated triggers and payoffs;
- identify rising post-session activation or rumination trends.

AI may not:

- diagnose;
- declare a hidden root or trauma;
- infer another person's motives as fact;
- advise unsafe confrontation or reconciliation;
- claim measured brain rewiring;
- recommend stopping medication or professional care;
- continue probing after the safety router stops the session.

All AI-generated text must be user-reviewable before it is saved as part of the user's record.

## Priority 2 — progress and practice horizon

Do not use a healing score or a dendrite countdown.

Track:

- sessions started;
- sessions completed;
- proof opportunities;
- proof attempts;
- proof completions;
- repeated actions in stable contexts;
- recovery after misses;
- median return time;
- awareness point in the behavior chain;
- self-reported impact;
- values-to-behavior alignment;
- post-session activation;
- post-session rumination or functional disruption.

Use stages such as:

- Building the ritual
- Mapping the pattern
- Practicing alternatives
- Gathering repeated evidence
- Emerging consistency
- Consolidating and maintaining

Explain that repeated practice can support learning and neuroplasticity, while Daypath cannot observe or predict dendritic change.

## Priority 2 — witness and support

Optional Witness feature:

- user chooses a trusted person;
- app prepares a two-line weekly update;
- user reviews and sends it manually;
- no free-text session history is included by default;
- user can disable or revoke access at any time;
- safety check warns against using a coercive, abusive, or critical person as a witness.

Potential professional export:

- user-selected date range;
- structured summary;
- separate facts from AI inferences;
- clear statement that Daypath output is not a diagnosis.

## Priority 2 — accessibility and neurodivergent support

- Voice, keyboard, stylus, and structured-choice input.
- Visible countdowns and pacing controls.
- Five-, ten-, fifteen-, and thirty-minute formats.
- Body-doubling mode.
- Skip, soften, and present-focused alternatives.
- Screen-reader labels and logical focus order.
- Color-independent safety labels.
- Hearing-sensitive mode.
- Dyslexia-friendly typography option.
- Offline session support.

Do not claim handwriting is the only valid route to consolidation.

## Priority 2 — privacy and security

- Local-only mode.
- Encrypted local database.
- Device-keystore-backed encryption keys.
- Biometric or PIN app lock.
- No sensitive text in notifications.
- Granular AI-sharing controls.
- Audit log of fields sent to an AI provider.
- Explicit retention and deletion controls.
- Encrypted backup and tested restore.
- No advertising SDKs in session flows.
- No sale of mental-health-adjacent data.
- No external model training on user content without separate explicit consent.
- Provider API secrets never stored in insecure mobile storage.

## Priority 3 — research and validation

The complete Daypath synthesis is new and unvalidated. Component evidence does not prove the whole product.

### Phase 1 — usability and harm feasibility

- 20–40 adults with non-acute target behaviors.
- Two-week pilot.
- Measure completion, proof rate, time, confusion, post-session activation, rumination, functional disruption, and adverse events.

### Phase 2 — mechanism pilot

Compare:

- full Daypath session;
- reflection-only condition without proof action;
- credible educational or waitlist control.

Measure target behavior, recovery latency, value-consistent action, impairment, rumination, psychological flexibility, self-efficacy, and identity-behavior congruence.

### Phase 3 — full program evaluation

- larger and more diverse sample;
- credible active comparison;
- preregistration;
- blinded outcome assessment where practical;
- adverse-event and attrition reporting;
- follow-up after completion;
- publish protocol deviations and all outcomes.

## Product-language guardrails

Acceptable:

- “A guided behavior-change and self-reflection experience.”
- “Built from metacognitive reflection, values work, behavioral planning, and carefully bounded shadow inquiry.”
- “Designed to help create one small value-consistent action per session.”
- “Progress is measured through practice, evidence, and recovery.”

Not acceptable without future direct evidence:

- “Clinically proven to rewire identity.”
- “Heals trauma in 63 days.”
- “Changes dendrites on a predictable schedule.”
- “Destroys toxic thoughts.”
- “Proves healing through brainwaves.”
- “Works as well as therapy or medication.”

## Proposed release sequence

### v0.2 — UX correction

- Android safe area.
- Contrast and typography system.
- Larger touch targets.
- Nature-based home and scenario artwork.
- No new deep-method features until basic accessibility is stable.

### v0.3 — session foundation

- Unified six-part session.
- Activation stoplight.
- Fact/memory/inference tags.
- Close / Seal.
- Evidence Ledger.
- Field Reset.

### v0.4 — guided journey

- 63-session three-season curriculum.
- Weekly Compost review.
- Recovery protocol.
- Progressive identity language.
- Maintenance phase.

### v0.5 — immersive environment

- Persistent soundscape engine.
- Section-responsive nature scenes.
- Visual worlds.
- Reduced-motion and hearing-sensitive modes.

### v0.6 — optional intelligence

- Private deterministic guidance.
- Optional ChatGPT and Claude integrations.
- Granular sharing controls.
- Longitudinal summaries with safety limits.

### v0.7 — study-ready build

- Research consent and study mode.
- Adverse-event reporting.
- Validated outcome measures selected with qualified research oversight.
- Exportable de-identified research data.

## Immediate next engineering work

1. Fix Android bottom inset and navigation touchability.
2. Replace low-contrast beige-card text.
3. Introduce semantic design tokens and safe-area tests.
4. Add one high-quality nature scene to Home and one to Immediate Guidance as the first visual-system proof.
5. Add a non-functional soundscape design specification before implementing audio assets.
6. Refactor the current five-step prototype into the unified six-part session model.
7. Build activation routing before adding any deeper prompts.
