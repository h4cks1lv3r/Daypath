# Daypath Backlog Addendum: Content Voice and Original Soundscapes

Updated: 2026-07-31

This addendum is part of the Daypath product backlog. It defines how the user's original music and soundscapes should be integrated and establishes a plain-language content standard for every screen, guided session, scenario, notification, AI response, and safety flow.

## Product decision

Daypath should feel like a compassionate guided experience, not a psychology textbook, branded methodology course, or collection of abstract self-help terms.

The app may retain research terms internally for implementation and traceability, but user-facing language must use ordinary words that clearly explain what the person is being asked to notice or do.

The tone may be therapeutic, warm, and emotionally supportive, but Daypath must not present itself as psychotherapy, diagnosis, emergency care, or medical treatment.

## Priority 0: replace coined, clinical, and vague language

### User-facing language rule

Before any prompt is shipped, ask:

1. Would an adult with no psychology background understand this immediately?
2. Does the wording explain what to do rather than naming a concept?
3. Does it sound compassionate without becoming patronizing or falsely reassuring?
4. Does it leave room for uncertainty rather than telling the user what their experience means?
5. Could a distressed person understand it without additional explanation?

If the answer to any of these is no, rewrite the prompt.

### Terms that should remain internal only

The following may be useful in research notes, analytics schemas, or engineering documentation, but should not appear unexplained in the normal user experience:

- activation
- green / amber / red state
- protector
- shadow
- proof action
- evidence ledger
- sighting
- witness
- field reset
- seal
- compost day
- implementation intention
- cognitive distortion
- mental contrasting
- puer or provisional-life terminology
- neuroplasticity stage

These terms should never be required knowledge for using the app.

### Recommended plain-language replacements

| Internal term | Preferred user-facing wording |
|---|---|
| Rate your activation | How intense or overwhelming does this feel right now? |
| Activation 0–10 | Choose the number that best matches how hard this feels right now. |
| Green state | You seem steady enough to continue. |
| Amber state | Let’s slow this down and keep it simple. |
| Red state | Let’s stop the deeper questions and focus on immediate support. |
| Protector | The part of you that may be trying to prevent something painful or difficult. |
| Old rule | What did you learn you had to do to get through situations like this? |
| Proof action | One small action you can take in real life. |
| Evidence Ledger | What you tried and what happened. |
| Sighting | A recent time this pattern showed up. |
| Witness | A trusted person you choose to keep updated. |
| Field Reset | Help me steady myself. |
| Seal the session | Close the session and set aside anything unfinished. |
| Compost Day | Weekly review. |
| Implementation intention | When this situation happens, what will you do? |
| Cognitive distortion | Is your mind making a prediction, assumption, or all-or-nothing judgment? |
| Mental contrasting | What do you hope will happen, and what inside you may get in the way? |

### Intensity question design

Replace the unexplained instruction “rate your activation” with a full question and anchored scale:

> How intense or overwhelming does this feel right now?
>
> **0** — I feel calm or steady.  
> **3** — I feel uncomfortable, but I can think clearly.  
> **5** — This feels difficult and I need to slow down.  
> **7** — I feel overwhelmed or disconnected from the present.  
> **10** — I may not be able to handle this safely by myself right now.

The interface should not rely on a bare number. It should show short descriptions and allow the user to say “I’m not sure.”

### Safety language

Internal safety routing may still use fixed thresholds, but the user should see direct, calm wording:

- **Continue:** “You seem able to stay with the present moment. We can continue, and you can stop at any time.”
- **Slow down:** “This feels like a lot. Let’s stay with what is happening right now and choose one small next step.”
- **Stop deeper questions:** “We’re going to stop the deeper questions. Let’s focus on where you are, what you can see, and who can support you.”

Do not tell a user that they are safe when the app cannot know that. Ask whether they are physically safe and provide appropriate next-step options.

## Priority 0: empathetic content design system

### Voice qualities

Daypath should sound:

- clear;
- warm;
- grounded;
- respectful;
- patient;
- nonjudgmental;
- emotionally honest;
- hopeful without making promises.

