import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import {
  FEELING_LEVELS,
  SCENARIOS,
  SCREEN_COPY,
  SESSION_STEPS,
} from './src/copy';
import { DAWN_AMBIENCE_BASE64 } from './src/ambientData';
import {
  buildExam,
  COLLECTION_KINDS,
  createId,
  normalizeText,
  truncate,
} from './src/library';

const STORAGE_KEY = '@daypath/state/v3';
const LEGACY_STORAGE_KEYS = ['@daypath/state/v2', '@daypath/state/v1'];
const AUDIO_PATH = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}daypath-dawn-preview.ogg`
  : null;

const EMPTY_LIBRARY = {
  collections: [],
  notes: [],
  examHistory: [],
};

const INITIAL_STATE = {
  target: 'Speaking clearly instead of reacting automatically',
  direction: 'Speaking honestly and calmly',
  sessions: [],
  library: EMPTY_LIBRARY,
  settings: {
    sound: true,
    volume: 0.28,
    ai: false,
  },
};

const EMPTY_COLLECTION_FORM = {
  kind: 'Book',
  title: '',
  subject: '',
  description: '',
};

const EMPTY_NOTE_FORM = {
  title: '',
  body: '',
  tags: '',
};

const PALETTES = {
  home: {
    sky: ['#246F82', '#4E9A95', '#E8B96A'],
    sun: '#FFE7A6',
    far: '#2B665F',
    near: '#123F3B',
    tree: '#0D332F',
  },
  support: {
    sky: ['#2B5D74', '#5C8F8B', '#D5AD70'],
    sun: '#FFE1A0',
    far: '#315D59',
    near: '#173B38',
    tree: '#102E2C',
  },
  sessions: {
    sky: ['#285B6A', '#4B8278', '#ABC491'],
    sun: '#F7D69A',
    far: '#315E53',
    near: '#173B38',
    tree: '#102E2C',
  },
  library: {
    sky: ['#2C6E74', '#5B9B89', '#D7C57A'],
    sun: '#FFF0AE',
    far: '#3B7564',
    near: '#16483F',
    tree: '#10392F',
  },
  progress: {
    sky: ['#37798B', '#74AAA0', '#F2C87C'],
    sun: '#FFF0B6',
    far: '#397068',
    near: '#174843',
    tree: '#103631',
  },
  settings: {
    sky: ['#284C5B', '#466D68', '#8FA995'],
    sun: '#E9D6A5',
    far: '#2D514C',
    near: '#173734',
    tree: '#102A28',
  },
};

function mergeSavedState(raw) {
  if (!raw) return INITIAL_STATE;
  try {
    const saved = JSON.parse(raw);
    return {
      ...INITIAL_STATE,
      ...saved,
      direction: saved.direction || saved.value || INITIAL_STATE.direction,
      settings: {
        ...INITIAL_STATE.settings,
        ...(saved.settings || {}),
      },
      sessions: Array.isArray(saved.sessions) ? saved.sessions : [],
      library: {
        ...EMPTY_LIBRARY,
        ...(saved.library || {}),
        collections: Array.isArray(saved.library?.collections)
          ? saved.library.collections
          : [],
        notes: Array.isArray(saved.library?.notes)
          ? saved.library.notes
          : [],
        examHistory: Array.isArray(saved.library?.examHistory)
          ? saved.library.examHistory
          : [],
      },
    };
  } catch {
    return INITIAL_STATE;
  }
}

function PrimaryButton({ children, onPress, disabled = false, compact = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        compact && styles.compactButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.primaryButtonText}>{children}</Text>
    </Pressable>
  );
}

function SecondaryButton({ children, onPress, compact = false, danger = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        compact && styles.compactButton,
        danger && styles.dangerButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.secondaryButtonText, danger && styles.dangerButtonText]}>
        {children}
      </Text>
    </Pressable>
  );
}

function Card({ children, style, light = false }) {
  return (
    <View style={[styles.card, light && styles.lightCard, style]}>
      {children}
    </View>
  );
}

function NatureScene({ variant = 'home', compact = false, children }) {
  const palette = PALETTES[variant] || PALETTES.home;
  return (
    <LinearGradient
      colors={palette.sky}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.scene, compact && styles.sceneCompact]}
    >
      <View style={[styles.sceneSun, { backgroundColor: palette.sun }]} />
      <View style={[styles.hillFar, { backgroundColor: palette.far }]} />
      <View style={[styles.hillNear, { backgroundColor: palette.near }]} />
      <View style={[styles.tree, styles.treeOne]}>
        <View style={[styles.treeCrown, { backgroundColor: palette.tree }]} />
        <View style={[styles.treeTrunk, { backgroundColor: palette.tree }]} />
      </View>
      <View style={[styles.tree, styles.treeTwo]}>
        <View style={[styles.treeCrownSmall, { backgroundColor: palette.tree }]} />
        <View style={[styles.treeTrunk, { backgroundColor: palette.tree }]} />
      </View>
      <View style={[styles.tree, styles.treeThree]}>
        <View style={[styles.treeCrown, { backgroundColor: palette.tree }]} />
        <View style={[styles.treeTrunk, { backgroundColor: palette.tree }]} />
      </View>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(3, 18, 21, 0.02)', 'rgba(3, 18, 21, 0.78)']}
        locations={[0.2, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.sceneContent}>{children}</View>
    </LinearGradient>
  );
}

function PageHeader({ screen }) {
  const copy = SCREEN_COPY[screen];
  return (
    <NatureScene variant={screen} compact>
      <Text style={styles.pageTitle}>{copy.title}</Text>
      <Text style={styles.pageSubtitle}>{copy.subtitle}</Text>
    </NatureScene>
  );
}

function FeelingPicker({ value, onChange, compact = false }) {
  return (
    <View style={styles.feelingList}>
      {FEELING_LEVELS.map((item) => {
        const selected = value === item.value;
        return (
          <Pressable
            key={item.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(item.value)}
            style={({ pressed }) => [
              styles.feelingOption,
              selected && styles.feelingOptionSelected,
              compact && styles.feelingOptionCompact,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.feelingNumber, selected && styles.feelingNumberSelected]}>
              <Text style={[styles.feelingNumberText, selected && styles.feelingNumberTextSelected]}>
                {item.value}
              </Text>
            </View>
            <View style={styles.feelingTextWrap}>
              <Text style={[styles.feelingShort, selected && styles.feelingShortSelected]}>
                {item.short}
              </Text>
              {!compact && (
                <Text style={[styles.feelingDescription, selected && styles.feelingDescriptionSelected]}>
                  {item.label}
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function SoundBar({ enabled, ready, error, onToggle }) {
  return (
    <View style={styles.soundBar}>
      <View style={styles.soundDot} />
      <View style={styles.soundBarText}>
        <Text style={styles.soundBarTitle}>Dawn ambience</Text>
        <Text style={styles.soundBarSubtitle}>
          {error
            ? 'Sound could not start'
            : ready
              ? enabled
                ? 'Playing softly'
                : 'Paused'
              : 'Preparing sound'}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={enabled ? 'Pause background sound' : 'Play background sound'}
        onPress={onToggle}
        style={({ pressed }) => [styles.soundButton, pressed && styles.pressed]}
      >
        <Text style={styles.soundButtonText}>{enabled ? 'Pause' : 'Play'}</Text>
      </Pressable>
    </View>
  );
}

function BottomNavigation({ screen, onChange, bottomInset }) {
  const items = [
    ['home', 'Home'],
    ['sessions', 'Sessions'],
    ['library', 'Library'],
    ['progress', 'Progress'],
    ['settings', 'Settings'],
  ];
  return (
    <View style={[styles.nav, { paddingBottom: Math.max(bottomInset, 10) }]}>
      {items.map(([id, label]) => {
        const selected = screen === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(id)}
            style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}
          >
            <View style={[styles.navMarker, selected && styles.navMarkerSelected]} />
            <Text style={[styles.navText, selected && styles.navTextSelected]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SearchField({ value, onChangeText, placeholder }) {
  return (
    <TextInput
      accessibilityRole="search"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#78928D"
      style={styles.searchInput}
      autoCorrect={false}
      clearButtonMode="while-editing"
    />
  );
}

function KindChips({ selected, onSelect, includeAll = false }) {
  const kinds = includeAll ? ['All', ...COLLECTION_KINDS] : COLLECTION_KINDS;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {kinds.map((kind) => {
        const active = selected === kind;
        return (
          <Pressable
            key={kind}
            onPress={() => onSelect(kind)}
            style={[styles.chip, active && styles.chipSelected]}
          >
            <Text style={[styles.chipText, active && styles.chipTextSelected]}>{kind}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DaypathApp />
    </SafeAreaProvider>
  );
}

function DaypathApp() {
  const insets = useSafeAreaInsets();
  const player = useAudioPlayer(null);
  const [state, setState] = useState(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [screen, setScreen] = useState('home');

  const [mode, setMode] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [step, setStep] = useState(0);
  const [intensityBefore, setIntensityBefore] = useState(4);
  const [intensityAfter, setIntensityAfter] = useState(4);
  const [answers, setAnswers] = useState(['', '', '', '', '', '']);

  const [libraryQuery, setLibraryQuery] = useState('');
  const [kindFilter, setKindFilter] = useState('All');
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [collectionForm, setCollectionForm] = useState(EMPTY_COLLECTION_FORM);
  const [noteQuery, setNoteQuery] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteForm, setNoteForm] = useState(EMPTY_NOTE_FORM);

  const [activeExam, setActiveExam] = useState(null);
  const [examIndex, setExamIndex] = useState(0);
  const [examResponses, setExamResponses] = useState({});
  const [examReveal, setExamReveal] = useState(false);
  const [examFinished, setExamFinished] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      let raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        for (const key of LEGACY_STORAGE_KEYS) {
          raw = await AsyncStorage.getItem(key);
          if (raw) break;
        }
      }
      if (active) {
        setState(mergeSavedState(raw));
        setHydrated(true);
      }
    })().catch(() => {
      if (active) setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [hydrated, state]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!AUDIO_PATH) throw new Error('Audio storage is unavailable');
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          interruptionMode: 'mixWithOthers',
        });
        const info = await FileSystem.getInfoAsync(AUDIO_PATH);
        if (!info.exists) {
          await FileSystem.writeAsStringAsync(AUDIO_PATH, DAWN_AMBIENCE_BASE64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
        if (!active) return;
        player.replace(AUDIO_PATH);
        player.loop = true;
        setAudioReady(true);
      } catch {
        if (active) setAudioError(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [player]);

  useEffect(() => {
    if (!audioReady) return;
    player.volume = state.settings.volume;
    if (state.settings.sound) player.play();
    else player.pause();
  }, [audioReady, player, state.settings.sound, state.settings.volume]);

  const completed = state.sessions.length;
  const followedThrough = state.sessions.filter((item) => item.nextStep || item.proof).length;
  const averageDifficulty = useMemo(() => {
    if (!completed) return 0;
    const total = state.sessions.reduce(
      (sum, item) => sum + Number(item.intensityBefore ?? item.activation ?? 0),
      0,
    );
    return Math.round(total / completed);
  }, [completed, state.sessions]);

  const collectionCount = state.library.collections.length;
  const noteCount = state.library.notes.length;
  const examCount = state.library.examHistory.length;
  const averageExamScore = useMemo(() => {
    if (!examCount) return 0;
    const percentages = state.library.examHistory.map((item) =>
      item.total ? Math.round((item.score / item.total) * 100) : 0,
    );
    return Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length);
  }, [examCount, state.library.examHistory]);

  const selectedCollection = useMemo(
    () => state.library.collections.find((item) => item.id === selectedCollectionId) || null,
    [selectedCollectionId, state.library.collections],
  );

  const selectedCollectionNotes = useMemo(
    () => state.library.notes.filter((item) => item.collectionId === selectedCollectionId),
    [selectedCollectionId, state.library.notes],
  );

  const filteredCollections = useMemo(() => {
    const query = normalizeText(libraryQuery);
    return state.library.collections
      .map((collection) => {
        const notes = state.library.notes.filter((note) => note.collectionId === collection.id);
        const collectionText = normalizeText(
          `${collection.kind} ${collection.title} ${collection.subject} ${collection.description}`,
        );
        const matchingNotes = query
          ? notes.filter((note) =>
              normalizeText(`${note.title} ${note.body} ${(note.tags || []).join(' ')}`).includes(query),
            )
          : notes;
        const matchesCollection = !query || collectionText.includes(query) || matchingNotes.length > 0;
        return { collection, noteTotal: notes.length, matchingNotes: query ? matchingNotes.length : 0, matchesCollection };
      })
      .filter((item) => item.matchesCollection)
      .filter((item) => kindFilter === 'All' || item.collection.kind === kindFilter)
      .sort((a, b) => String(b.collection.updatedAt || b.collection.createdAt).localeCompare(String(a.collection.updatedAt || a.collection.createdAt)));
  }, [kindFilter, libraryQuery, state.library.collections, state.library.notes]);

  const visibleCollectionNotes = useMemo(() => {
    const query = normalizeText(noteQuery);
    return selectedCollectionNotes
      .filter((note) => {
        if (!query) return true;
        return normalizeText(`${note.title} ${note.body} ${(note.tags || []).join(' ')}`).includes(query);
      })
      .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
  }, [noteQuery, selectedCollectionNotes]);

  const currentExamQuestion = activeExam?.questions?.[examIndex] || null;
  const currentExamResponse = currentExamQuestion
    ? examResponses[currentExamQuestion.id] || {}
    : {};
  const shouldPause = intensityBefore >= 8;

  function updateSetting(key, value) {
    setState((current) => ({
      ...current,
      settings: { ...current.settings, [key]: value },
    }));
  }

  function updateLibrary(updater) {
    setState((current) => ({
      ...current,
      library: updater(current.library),
    }));
  }

  function begin(type, selected = null) {
    setMode(type);
    setScenario(selected);
    setStep(0);
    setIntensityBefore(4);
    setIntensityAfter(4);
    setAnswers(['', '', '', '', '', '']);
  }

  function closeWithoutSaving() {
    setMode(null);
    setScenario(null);
    setStep(0);
  }

  function finishSession() {
    const session = {
      id: Date.now(),
      type: mode,
      title: scenario || 'Daily session',
      intensityBefore,
      intensityAfter,
      facts: answers[1].trim(),
      feelings: answers[2].trim(),
      direction: answers[3].trim(),
      nextStep: answers[4].trim(),
      closingNote: answers[5].trim(),
      createdAt: new Date().toISOString(),
    };
    setState((current) => ({ ...current, sessions: [session, ...current.sessions] }));
    setMode(null);
    setScenario(null);
    setStep(0);
    setScreen('home');
  }

  function nextSessionStep() {
    if (step === 0 && shouldPause) return;
    if (step < SESSION_STEPS.length - 1) setStep((current) => current + 1);
    else finishSession();
  }

  function openLibraryRoot() {
    setScreen('library');
    setSelectedCollectionId(null);
    setShowCollectionForm(false);
    setShowNoteForm(false);
    setEditingNoteId(null);
    setNoteQuery('');
  }

  function handleNavigation(nextScreen) {
    if (nextScreen === 'library') {
      openLibraryRoot();
      return;
    }
    setScreen(nextScreen);
  }

  function saveCollection() {
    const title = collectionForm.title.trim();
    if (!title) {
      Alert.alert('Give this collection a name', 'Use the book, podcast, course, project, or subject name.');
      return;
    }
    const now = new Date().toISOString();
    const collection = {
      id: createId('collection'),
      kind: collectionForm.kind,
      title,
      subject: collectionForm.subject.trim(),
      description: collectionForm.description.trim(),
      createdAt: now,
      updatedAt: now,
    };
    updateLibrary((library) => ({
      ...library,
      collections: [collection, ...library.collections],
    }));
    setCollectionForm(EMPTY_COLLECTION_FORM);
    setShowCollectionForm(false);
    setSelectedCollectionId(collection.id);
  }

  function deleteCollection(collection) {
    Alert.alert(
      `Delete “${collection.title}”?`,
      'This also deletes every note and saved exam result inside this collection.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            updateLibrary((library) => ({
              collections: library.collections.filter((item) => item.id !== collection.id),
              notes: library.notes.filter((item) => item.collectionId !== collection.id),
              examHistory: library.examHistory.filter((item) => item.collectionId !== collection.id),
            }));
            setSelectedCollectionId(null);
            setShowNoteForm(false);
          },
        },
      ],
    );
  }

  function beginNewNote() {
    setEditingNoteId(null);
    setNoteForm(EMPTY_NOTE_FORM);
    setShowNoteForm(true);
  }

  function beginEditNote(note) {
    setEditingNoteId(note.id);
    setNoteForm({
      title: note.title,
      body: note.body,
      tags: (note.tags || []).join(', '),
    });
    setShowNoteForm(true);
  }

  function saveNote() {
    if (!selectedCollection) return;
    const title = noteForm.title.trim();
    const body = noteForm.body.trim();
    if (!title || !body) {
      Alert.alert('Add a title and note', 'Both fields are needed so the note can be found and used in an exam.');
      return;
    }
    const tags = noteForm.tags
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const now = new Date().toISOString();
    updateLibrary((library) => {
      const notes = editingNoteId
        ? library.notes.map((note) =>
            note.id === editingNoteId
              ? { ...note, title, body, tags, updatedAt: now }
              : note,
          )
        : [
            {
              id: createId('note'),
              collectionId: selectedCollection.id,
              title,
              body,
              tags,
              createdAt: now,
              updatedAt: now,
            },
            ...library.notes,
          ];
      return {
        ...library,
        notes,
        collections: library.collections.map((collection) =>
          collection.id === selectedCollection.id
            ? { ...collection, updatedAt: now }
            : collection,
        ),
      };
    });
    setNoteForm(EMPTY_NOTE_FORM);
    setEditingNoteId(null);
    setShowNoteForm(false);
  }

  function deleteNote(noteId) {
    Alert.alert('Delete this note?', 'This note will no longer appear in future exams.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          updateLibrary((library) => ({
            ...library,
            notes: library.notes.filter((note) => note.id !== noteId),
          }));
          setShowNoteForm(false);
          setEditingNoteId(null);
        },
      },
    ]);
  }

  function startExam(collection) {
    const notes = state.library.notes.filter((note) => note.collectionId === collection.id);
    if (!notes.length) {
      Alert.alert('Add notes first', 'The exam uses every saved note in this collection.');
      return;
    }
    const exam = buildExam(collection, notes);
    setActiveExam(exam);
    setExamIndex(0);
    setExamResponses({});
    setExamReveal(false);
    setExamFinished(null);
  }

  function setCurrentExamAnswer(response) {
    if (!currentExamQuestion) return;
    setExamResponses((current) => ({
      ...current,
      [currentExamQuestion.id]: {
        ...(current[currentExamQuestion.id] || {}),
        response,
      },
    }));
  }

  function checkChoiceAnswer() {
    if (!currentExamQuestion || !currentExamResponse.response) return;
    const correct = currentExamResponse.response === currentExamQuestion.answer;
    setExamResponses((current) => ({
      ...current,
      [currentExamQuestion.id]: {
        ...(current[currentExamQuestion.id] || {}),
        correct,
      },
    }));
    setExamReveal(true);
  }

  function revealWrittenAnswer() {
    if (!currentExamQuestion) return;
    setExamReveal(true);
  }

  function gradeWrittenAnswer(correct) {
    if (!currentExamQuestion) return;
    setExamResponses((current) => ({
      ...current,
      [currentExamQuestion.id]: {
        ...(current[currentExamQuestion.id] || {}),
        correct,
      },
    }));
  }

  function finishExam() {
    if (!activeExam) return;
    const score = activeExam.questions.filter((question) => examResponses[question.id]?.correct).length;
    const reviewNoteIds = activeExam.questions
      .filter((question) => !examResponses[question.id]?.correct)
      .map((question) => question.noteId);
    const result = {
      id: createId('attempt'),
      examId: activeExam.id,
      collectionId: activeExam.collectionId,
      title: activeExam.title,
      score,
      total: activeExam.questions.length,
      reviewNoteIds,
      createdAt: new Date().toISOString(),
    };
    updateLibrary((library) => ({
      ...library,
      examHistory: [result, ...library.examHistory],
    }));
    setExamFinished(result);
  }

  function nextExamQuestion() {
    if (!activeExam) return;
    if (examIndex >= activeExam.questions.length - 1) {
      finishExam();
      return;
    }
    setExamIndex((current) => current + 1);
    setExamReveal(false);
  }

  function closeExam() {
    setActiveExam(null);
    setExamFinished(null);
    setExamIndex(0);
    setExamResponses({});
    setExamReveal(false);
    setScreen('library');
  }

  function clearSessionData() {
    Alert.alert('Delete your saved sessions?', 'Your library notes and exam results will stay on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setState((current) => ({ ...current, sessions: [] })),
      },
    ]);
  }

  function clearLibraryData() {
    Alert.alert('Delete your entire library?', 'All collections, notes, and exam results will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setState((current) => ({ ...current, library: EMPTY_LIBRARY }));
          setSelectedCollectionId(null);
        },
      },
    ]);
  }

  if (activeExam) {
    if (examFinished) {
      const percentage = examFinished.total
        ? Math.round((examFinished.score / examFinished.total) * 100)
        : 0;
      const reviewNotes = state.library.notes.filter((note) =>
        examFinished.reviewNoteIds.includes(note.id),
      );
      return (
        <LinearGradient colors={['#123A39', '#07191A']} style={styles.app}>
          <StatusBar style="light" />
          <ScrollView
            contentContainerStyle={[
              styles.examScreen,
              { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 24 },
            ]}
          >
            <NatureScene variant="library" compact>
              <Text style={styles.sessionEyebrow}>EXAM COMPLETE</Text>
              <Text style={styles.sessionHeroTitle}>{activeExam.title}</Text>
              <Text style={styles.sessionHeroCopy}>
                You marked {examFinished.score} of {examFinished.total} answers as correct.
              </Text>
            </NatureScene>
            <Card style={styles.scoreCard}>
              <Text style={styles.scoreValue}>{percentage}%</Text>
              <Text style={styles.cardTitle}>Your review score</Text>
              <Text style={styles.cardBody}>
                This is a study aid based only on the notes you saved. It is not an outside assessment of the source material.
              </Text>
            </Card>
            {reviewNotes.length > 0 && (
              <Card>
                <Text style={styles.cardEyebrow}>REVIEW THESE NOTES</Text>
                {reviewNotes.map((note) => (
                  <Text key={note.id} style={styles.reviewItem}>• {note.title}</Text>
                ))}
              </Card>
            )}
            <PrimaryButton onPress={closeExam}>Return to this collection</PrimaryButton>
          </ScrollView>
        </LinearGradient>
      );
    }

    const questionAnswered = typeof currentExamResponse.correct === 'boolean';
    return (
      <LinearGradient colors={['#0A2B2C', '#061617']} style={styles.app}>
        <StatusBar style="light" />
        <View style={[styles.examLayout, { paddingTop: insets.top + 10, paddingBottom: Math.max(insets.bottom, 14) }]}>
          <View style={styles.sessionTopRow}>
            <Pressable onPress={closeExam} style={styles.closeButton} accessibilityRole="button">
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
            <Text style={styles.stepCount}>{examIndex + 1} of {activeExam.questions.length}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((examIndex + 1) / activeExam.questions.length) * 100}%` }]} />
          </View>
          <ScrollView contentContainerStyle={styles.examContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.examContext}>{activeExam.context}</Text>
            <Text style={styles.examQuestion}>{currentExamQuestion.prompt}</Text>
            <Text style={styles.helperText}>{currentExamQuestion.helper}</Text>

            {currentExamQuestion.type === 'choice' ? (
              <View style={styles.choiceList}>
                {currentExamQuestion.options.map((option) => {
                  const selected = currentExamResponse.response === option;
                  const correct = examReveal && option === currentExamQuestion.answer;
                  const wrong = examReveal && selected && option !== currentExamQuestion.answer;
                  return (
                    <Pressable
                      key={option}
                      disabled={examReveal}
                      onPress={() => setCurrentExamAnswer(option)}
                      style={[
                        styles.choice,
                        selected && styles.choiceSelected,
                        correct && styles.choiceCorrect,
                        wrong && styles.choiceWrong,
                      ]}
                    >
                      <Text style={styles.choiceText}>{option}</Text>
                    </Pressable>
                  );
                })}
                {!examReveal ? (
                  <PrimaryButton disabled={!currentExamResponse.response} onPress={checkChoiceAnswer}>
                    Check answer
                  </PrimaryButton>
                ) : (
                  <Card style={currentExamResponse.correct ? styles.correctCard : styles.reviewCard}>
                    <Text style={styles.cardTitle}>
                      {currentExamResponse.correct ? 'Correct' : 'Review this note again'}
                    </Text>
                    <Text style={styles.cardBody}>{currentExamQuestion.reference}</Text>
                  </Card>
                )}
              </View>
            ) : (
              <>
                <TextInput
                  multiline
                  value={currentExamResponse.response || ''}
                  onChangeText={setCurrentExamAnswer}
                  editable={!examReveal}
                  placeholder="Write your answer from memory…"
                  placeholderTextColor="#78928D"
                  style={styles.examInput}
                  textAlignVertical="top"
                />
                {!examReveal ? (
                  <PrimaryButton onPress={revealWrittenAnswer}>Show my reference note</PrimaryButton>
                ) : (
                  <>
                    <Card>
                      <Text style={styles.cardEyebrow}>YOUR SAVED NOTE</Text>
                      <Text style={styles.cardBody}>{currentExamQuestion.reference}</Text>
                    </Card>
                    <Text style={styles.selfGradeTitle}>How close was your answer?</Text>
                    <View style={styles.gradeRow}>
                      <SecondaryButton compact onPress={() => gradeWrittenAnswer(false)}>Review again</SecondaryButton>
                      <PrimaryButton compact onPress={() => gradeWrittenAnswer(true)}>I got it</PrimaryButton>
                    </View>
                  </>
                )}
              </>
            )}
          </ScrollView>
          {questionAnswered && (
            <View style={styles.examFooter}>
              <PrimaryButton onPress={nextExamQuestion}>
                {examIndex === activeExam.questions.length - 1 ? 'Finish exam' : 'Next question'}
              </PrimaryButton>
            </View>
          )}
        </View>
      </LinearGradient>
    );
  }

  if (mode) {
    return (
      <LinearGradient colors={['#0A2528', '#07191A']} style={styles.app}>
        <StatusBar style="light" />
        <View style={[styles.sessionScreen, { paddingTop: insets.top + 10, paddingBottom: Math.max(insets.bottom, 14) }]}>
          {step === 0 && shouldPause ? (
            <ScrollView contentContainerStyle={styles.sessionContent}>
              <NatureScene variant="support" compact>
                <Text style={styles.sessionEyebrow}>LET US SLOW DOWN</Text>
                <Text style={styles.sessionHeroTitle}>This feels like too much to work through alone right now.</Text>
                <Text style={styles.sessionHeroCopy}>
                  You do not need to solve the situation in this moment. The next step is to feel more present and bring in support.
                </Text>
              </NatureScene>
              <Card>
                <Text style={styles.cardTitle}>Try this first</Text>
                <Text style={styles.cardBody}>
                  Keep your eyes open. Say where you are and what day it is. Name three things you can see and one sound you can hear. Feel the support under your feet or body.
                </Text>
              </Card>
              <Card>
                <Text style={styles.cardTitle}>Reach out</Text>
                <Text style={styles.cardBody}>
                  Contact someone you trust or a qualified professional. If you or someone else is in immediate danger, use local emergency services now.
                </Text>
              </Card>
              <PrimaryButton onPress={() => setIntensityBefore(6)}>I feel more present now</PrimaryButton>
              <SecondaryButton onPress={closeWithoutSaving}>Leave this session</SecondaryButton>
            </ScrollView>
          ) : (
            <>
              <View style={styles.sessionTopRow}>
                <Pressable onPress={closeWithoutSaving} style={styles.closeButton} accessibilityRole="button">
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
                <Text style={styles.stepCount}>{step + 1} of {SESSION_STEPS.length}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${((step + 1) / SESSION_STEPS.length) * 100}%` }]} />
              </View>
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sessionContent}>
                <NatureScene variant={step < 2 ? 'support' : step < 4 ? 'sessions' : 'progress'} compact>
                  <Text style={styles.sessionEyebrow}>{mode === 'scenario' ? scenario : 'TODAY’S SESSION'}</Text>
                  <Text style={styles.sessionHeroTitle}>{SESSION_STEPS[step].title}</Text>
                  <Text style={styles.sessionHeroCopy}>{SESSION_STEPS[step].prompt}</Text>
                </NatureScene>

                {step === 0 ? (
                  <>
                    <Text style={styles.helperText}>{SESSION_STEPS[0].helper}</Text>
                    <FeelingPicker value={intensityBefore} onChange={setIntensityBefore} />
                    {intensityBefore === 6 && (
                      <Card style={styles.gentleNotice}>
                        <Text style={styles.cardTitle}>We will keep this short.</Text>
                        <Text style={styles.cardBody}>
                          Stay with what is happening today. You can skip anything that feels too personal or too much.
                        </Text>
                      </Card>
                    )}
                  </>
                ) : (
                  <>
                    <TextInput
                      accessibilityLabel={SESSION_STEPS[step].title}
                      multiline
                      value={answers[step]}
                      onChangeText={(text) => setAnswers((current) => current.map((item, index) => (index === step ? text : item)))}
                      placeholder={SESSION_STEPS[step].placeholder}
                      placeholderTextColor="#77928D"
                      style={styles.input}
                      textAlignVertical="top"
                    />
                    {step === SESSION_STEPS.length - 1 && (
                      <View style={styles.afterCheck}>
                        <Text style={styles.cardTitle}>How does it feel now?</Text>
                        <Text style={styles.cardBody}>Choose the closest description. It is okay if the feeling has not changed.</Text>
                        <FeelingPicker value={intensityAfter} onChange={setIntensityAfter} compact />
                      </View>
                    )}
                  </>
                )}
              </ScrollView>
              <View style={styles.sessionFooter}>
                {step > 0 && <SecondaryButton onPress={() => setStep((current) => current - 1)}>Back</SecondaryButton>}
                <PrimaryButton onPress={nextSessionStep}>
                  {step === SESSION_STEPS.length - 1 ? 'Save and finish' : 'Continue'}
                </PrimaryButton>
              </View>
            </>
          )}
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#071D20', '#061517']} style={styles.app}>
      <StatusBar style="light" />
      <View style={[styles.mainLayout, { paddingTop: insets.top }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {screen === 'home' && (
            <>
              <NatureScene variant="home">
                <Text style={styles.brand}>DAYPATH</Text>
                <Text style={styles.heroTitle}>{SCREEN_COPY.home.title}</Text>
                <Text style={styles.heroCopy}>{SCREEN_COPY.home.subtitle}</Text>
                <PrimaryButton onPress={() => begin('daily')}>Start today’s session</PrimaryButton>
              </NatureScene>

              <Pressable
                accessibilityRole="button"
                onPress={() => setScreen('support')}
                style={({ pressed }) => [styles.supportCard, pressed && styles.pressed]}
              >
                <View style={styles.supportTextWrap}>
                  <Text style={styles.supportEyebrow}>NEED HELP WITH SOMETHING SPECIFIC?</Text>
                  <Text style={styles.supportTitle}>Help me through this</Text>
                  <Text style={styles.supportBody}>A calm, step-by-step guide for a difficult moment or life event.</Text>
                </View>
                <Text style={styles.supportArrow}>→</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={openLibraryRoot}
                style={({ pressed }) => [styles.libraryHomeCard, pressed && styles.pressed]}
              >
                <View style={styles.libraryHomeIcon}><Text style={styles.libraryHomeIconText}>≡</Text></View>
                <View style={styles.supportTextWrap}>
                  <Text style={styles.libraryHomeEyebrow}>YOUR STUDY LIBRARY</Text>
                  <Text style={styles.libraryHomeTitle}>Organize notes by source or subject</Text>
                  <Text style={styles.libraryHomeBody}>
                    {collectionCount} collections · {noteCount} notes · create exams from any collection
                  </Text>
                </View>
                <Text style={styles.listArrow}>→</Text>
              </Pressable>

              <Text style={styles.sectionTitle}>Today</Text>
              <Card>
                <Text style={styles.cardEyebrow}>WHAT YOU ARE WORKING ON</Text>
                <Text style={styles.cardTitle}>{state.target}</Text>
                <Text style={styles.cardBody}>The direction you chose: {state.direction}</Text>
              </Card>
              <Card>
                <Text style={styles.cardEyebrow}>YOUR LATEST NEXT STEP</Text>
                <Text style={styles.cardTitle}>
                  {state.sessions[0]?.nextStep || state.sessions[0]?.proof || 'Finish a session to choose one small, realistic next step.'}
                </Text>
              </Card>
            </>
          )}

          {screen === 'support' && (
            <>
              <PageHeader screen="support" />
              {SCENARIOS.map(([title, subtitle]) => (
                <Pressable
                  key={title}
                  accessibilityRole="button"
                  onPress={() => begin('scenario', title)}
                  style={({ pressed }) => [styles.listCard, pressed && styles.pressed]}
                >
                  <View style={styles.listCardText}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={styles.cardBody}>{subtitle}</Text>
                  </View>
                  <Text style={styles.listArrow}>→</Text>
                </Pressable>
              ))}
            </>
          )}

          {screen === 'sessions' && (
            <>
              <PageHeader screen="sessions" />
              {!state.sessions.length && (
                <Card>
                  <Text style={styles.cardTitle}>No saved sessions yet</Text>
                  <Text style={styles.cardBody}>Your completed sessions will appear here when you are ready to begin.</Text>
                </Card>
              )}
              {state.sessions.map((item) => (
                <Card key={item.id}>
                  <Text style={styles.cardEyebrow}>{item.type === 'scenario' ? 'GUIDED SUPPORT' : 'DAILY SESSION'}</Text>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.meta}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  <Text style={styles.detailLabel}>WHAT HAPPENED</Text>
                  <Text style={styles.cardBody}>{item.facts || 'Not written down'}</Text>
                  <Text style={styles.detailLabel}>NEXT STEP</Text>
                  <Text style={styles.cardBody}>{item.nextStep || item.proof || 'Not written down'}</Text>
                </Card>
              ))}
            </>
          )}

          {screen === 'library' && !selectedCollection && (
            <>
              <PageHeader screen="library" />
              <SearchField
                value={libraryQuery}
                onChangeText={setLibraryQuery}
                placeholder="Search books, podcasts, subjects, tags, or note text"
              />
              <PrimaryButton onPress={() => setShowCollectionForm((current) => !current)}>
                {showCollectionForm ? 'Close new collection form' : 'Create a collection'}
              </PrimaryButton>

              {showCollectionForm && (
                <Card>
                  <Text style={styles.cardTitle}>New collection</Text>
                  <Text style={styles.cardBody}>
                    A collection can be a specific book or podcast, a course, a project, or any subject you want.
                  </Text>
                  <Text style={styles.fieldLabel}>TYPE</Text>
                  <KindChips selected={collectionForm.kind} onSelect={(kind) => setCollectionForm((current) => ({ ...current, kind }))} />
                  <Text style={styles.fieldLabel}>NAME</Text>
                  <TextInput
                    value={collectionForm.title}
                    onChangeText={(title) => setCollectionForm((current) => ({ ...current, title }))}
                    placeholder="For example: Deep Work or Network Security"
                    placeholderTextColor="#78928D"
                    style={styles.singleLineInput}
                  />
                  <Text style={styles.fieldLabel}>SUBJECT OR CATEGORY (OPTIONAL)</Text>
                  <TextInput
                    value={collectionForm.subject}
                    onChangeText={(subject) => setCollectionForm((current) => ({ ...current, subject }))}
                    placeholder="For example: Productivity or Cybersecurity"
                    placeholderTextColor="#78928D"
                    style={styles.singleLineInput}
                  />
                  <Text style={styles.fieldLabel}>DESCRIPTION (OPTIONAL)</Text>
                  <TextInput
                    multiline
                    value={collectionForm.description}
                    onChangeText={(description) => setCollectionForm((current) => ({ ...current, description }))}
                    placeholder="What are you collecting here?"
                    placeholderTextColor="#78928D"
                    style={styles.smallTextArea}
                    textAlignVertical="top"
                  />
                  <PrimaryButton onPress={saveCollection}>Save collection</PrimaryButton>
                </Card>
              )}

              <KindChips selected={kindFilter} onSelect={setKindFilter} includeAll />
              <View style={styles.librarySummaryRow}>
                <Text style={styles.sectionTitle}>Collections</Text>
                <Text style={styles.summaryText}>{filteredCollections.length} shown</Text>
              </View>

              {!filteredCollections.length && (
                <Card>
                  <Text style={styles.cardTitle}>{collectionCount ? 'No collections match this search' : 'Your library is empty'}</Text>
                  <Text style={styles.cardBody}>
                    {collectionCount
                      ? 'Try another word or choose All.'
                      : 'Create a collection first. Your notes will stay inside it instead of appearing as one large list.'}
                  </Text>
                </Card>
              )}

              {filteredCollections.map(({ collection, noteTotal, matchingNotes }) => (
                <Pressable
                  key={collection.id}
                  onPress={() => {
                    setSelectedCollectionId(collection.id);
                    setNoteQuery('');
                    setShowNoteForm(false);
                  }}
                  style={({ pressed }) => [styles.collectionCard, pressed && styles.pressed]}
                >
                  <View style={styles.collectionTopRow}>
                    <View style={styles.kindBadge}><Text style={styles.kindBadgeText}>{collection.kind}</Text></View>
                    <Text style={styles.collectionCount}>{noteTotal} {noteTotal === 1 ? 'note' : 'notes'}</Text>
                  </View>
                  <Text style={styles.collectionTitle}>{collection.title}</Text>
                  {!!collection.subject && <Text style={styles.collectionSubject}>{collection.subject}</Text>}
                  {!!collection.description && <Text style={styles.cardBody}>{truncate(collection.description, 120)}</Text>}
                  {!!libraryQuery && matchingNotes > 0 && (
                    <Text style={styles.searchMatch}>{matchingNotes} matching {matchingNotes === 1 ? 'note' : 'notes'}</Text>
                  )}
                </Pressable>
              ))}
            </>
          )}

          {screen === 'library' && selectedCollection && (
            <>
              <SecondaryButton compact onPress={() => {
                setSelectedCollectionId(null);
                setShowNoteForm(false);
                setEditingNoteId(null);
              }}>
                Back to collections
              </SecondaryButton>
              <NatureScene variant="library" compact>
                <Text style={styles.sessionEyebrow}>{selectedCollection.kind.toUpperCase()}</Text>
                <Text style={styles.sessionHeroTitle}>{selectedCollection.title}</Text>
                {!!selectedCollection.subject && <Text style={styles.sessionHeroCopy}>{selectedCollection.subject}</Text>}
                {!!selectedCollection.description && <Text style={styles.sessionHeroCopy}>{selectedCollection.description}</Text>}
              </NatureScene>

              <View style={styles.collectionActionRow}>
                <PrimaryButton compact onPress={beginNewNote}>Add note</PrimaryButton>
                <PrimaryButton compact disabled={!selectedCollectionNotes.length} onPress={() => startExam(selectedCollection)}>
                  Create full exam
                </PrimaryButton>
              </View>
              <Text style={styles.noteCoverageText}>
                A full exam creates one question from every note currently saved in this collection.
              </Text>

              {showNoteForm && (
                <Card>
                  <Text style={styles.cardTitle}>{editingNoteId ? 'Edit note' : 'New note'}</Text>
                  <Text style={styles.fieldLabel}>NOTE TITLE</Text>
                  <TextInput
                    value={noteForm.title}
                    onChangeText={(title) => setNoteForm((current) => ({ ...current, title }))}
                    placeholder="Name the idea so you can find it later"
                    placeholderTextColor="#78928D"
                    style={styles.singleLineInput}
                  />
                  <Text style={styles.fieldLabel}>YOUR NOTES</Text>
                  <TextInput
                    multiline
                    value={noteForm.body}
                    onChangeText={(body) => setNoteForm((current) => ({ ...current, body }))}
                    placeholder="Write what you learned in your own words. This text becomes the reference answer in exams."
                    placeholderTextColor="#78928D"
                    style={styles.noteTextArea}
                    textAlignVertical="top"
                  />
                  <Text style={styles.fieldLabel}>TAGS (OPTIONAL, COMMA SEPARATED)</Text>
                  <TextInput
                    value={noteForm.tags}
                    onChangeText={(tags) => setNoteForm((current) => ({ ...current, tags }))}
                    placeholder="chapter 2, habits, key idea"
                    placeholderTextColor="#78928D"
                    style={styles.singleLineInput}
                  />
                  <PrimaryButton onPress={saveNote}>{editingNoteId ? 'Save changes' : 'Save note'}</PrimaryButton>
                  <SecondaryButton onPress={() => {
                    setShowNoteForm(false);
                    setEditingNoteId(null);
                    setNoteForm(EMPTY_NOTE_FORM);
                  }}>
                    Cancel
                  </SecondaryButton>
                  {editingNoteId && (
                    <SecondaryButton danger onPress={() => deleteNote(editingNoteId)}>Delete note</SecondaryButton>
                  )}
                </Card>
              )}

              <SearchField
                value={noteQuery}
                onChangeText={setNoteQuery}
                placeholder={`Search inside ${selectedCollection.title}`}
              />
              <View style={styles.librarySummaryRow}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.summaryText}>{visibleCollectionNotes.length} shown</Text>
              </View>

              {!visibleCollectionNotes.length && (
                <Card>
                  <Text style={styles.cardTitle}>{selectedCollectionNotes.length ? 'No notes match this search' : 'No notes in this collection yet'}</Text>
                  <Text style={styles.cardBody}>
                    {selectedCollectionNotes.length
                      ? 'Try a different word or clear the search.'
                      : 'Add your first note. Notes remain grouped here and are used to build this collection’s exam.'}
                  </Text>
                </Card>
              )}

              {visibleCollectionNotes.map((note) => (
                <Pressable
                  key={note.id}
                  onPress={() => beginEditNote(note)}
                  style={({ pressed }) => [styles.noteCard, pressed && styles.pressed]}
                >
                  <Text style={styles.cardTitle}>{note.title}</Text>
                  <Text style={styles.cardBody}>{truncate(note.body, 180)}</Text>
                  {!!note.tags?.length && (
                    <View style={styles.tagRow}>
                      {note.tags.map((tag) => <Text key={tag} style={styles.tag}>#{tag}</Text>)}
                    </View>
                  )}
                  <Text style={styles.meta}>Updated {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</Text>
                </Pressable>
              ))}

              {state.library.examHistory.some((item) => item.collectionId === selectedCollection.id) && (
                <>
                  <Text style={styles.sectionTitle}>Recent exams</Text>
                  {state.library.examHistory
                    .filter((item) => item.collectionId === selectedCollection.id)
                    .slice(0, 3)
                    .map((item) => (
                      <Card key={item.id}>
                        <Text style={styles.cardTitle}>{item.score} of {item.total} correct</Text>
                        <Text style={styles.cardBody}>{new Date(item.createdAt).toLocaleString()}</Text>
                      </Card>
                    ))}
                </>
              )}

              <SecondaryButton danger onPress={() => deleteCollection(selectedCollection)}>Delete collection</SecondaryButton>
            </>
          )}

          {screen === 'progress' && (
            <>
              <PageHeader screen="progress" />
              <Text style={styles.sectionTitle}>Reflection practice</Text>
              <View style={styles.metricRow}>
                <Card style={styles.metricCard}>
                  <Text style={styles.metricValue}>{completed}</Text>
                  <Text style={styles.metricLabel}>Sessions</Text>
                </Card>
                <Card style={styles.metricCard}>
                  <Text style={styles.metricValue}>{followedThrough}</Text>
                  <Text style={styles.metricLabel}>Next steps chosen</Text>
                </Card>
                <Card style={styles.metricCard}>
                  <Text style={styles.metricValue}>{averageDifficulty}</Text>
                  <Text style={styles.metricLabel}>Average starting difficulty</Text>
                </Card>
              </View>
              <Card>
                <Text style={styles.cardEyebrow}>WHERE YOU ARE NOW</Text>
                <Text style={styles.cardTitle}>
                  {completed < 7
                    ? 'Getting familiar with the process'
                    : completed < 21
                      ? 'Noticing patterns more clearly'
                      : 'Building a steadier response'}
                </Text>
                <Text style={styles.cardBody}>
                  Daypath looks at what you practice and follow through on. It cannot measure brain changes or promise that change happens on a fixed schedule.
                </Text>
              </Card>

              <Text style={styles.sectionTitle}>Study library</Text>
              <View style={styles.metricRow}>
                <Card style={styles.metricCard}>
                  <Text style={styles.metricValue}>{collectionCount}</Text>
                  <Text style={styles.metricLabel}>Collections</Text>
                </Card>
                <Card style={styles.metricCard}>
                  <Text style={styles.metricValue}>{noteCount}</Text>
                  <Text style={styles.metricLabel}>Notes</Text>
                </Card>
                <Card style={styles.metricCard}>
                  <Text style={styles.metricValue}>{averageExamScore}%</Text>
                  <Text style={styles.metricLabel}>Average exam score</Text>
                </Card>
              </View>
            </>
          )}

          {screen === 'settings' && (
            <>
              <PageHeader screen="settings" />
              <Card>
                <View style={styles.settingRow}>
                  <View style={styles.settingCopy}>
                    <Text style={styles.cardTitle}>Music and nature sounds</Text>
                    <Text style={styles.cardBody}>Keep a gentle ambience playing as you move through the app.</Text>
                  </View>
                  <Switch
                    value={state.settings.sound}
                    onValueChange={(value) => updateSetting('sound', value)}
                    trackColor={{ false: '#38524E', true: '#E8B56D' }}
                    thumbColor={state.settings.sound ? '#FFF5DF' : '#B7C3BF'}
                  />
                </View>
                <Text style={styles.detailLabel}>VOLUME</Text>
                <View style={styles.volumeRow}>
                  {[
                    [0.16, 'Low'],
                    [0.28, 'Medium'],
                    [0.42, 'Full'],
                  ].map(([value, label]) => {
                    const selected = state.settings.volume === value;
                    return (
                      <Pressable
                        key={label}
                        onPress={() => updateSetting('volume', value)}
                        style={[styles.volumeButton, selected && styles.volumeButtonSelected]}
                      >
                        <Text style={[styles.volumeButtonText, selected && styles.volumeButtonTextSelected]}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.noteText}>
                  This build includes a gentle preview track so the sound controls can be tested. Your original music collection has not been added because no audio files are currently in the repository.
                </Text>
              </Card>

              <Card>
                <View style={styles.settingRow}>
                  <View style={styles.settingCopy}>
                    <Text style={styles.cardTitle}>AI guidance</Text>
                    <Text style={styles.cardBody}>Not connected in this build. Your sessions and library notes stay on this device.</Text>
                  </View>
                  <Switch value={false} disabled />
                </View>
              </Card>

              <Card>
                <Text style={styles.cardEyebrow}>YOUR LIBRARY</Text>
                <Text style={styles.cardBody}>
                  Collections, notes, search, exams, and scores are stored locally on this device in this test build.
                </Text>
              </Card>
              <Card>
                <Text style={styles.cardEyebrow}>WHAT DAYPATH IS</Text>
                <Text style={styles.cardBody}>
                  Daypath is a guided self-reflection, study, and behavior-change tool. It is not therapy, diagnosis, medical treatment, or emergency support.
                </Text>
              </Card>
              <SecondaryButton onPress={clearSessionData}>Delete saved sessions</SecondaryButton>
              <SecondaryButton danger onPress={clearLibraryData}>Delete library and exam history</SecondaryButton>
            </>
          )}
        </ScrollView>

        <SoundBar
          enabled={state.settings.sound}
          ready={audioReady}
          error={audioError}
          onToggle={() => updateSetting('sound', !state.settings.sound)}
        />
        <BottomNavigation
          screen={screen === 'support' ? 'home' : screen}
          onChange={handleNavigation}
          bottomInset={insets.bottom}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1 },
  mainLayout: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 28, gap: 14 },
  scene: {
    minHeight: 430,
    borderRadius: 30,
    overflow: 'hidden',
    padding: 24,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  sceneCompact: { minHeight: 255, borderRadius: 26, padding: 22 },
  sceneSun: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    top: 28,
    right: 34,
    opacity: 0.9,
  },
  hillFar: {
    position: 'absolute',
    width: 520,
    height: 210,
    borderRadius: 260,
    bottom: 22,
    right: -190,
    transform: [{ rotate: '-6deg' }],
    opacity: 0.86,
  },
  hillNear: {
    position: 'absolute',
    width: 560,
    height: 230,
    borderRadius: 280,
    bottom: -80,
    left: -160,
    transform: [{ rotate: '5deg' }],
  },
  tree: { position: 'absolute', alignItems: 'center' },
  treeOne: { left: 32, top: 104, transform: [{ scale: 1.15 }] },
  treeTwo: { left: 92, top: 138, transform: [{ scale: 0.78 }] },
  treeThree: { right: 36, top: 146, transform: [{ scale: 0.9 }] },
  treeCrown: { width: 44, height: 62, borderRadius: 24 },
  treeCrownSmall: { width: 36, height: 48, borderRadius: 20 },
  treeTrunk: { width: 8, height: 34, marginTop: -10, borderRadius: 4 },
  sceneContent: { zIndex: 3 },
  brand: { color: '#FFE1A3', letterSpacing: 4, fontWeight: '800', marginBottom: 14 },
  heroTitle: { color: '#FFF9ED', fontSize: 39, lineHeight: 44, fontWeight: '800', maxWidth: 340 },
  heroCopy: { color: '#E3F0EC', fontSize: 17, lineHeight: 25, marginTop: 14, marginBottom: 12, maxWidth: 355 },
  pageTitle: { color: '#FFF9ED', fontSize: 32, lineHeight: 37, fontWeight: '800' },
  pageSubtitle: { color: '#E3F0EC', fontSize: 16, lineHeight: 24, marginTop: 10 },
  primaryButton: {
    minHeight: 52,
    backgroundColor: '#F3B75E',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    flexShrink: 1,
  },
  compactButton: { minHeight: 46, paddingVertical: 11, flex: 1 },
  primaryButtonText: { color: '#102A28', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  secondaryButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#4D716B',
    borderRadius: 17,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryButtonText: { color: '#EAF4F0', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  dangerButton: { borderColor: '#9B5B58' },
  dangerButtonText: { color: '#F4B6B1' },
  disabledButton: { opacity: 0.5 },
  pressed: { opacity: 0.78 },
  card: {
    backgroundColor: '#0E2A29',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#21433F',
    padding: 18,
  },
  lightCard: { backgroundColor: '#F0D096', borderColor: '#F5DFAE' },
  cardEyebrow: { color: '#F2BC6D', fontSize: 11, letterSpacing: 1.8, fontWeight: '800', marginBottom: 8 },
  cardTitle: { color: '#FFF9ED', fontSize: 20, lineHeight: 27, fontWeight: '700' },
  cardBody: { color: '#C9DCD7', fontSize: 15, lineHeight: 23, marginTop: 8 },
  sectionTitle: { color: '#FFF9ED', fontSize: 25, fontWeight: '800', marginTop: 9 },
  supportCard: {
    minHeight: 190,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0D096',
    borderRadius: 26,
    padding: 21,
    borderWidth: 1,
    borderColor: '#F6E1B6',
  },
  supportTextWrap: { flex: 1 },
  supportEyebrow: { color: '#6D4F1D', fontSize: 11, letterSpacing: 1.6, fontWeight: '800', marginBottom: 8 },
  supportTitle: { color: '#173B38', fontSize: 25, lineHeight: 30, fontWeight: '800' },
  supportBody: { color: '#355B56', fontSize: 15, lineHeight: 23, marginTop: 8 },
  supportArrow: { color: '#173B38', fontSize: 34, marginLeft: 12, fontWeight: '700' },
  libraryHomeCard: {
    minHeight: 145,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#103332',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2E5A55',
  },
  libraryHomeIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#F0C073', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  libraryHomeIconText: { color: '#173B38', fontSize: 24, fontWeight: '800' },
  libraryHomeEyebrow: { color: '#F2BC6D', fontSize: 11, letterSpacing: 1.5, fontWeight: '800', marginBottom: 6 },
  libraryHomeTitle: { color: '#FFF9ED', fontSize: 21, lineHeight: 27, fontWeight: '800' },
  libraryHomeBody: { color: '#BFD5D0', fontSize: 14, lineHeight: 21, marginTop: 7 },
  listCard: {
    minHeight: 108,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E2A29',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#21433F',
    padding: 18,
  },
  listCardText: { flex: 1 },
  listArrow: { color: '#F2BC6D', fontSize: 30, marginLeft: 12 },
  meta: { color: '#89A49F', marginTop: 7, fontSize: 13 },
  detailLabel: { color: '#F2BC6D', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: 17 },
  metricRow: { flexDirection: 'row', gap: 8 },
  metricCard: { flex: 1, minHeight: 132, justifyContent: 'space-between' },
  metricValue: { color: '#F5C67D', fontSize: 32, fontWeight: '800' },
  metricLabel: { color: '#C9DCD7', fontSize: 12, lineHeight: 17, marginTop: 10 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  settingCopy: { flex: 1 },
  volumeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  volumeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3B5D58',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeButtonSelected: { backgroundColor: '#F0C073', borderColor: '#F0C073' },
  volumeButtonText: { color: '#DCE9E5', fontWeight: '700' },
  volumeButtonTextSelected: { color: '#173B38' },
  noteText: { color: '#93AEA8', fontSize: 13, lineHeight: 19, marginTop: 15 },
  soundBar: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2423',
    borderTopWidth: 1,
    borderTopColor: '#1E413D',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  soundDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F1B961', marginRight: 12 },
  soundBarText: { flex: 1 },
  soundBarTitle: { color: '#F4F8F5', fontSize: 14, fontWeight: '700' },
  soundBarSubtitle: { color: '#86A19B', fontSize: 12, marginTop: 2 },
  soundButton: { minWidth: 62, minHeight: 40, borderRadius: 14, backgroundColor: '#173C39', alignItems: 'center', justifyContent: 'center' },
  soundButtonText: { color: '#F7D391', fontWeight: '800', fontSize: 13 },
  nav: {
    flexDirection: 'row',
    backgroundColor: '#061819',
    borderTopWidth: 1,
    borderTopColor: '#173735',
    paddingTop: 7,
    paddingHorizontal: 4,
  },
  navItem: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  navMarker: { width: 24, height: 3, borderRadius: 2, backgroundColor: 'transparent', marginBottom: 5 },
  navMarkerSelected: { backgroundColor: '#F0B85F' },
  navText: { color: '#7F9C97', fontSize: 11, fontWeight: '700' },
  navTextSelected: { color: '#F7D89B' },
  sessionScreen: { flex: 1, paddingHorizontal: 18 },
  sessionTopRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeButton: { minHeight: 42, minWidth: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#143634' },
  closeButtonText: { color: '#E7F1EE', fontWeight: '700' },
  stepCount: { color: '#8BA7A1', fontWeight: '700' },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: '#173B39', overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: 5, borderRadius: 3, backgroundColor: '#F2B860' },
  sessionContent: { paddingBottom: 24, gap: 14 },
  sessionEyebrow: { color: '#FFE0A1', fontSize: 11, letterSpacing: 1.8, fontWeight: '800', marginBottom: 9 },
  sessionHeroTitle: { color: '#FFF9ED', fontSize: 29, lineHeight: 35, fontWeight: '800' },
  sessionHeroCopy: { color: '#E0EDE9', fontSize: 16, lineHeight: 24, marginTop: 9 },
  helperText: { color: '#AFC7C1', fontSize: 15, lineHeight: 22, marginVertical: 4 },
  sessionFooter: { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#173735' },
  feelingList: { gap: 9 },
  feelingOption: { minHeight: 72, flexDirection: 'row', alignItems: 'center', borderRadius: 19, backgroundColor: '#0E2A29', borderWidth: 1, borderColor: '#244A45', padding: 12 },
  feelingOptionCompact: { minHeight: 56 },
  feelingOptionSelected: { backgroundColor: '#E8CF9A', borderColor: '#F3DEA8' },
  feelingNumber: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#173E3B', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  feelingNumberSelected: { backgroundColor: '#173B38' },
  feelingNumberText: { color: '#F6D28E', fontWeight: '800' },
  feelingNumberTextSelected: { color: '#FFF3D4' },
  feelingTextWrap: { flex: 1 },
  feelingShort: { color: '#F4F8F5', fontSize: 16, fontWeight: '700' },
  feelingShortSelected: { color: '#173B38' },
  feelingDescription: { color: '#AFC7C1', fontSize: 13, lineHeight: 18, marginTop: 3 },
  feelingDescriptionSelected: { color: '#355B56' },
  gentleNotice: { borderColor: '#9B8251', backgroundColor: '#332D20' },
  input: { minHeight: 190, borderRadius: 20, borderWidth: 1, borderColor: '#31544F', backgroundColor: '#0B2524', color: '#F5F8F5', padding: 16, fontSize: 16, lineHeight: 24 },
  afterCheck: { marginTop: 16, gap: 11 },
  searchInput: { minHeight: 52, borderRadius: 18, borderWidth: 1, borderColor: '#31544F', backgroundColor: '#0B2524', color: '#F5F8F5', paddingHorizontal: 16, fontSize: 15 },
  singleLineInput: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: '#31544F', backgroundColor: '#0B2524', color: '#F5F8F5', paddingHorizontal: 14, fontSize: 15, marginTop: 7 },
  smallTextArea: { minHeight: 100, borderRadius: 16, borderWidth: 1, borderColor: '#31544F', backgroundColor: '#0B2524', color: '#F5F8F5', padding: 14, fontSize: 15, lineHeight: 22, marginTop: 7 },
  noteTextArea: { minHeight: 210, borderRadius: 16, borderWidth: 1, borderColor: '#31544F', backgroundColor: '#0B2524', color: '#F5F8F5', padding: 14, fontSize: 15, lineHeight: 23, marginTop: 7 },
  fieldLabel: { color: '#F2BC6D', fontSize: 11, letterSpacing: 1.3, fontWeight: '800', marginTop: 17 },
  chipRow: { gap: 8, paddingVertical: 9, paddingRight: 10 },
  chip: { minHeight: 40, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#355A55', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D2928' },
  chipSelected: { backgroundColor: '#F0C073', borderColor: '#F0C073' },
  chipText: { color: '#BFD2CD', fontWeight: '700' },
  chipTextSelected: { color: '#173B38' },
  librarySummaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryText: { color: '#8CA7A1', fontSize: 13 },
  collectionCard: { minHeight: 155, backgroundColor: '#0E2C2B', borderRadius: 23, borderWidth: 1, borderColor: '#28504B', padding: 18 },
  collectionTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kindBadge: { backgroundColor: '#214A43', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 12 },
  kindBadgeText: { color: '#F6CB81', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  collectionCount: { color: '#91ABA5', fontSize: 12 },
  collectionTitle: { color: '#FFF9ED', fontSize: 24, lineHeight: 30, fontWeight: '800', marginTop: 14 },
  collectionSubject: { color: '#F0C073', fontSize: 14, fontWeight: '700', marginTop: 5 },
  searchMatch: { color: '#A9D6C9', fontSize: 13, fontWeight: '700', marginTop: 10 },
  collectionActionRow: { flexDirection: 'row', gap: 10 },
  noteCoverageText: { color: '#91AAA5', fontSize: 13, lineHeight: 19, marginTop: -2 },
  noteCard: { backgroundColor: '#0E2A29', borderRadius: 21, borderWidth: 1, borderColor: '#21433F', padding: 18 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  tag: { color: '#F3CB86', backgroundColor: '#21453F', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, fontSize: 12 },
  examLayout: { flex: 1, paddingHorizontal: 18 },
  examContent: { paddingVertical: 24, paddingBottom: 40, gap: 15 },
  examContext: { color: '#F1C575', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  examQuestion: { color: '#FFF9ED', fontSize: 29, lineHeight: 36, fontWeight: '800' },
  examInput: { minHeight: 190, borderRadius: 20, borderWidth: 1, borderColor: '#31544F', backgroundColor: '#0B2524', color: '#F5F8F5', padding: 16, fontSize: 16, lineHeight: 24 },
  examFooter: { borderTopWidth: 1, borderTopColor: '#173735', paddingTop: 8 },
  choiceList: { gap: 11 },
  choice: { minHeight: 72, borderRadius: 18, borderWidth: 1, borderColor: '#31544F', backgroundColor: '#0D2928', padding: 15, justifyContent: 'center' },
  choiceSelected: { borderColor: '#F0C073', backgroundColor: '#263C30' },
  choiceCorrect: { borderColor: '#78C5A7', backgroundColor: '#183E33' },
  choiceWrong: { borderColor: '#D47A72', backgroundColor: '#402725' },
  choiceText: { color: '#EFF7F3', fontSize: 15, lineHeight: 22 },
  correctCard: { borderColor: '#4D9C7C' },
  reviewCard: { borderColor: '#A96A62' },
  selfGradeTitle: { color: '#FFF9ED', fontSize: 18, fontWeight: '700', marginTop: 5 },
  gradeRow: { flexDirection: 'row', gap: 10 },
  examScreen: { paddingHorizontal: 18, gap: 15 },
  scoreCard: { alignItems: 'center' },
  scoreValue: { color: '#F2C574', fontSize: 58, fontWeight: '800', marginBottom: 8 },
  reviewItem: { color: '#D8E7E3', fontSize: 15, lineHeight: 24, marginTop: 5 },
});
