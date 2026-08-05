export const COLLECTION_KINDS = ['Book', 'Podcast', 'Course', 'Subject', 'Project', 'Other'];

export function createId(prefix = 'item') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeText(value = '') {
  return String(value).trim().toLowerCase();
}

export function firstSentence(value = '') {
  const text = String(value).replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const match = text.match(/^(.+?[.!?])(?:\s|$)/);
  return (match ? match[1] : text).trim();
}

export function truncate(value = '', limit = 150) {
  const text = String(value).replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trim()}…`;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function rotate(values, amount) {
  if (!values.length) return values;
  const offset = amount % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
}

export function buildExam(collection, notes) {
  const orderedNotes = [...notes].sort((a, b) =>
    String(a.createdAt || '').localeCompare(String(b.createdAt || '')),
  );
  const summaries = orderedNotes.map((note) => firstSentence(note.body) || note.title);
  const contextParts = [collection.kind, collection.title, collection.subject].filter(Boolean);
  const context = contextParts.join(' · ');

  const questions = orderedNotes.map((note, index) => {
    const correctSummary = summaries[index];
    const otherSummaries = unique(summaries.filter((_, summaryIndex) => summaryIndex !== index));
    const canUseChoices = orderedNotes.length >= 3 && correctSummary && otherSummaries.length >= 2 && index % 2 === 1;

    if (canUseChoices) {
      const distractors = rotate(otherSummaries, index).slice(0, 3);
      const options = rotate(unique([correctSummary, ...distractors]), index + 1);
      return {
        id: createId('question'),
        noteId: note.id,
        type: 'choice',
        prompt: `Which statement best matches your note “${note.title}”?`,
        helper: `This question comes from ${context}.`,
        options,
        answer: correctSummary,
        reference: note.body,
      };
    }

    return {
      id: createId('question'),
      noteId: note.id,
      type: 'written',
      prompt: `Explain the main idea from “${note.title}” in your own words.`,
      helper: `Use what you collected in ${context}.`,
      answer: note.body,
      reference: note.body,
    };
  });

  return {
    id: createId('exam'),
    collectionId: collection.id,
    title: `${collection.title} review`,
    context,
    questions,
    createdAt: new Date().toISOString(),
  };
}