Daypath should not sound:

- clinical;
- mystical;
- preachy;
- overly cheerful during distress;
- authoritative about hidden causes;
- congratulatory after painful disclosures;
- robotic or checklist-driven;
- dependent on branded psychological terms.

### Prompt-writing rules

- Ask one question at a time.
- Use short sentences during high distress.
- Explain why a question is being asked when the reason is not obvious.
- Prefer concrete examples over abstract labels.
- Reflect the user’s own words rather than replacing them with theory.
- Use possibility language: “may,” “might,” “could,” and “does this fit?”
- Distinguish observation from interpretation.
- Never announce a root cause, wound, attachment style, diagnosis, or another person’s motive.
- Avoid “toxic,” “broken,” “damaged,” “failed,” and similar identity-level labels.
- Do not praise disclosure intensity. Recognize honesty, effort, and responsible action specifically.
- Do not force positive reframing when grief, anger, disappointment, or accountability is appropriate.
- Make every screen understandable without prior sessions or a glossary.

### Example rewrites

Instead of:

> Identify the protector’s hidden payoff.

Use:

> What did this response help you avoid or get through in the moment?

Instead of:

> Separate fact from inference.

Use:

> What do you know happened, and what are you guessing or interpreting?

Instead of:

> Choose a value-consistent proof action.

Use:

> What matters to you here, and what is one small action that would reflect that today?

Instead of:

> Reassign the protector.

Use:

> Is there anything useful in this response—such as noticing danger, unfairness, or a need—that you want to keep, while choosing a different way to act?

Instead of:

> Log your recovery after a lapse.

Use:

> What happened, what did you learn, and what is the smallest way to begin again?

### Content review requirement

Every release containing new prompts must include a content review covering:

- plain-language comprehension;
- emotional tone;
- uncertainty and non-diagnostic wording;
- safety escalation wording;
- accessibility at moments of distress;
- consistency across deterministic and AI-generated guidance.

At least one test pass should involve people unfamiliar with the research terminology.

## Priority 1: integrate the user's original music and soundscapes

The user has created original music and soundscape assets for Daypath. These should become the primary audio identity of the product rather than placeholder or third-party music.

### Asset intake

When the files are supplied, create an asset inventory containing:

- title;
- filename;
- composer / creator credit;
- ownership and permitted-use confirmation;
- duration;
- source format and sample rate;
- intended mood or section;
- whether it loops;
- recommended loop points;
- presence of speech, percussion, binaural content, or sustained tones;
- suggested default volume;
- notes about tinnitus, headphone use, or intensity where applicable.

Do not rename or recompress master files destructively. Keep archival masters separate from app-ready derivatives.

### Audio preparation pipeline

- Preserve lossless masters outside the shipped application bundle.
- Produce app-ready files using an Android-appropriate format and bitrate selected through listening tests.
- Normalize perceived loudness across tracks so changing scenes does not create sudden volume jumps.
- Remove clicks, gaps, and discontinuities at loop points.
- Add metadata and version identifiers.
- Generate checksums for source and derived files.
- Document every conversion so assets can be reproduced.
- Avoid shipping unused masters that unnecessarily increase APK size.

### Persistent playback experience

Music and ambience should continue smoothly while the user moves between normal app sections.

Requirements:

- no restart when changing tabs;
- no hard cuts between screens;
- gentle crossfades when the scene or session phase changes;
- audio state preserved when opening and closing a modal;
- user volume remembered;
- independent controls for music, nature ambience, and spoken guidance where the asset structure permits it;
- pause, mute, and silence always available;
- clear behavior when the app is backgrounded or closed;
- resume behavior controlled by the user rather than assumed.

### Android audio behavior

Implement and test:

- Android audio focus;
- pause or duck during phone calls, alarms, navigation prompts, voice assistants, and other media;
- correct recovery after an interruption;
- Bluetooth and wired-headphone changes;
- speaker-to-headphone transitions without sudden loudness;
- media notification controls only if background playback is intentionally supported;
- no playback from a closed app unless the user explicitly enabled it.

