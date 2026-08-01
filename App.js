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

const STORAGE_KEY = '@daypath/state/v2';
const AUDIO_PATH = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}daypath-dawn-preview.ogg`
  : null;

const INITIAL_STATE = {
  target: 'Speaking clearly instead of reacting automatically',
  direction: 'Speaking honestly and calmly',
  sessions: [],
  settings: {
    sound: true,
    volume: 0.28,
    ai: false,
  },
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
    };
  } catch {
    return INITIAL_STATE;
  }
}

function PrimaryButton({ children, onPress, disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.primaryButtonText}>{children}</Text>
    </Pressable>
  );
}

function SecondaryButton({ children, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
    >
      <Text style={styles.secondaryButtonText}>{children}</Text>
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
          {error ? 'Sound could not start' : ready ? (enabled ? 'Playing softly' : 'Paused') : 'Preparing sound'}
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

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (active) setState(mergeSavedState(raw));
      })
      .finally(() => {
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

  const shouldPause = intensityBefore >= 8;

  function updateSetting(key, value) {
    setState((current) => ({
      ...current,
      settings: { ...current.settings, [key]: value },
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

  function finish() {
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

  function next() {
    if (step === 0 && shouldPause) return;
    if (step < SESSION_STEPS.length - 1) setStep((current) => current + 1);
    else finish();
  }

  function clearData() {
    Alert.alert(
      'Delete your saved sessions?',
      'This removes all locally saved sessions and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => setState(INITIAL_STATE) },
      ],
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
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.sessionContent}
              >
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
                <PrimaryButton onPress={next}>
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

          {screen === 'progress' && (
            <>
              <PageHeader screen="progress" />
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
                    <Text style={styles.cardBody}>Not connected in this build. Your session writing stays on this device.</Text>
                  </View>
                  <Switch value={false} disabled />
                </View>
              </Card>

              <Card>
                <Text style={styles.cardEyebrow}>WHAT DAYPATH IS</Text>
                <Text style={styles.cardBody}>
                  Daypath is a guided self-reflection and behavior-change tool. It is not therapy, diagnosis, medical treatment, or emergency support.
                </Text>
              </Card>
              <SecondaryButton onPress={clearData}>Delete saved sessions</SecondaryButton>
            </>
          )}
        </ScrollView>

        <SoundBar
          enabled={state.settings.sound}
          ready={audioReady}
          error={audioError}
          onToggle={() => updateSetting('sound', !state.settings.sound)}
        />
        <BottomNavigation screen={screen === 'support' ? 'home' : screen} onChange={setScreen} bottomInset={insets.bottom} />
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
  },
  primaryButtonText: { color: '#102A28', fontSize: 17, fontWeight: '800' },
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
  secondaryButtonText: { color: '#EAF4F0', fontSize: 16, fontWeight: '700' },
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
  metricValue: { color: '#F5C67D', fontSize: 34, fontWeight: '800' },
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
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  navItem: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center' },
  navMarker: { width: 22, height: 3, borderRadius: 2, backgroundColor: 'transparent', marginBottom: 7 },
  navMarkerSelected: { backgroundColor: '#F1B961' },
  navText: { color: '#718783', fontSize: 13, fontWeight: '700' },
  navTextSelected: { color: '#F6E4BD' },
  sessionScreen: { flex: 1 },
  sessionTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18 },
  closeButton: { minWidth: 58, minHeight: 42, justifyContent: 'center' },
  closeButtonText: { color: '#D6E5E1', fontSize: 15, fontWeight: '700' },
  stepCount: { color: '#8FA9A3', fontSize: 13, fontWeight: '700' },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: '#173735', marginHorizontal: 18, marginTop: 5 },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: '#F1B961' },
  sessionContent: { padding: 18, gap: 14 },
  sessionEyebrow: { color: '#FFE0A0', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  sessionHeroTitle: { color: '#FFF9ED', fontSize: 30, lineHeight: 36, fontWeight: '800' },
  sessionHeroCopy: { color: '#E0ECE8', fontSize: 16, lineHeight: 24, marginTop: 10 },
  helperText: { color: '#C5D8D3', fontSize: 15, lineHeight: 22 },
  feelingList: { gap: 9 },
  feelingOption: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2B4A46',
    backgroundColor: '#0D2726',
    padding: 12,
  },
  feelingOptionCompact: { minHeight: 52 },
  feelingOptionSelected: { borderColor: '#F1BB66', backgroundColor: '#173532' },
  feelingNumber: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#173A37', marginRight: 12 },
  feelingNumberSelected: { backgroundColor: '#F1BB66' },
  feelingNumberText: { color: '#D6E4E0', fontWeight: '800' },
  feelingNumberTextSelected: { color: '#17312F' },
  feelingTextWrap: { flex: 1 },
  feelingShort: { color: '#EAF2EF', fontSize: 15, fontWeight: '700' },
  feelingShortSelected: { color: '#FFF8E9' },
  feelingDescription: { color: '#9FB8B2', fontSize: 13, lineHeight: 18, marginTop: 3 },
  feelingDescriptionSelected: { color: '#D6E5E1' },
  gentleNotice: { borderColor: '#8B7045', backgroundColor: '#2F352A' },
  input: {
    minHeight: 230,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#31534E',
    backgroundColor: '#0B2423',
    color: '#FFF9ED',
    fontSize: 17,
    lineHeight: 25,
    padding: 18,
  },
  afterCheck: { marginTop: 12, gap: 10 },
  sessionFooter: { paddingHorizontal: 18, paddingTop: 4 },
});
