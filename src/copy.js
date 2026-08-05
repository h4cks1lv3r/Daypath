export const FEELING_LEVELS = [
  { value: 0, short: 'Calm', label: 'I feel calm or steady.' },
  { value: 2, short: 'Uneasy', label: 'I feel a little uneasy, but I am okay.' },
  { value: 4, short: 'Struggling', label: 'This is hard, but I can still think clearly.' },
  { value: 6, short: 'Overwhelmed', label: 'I feel overwhelmed and need to slow down.' },
  { value: 8, short: 'Disconnected', label: 'I feel disconnected or unable to think clearly.' },
  { value: 10, short: 'Need help', label: 'I may not be safe handling this by myself right now.' },
];

export const SESSION_STEPS = [
  {
    title: 'Take a moment',
    prompt: 'Before we look at what happened, let us check how you are doing right now.',
    helper: 'Choose the description that feels closest. There is no right answer.',
  },
  {
    title: 'What happened?',
    prompt: 'Describe only what someone else could have seen or heard. Leave guesses about motives for later.',
    placeholder: 'For example: “I received a message, read it twice, and did not reply.”',
  },
  {
    title: 'What did this bring up?',
    prompt: 'What did you feel in your body? What did your mind say? What were you afraid might happen?',
    placeholder: 'Write a few honest words. You do not have to explain everything.',
  },
  {
    title: 'What matters to you now?',
    prompt: 'Think about the kind of response you can respect later. What matters most in this situation?',
    placeholder: 'For example: honesty, care, patience, courage, fairness, or self-respect.',
  },
  {
    title: 'Choose one small next step',
    prompt: 'What is one safe, realistic action you can take within the next 24 hours?',
    placeholder: 'Make it small and specific: “At 6 p.m., I will send one clear message.”',
  },
  {
    title: 'Close the session',
    prompt: 'What did you understand more clearly? When will you check back on your next step?',
    placeholder: 'Write one short takeaway and a time to check back.',
  },
];

export const SCENARIOS = [
  ['Waiting for a reply', 'Slow down the worry before sending another message.'],
  ['A difficult conversation', 'Prepare one honest sentence and choose a calm time to say it.'],
  ['I made a serious mistake', 'Separate shame from responsibility and choose a safe repair.'],
  ['I feel overwhelmed', 'Focus only on what needs your attention in the next ten minutes.'],
  ['I was rejected', 'Make room for the hurt without turning it into a verdict about your worth.'],
  ['I cannot get started', 'Make the first step small enough to do without waiting to feel ready.'],
  ['A wave of grief', 'Stay with one manageable part of the loss and choose support if you need it.'],
  ['I am very angry', 'Create space before acting and identify what needs to be said or protected.'],
];

export const SCREEN_COPY = {
  home: {
    title: 'A clearer path, one day at a time.',
    subtitle: 'Slow things down. Understand what is happening. Choose one next step you can live with.',
  },
  support: {
    title: 'What is happening right now?',
    subtitle: 'Choose the closest situation. Daypath will help you slow it down and find one sensible next step.',
  },
  sessions: {
    title: 'Your past sessions',
    subtitle: 'Look back without judging yourself. Notice what helped and what you followed through on.',
  },
  library: {
    title: 'Your study library',
    subtitle: 'Keep notes inside books, podcasts, courses, projects, or subjects. Search the library and build an exam from any collection.',
  },
  progress: {
    title: 'Your progress',
    subtitle: 'See both your reflection practice and what you have collected, reviewed, and learned.',
  },
  settings: {
    title: 'Your preferences',
    subtitle: 'Adjust the sound, saved data, and experience so Daypath feels supportive rather than distracting.',
  },
};