### Session-responsive sound

The soundtrack should support the emotional pacing of the experience without implying a medical effect.

Suggested behavior:

- **Arrival:** welcoming, spacious, low-demand.
- **Understanding what happened:** minimal musical movement so the user can think.
- **Exploring difficult material:** contained, warm, predictable, and not emotionally coercive.
- **Choosing a next step:** slightly brighter or more open without becoming triumphant.
- **Closing:** gradual settling and a clear sense of completion.
- **Immediate overwhelm:** reduce density, percussion, melodic movement, and spatial complexity; offer simple nature sound or silence.

The app should never increase musical drama because a user disclosed more painful material.

### User control and personalization

Users should be able to:

- choose a preferred soundscape;
- preview tracks before selecting them;
- use music only, nature only, both, or silence;
- set a default for normal browsing and a separate default for guided sessions;
- prevent automatic track changes;
- disable headphones-only features;
- download selected audio for offline use where storage permits;
- remove downloaded audio;
- choose reduced-sensory mode;
- stop all audio immediately from any screen.

### Accessibility and safety

- Default to a conservative volume.
- Do not override system volume limits.
- Warn before features that genuinely require headphones.
- Provide captions or text equivalents for any spoken guidance.
- Include a hearing-sensitive mode with reduced high-frequency detail and sudden transients where technically possible.
- Avoid claims that any track heals trauma, changes brainwaves, repairs cells, treats illness, or guarantees emotional regulation.
- Describe audio by experience and function rather than unsupported biological outcomes.

### Acceptance criteria

- A track can play continuously across Home, Sessions, Progress, and Settings without restarting.
- Screen transitions do not produce audible clicks or abrupt level changes.
- Incoming calls and competing media are handled correctly.
- The user can reach silence in one action from every screen.
- Audio does not obscure spoken guidance.
- High-distress flows automatically simplify audio but never prevent the user from changing or muting it.
- Offline-selected tracks work without a network connection.
- The final APK or downloadable asset package contains only approved, documented files.

## Priority 1: revise existing Daypath terminology

The current prototype and existing backlog still contain internal terms such as “activation,” “proof,” “Evidence Ledger,” “Field Reset,” “Sighting,” “Witness,” “Seal,” and “Compost.” These should be revised before the terminology becomes embedded in the product architecture.

Engineering may keep stable internal identifiers to avoid unnecessary migrations, but display strings must come from a centralized content layer so wording can be changed without changing stored data.

Required implementation:

- centralize all user-facing strings;
- prohibit hard-coded guidance text inside screen components;
- add content keys separate from analytics event names;
- support future localization;
- add automated checks for banned or unexplained terms in user-facing strings;
- add a content glossary for internal use only;
- ensure AI system prompts follow the same language rules.

## Release placement

### v0.2

- Replace “rate your activation” and other confusing language in the existing prototype.
- Add anchored, descriptive intensity choices.
- Remove unexplained coined terms from visible screens.
- Centralize display strings.
- Correct contrast and Android navigation issues already recorded in the main backlog.

### v0.3

- Complete the plain-language rewrite of the guided session and safety flows.
- Add content review tests.
- Add the first original Daypath music and soundscape assets.
- Implement persistent foreground playback, crossfades, interruption handling, and a global mute control.

### v0.4 and later

- Map the full guided journey to plain-language prompts.
- Add personalized soundscape selection and offline downloads.
- Add section-responsive audio behavior.
- Apply the content standard to optional AI guidance and longitudinal summaries.

## Immediate next actions

1. Upload the original music and soundscape files with any existing titles or intended uses.
2. Create the audio inventory and technical asset report.
3. Replace the current intensity prompt and safety wording.
4. Centralize all user-facing text.
5. Run a full terminology audit across the app and existing backlog.
6. Implement a persistent audio controller before adding multiple tracks.
7. Test comprehension with users who have no prior knowledge of EARTHWORK, Groundwork, CBT, or psychological terminology.
