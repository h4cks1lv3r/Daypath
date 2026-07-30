import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const STORAGE_KEY = '@daypath/state/v1';
const steps = [
  ['Pause and place', 'Rate your activation from 0–10. Name three neutral things you can see.'],
  ['Record reality', 'What would a camera or transcript show? Separate facts from your interpretation.'],
  ['Own the protector', 'What danger did this pattern predict, and what short-term relief did it offer?'],
  ['Open the update', 'What value matters now, and what is different from the old rule?'],
  ['Forge one proof', 'Choose one small observable action you can complete within 24 hours.'],
];

const scenarios = [
  ['Waiting for a reply', 'Slow down the story before sending another message.'],
  ['Hard conversation', 'Prepare one clear and grounded sentence.'],
  ['Serious mistake', 'Face impact, responsibility, and repair.'],
  ['Overwhelmed', 'Reduce the next ten minutes to one safe step.'],
  ['Rejection', 'Separate the event from the global verdict.'],
  ['Cannot start', 'Turn perfectionism into ten minutes of visible work.'],
  ['Grief wave', 'Touch one edge of the loss without forcing the whole story open.'],
  ['Anger surge', 'Create space before acting.'],
];

const initial = {
  target: 'Responding clearly instead of reacting automatically',
  value: 'Grounded honesty',
  sessions: [],
  settings: { sound: true, ai: false, soundscape: 'Dawn' },
};

function Button({ children, onPress, secondary = false }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.buttonSecondary, pressed && { opacity: 0.8 }]}>
      <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{children}</Text>
    </Pressable>
  );
}

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export default function App() {
  const [state, setState] = useState(initial);
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [step, setStep] = useState(0);
  const [activation, setActivation] = useState(4);
  const [answers, setAnswers] = useState(['', '', '', '', '']);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) setState(JSON.parse(raw));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const completed = state.sessions.length;
  const proofs = state.sessions.filter(s => s.proof).length;
  const avgActivation = useMemo(() => {
    if (!completed) return 0;
    return Math.round(state.sessions.reduce((sum, s) => sum + s.activation, 0) / completed);
  }, [state.sessions, completed]);

  function begin(type, selected = null) {
    setMode(type);
    setScenario(selected);
    setStep(0);
    setActivation(4);
    setAnswers(['', '', '', '', '']);
  }

  function finish() {
    const session = {
      id: Date.now(),
      type: mode,
      title: scenario || 'Daily PROOF',
      activation,
      facts: answers[1],
      protector: answers[2],
      value: answers[3],
      proof: answers[4],
      createdAt: new Date().toISOString(),
    };
    setState(current => ({ ...current, sessions: [session, ...current.sessions] }));
    setMode(null);
    setScenario(null);
    setScreen('home');
  }

  function next() {
    if (step === 0 && activation >= 7) return;
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  }

  function clearData() {
    Alert.alert('Delete all local progress?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setState(initial) },
    ]);
  }

  if (mode) {
    if (step === 0 && activation >= 7) {
      return (
        <SafeAreaView style={styles.safe}>
          <StatusBar style="light" />
          <View style={styles.sessionWrap}>
            <Text style={styles.kicker}>PAUSE</Text>
            <Text style={styles.sessionTitle}>Stop the deeper questions for now.</Text>
            <Text style={styles.body}>Keep your eyes open. Name the date and place. Move toward safety and contact a trusted person or qualified professional. Use emergency services when there is immediate danger.</Text>
            <Card style={styles.warning}>
              <Text style={styles.warningTitle}>Do this now</Text>
              <Text style={styles.body}>Put both feet on the floor, name three objects, and choose one immediate support action.</Text>
            </Card>
            <Button onPress={() => setActivation(6)}>I am steadier now</Button>
            <Button secondary onPress={() => setMode(null)}>Close session</Button>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <View style={styles.sessionWrap}>
          <View style={styles.progress}><View style={[styles.progressFill, { width: `${((step + 1) / steps.length) * 100}%` }]} /></View>
          <Text style={styles.kicker}>{mode === 'scenario' ? scenario?.toUpperCase() : 'DAILY PROOF'} · {step + 1}/{steps.length}</Text>
          <Text style={styles.sessionTitle}>{steps[step][0]}</Text>
          <Text style={styles.body}>{steps[step][1]}</Text>
          {step === 0 ? (
            <View>
              <Text style={styles.rating}>{activation}</Text>
              <View style={styles.row}>{[0,2,4,6,8,10].map(n => (
                <Pressable key={n} onPress={() => setActivation(n)} style={[styles.pill, activation === n && styles.pillActive]}>
                  <Text style={[styles.pillText, activation === n && styles.pillTextActive]}>{n}</Text>
                </Pressable>
              ))}</View>
            </View>
          ) : (
            <TextInput
              value={answers[step]}
              onChangeText={text => setAnswers(current => current.map((v, i) => i === step ? text : v))}
              multiline
              placeholder="Write what is true for you…"
              placeholderTextColor="#7E9392"
              style={styles.input}
            />
          )}
          <Card style={styles.ambient}><Text style={styles.kicker}>AMBIENT GUIDE</Text><Text style={styles.cardTitle}>{state.settings.soundscape} · quiet, spacious, steady</Text></Card>
          <View style={{ flex: 1 }} />
          <Button onPress={next}>{step === steps.length - 1 ? 'Save session' : 'Continue'}</Button>
          {step > 0 && <Button secondary onPress={() => setStep(step - 1)}>Back</Button>}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        {screen === 'home' && <>
          <View style={styles.hero}>
            <View style={styles.sun} />
            <Text style={styles.logo}>DAYPATH</Text>
            <Text style={styles.heroTitle}>A clearer path, one day at a time.</Text>
            <Text style={styles.heroCopy}>Notice accurately. Choose deliberately. Act concretely.</Text>
            <Button onPress={() => begin('daily')}>Start today’s session</Button>
          </View>
          <Pressable style={styles.scenarioHero} onPress={() => setScreen('scenarios')}>
            <View style={{ flex: 1 }}><Text style={styles.kicker}>IMMEDIATE GUIDANCE</Text><Text style={styles.cardTitle}>Help me through this</Text><Text style={styles.body}>A short grounded walkthrough for a specific life event.</Text></View>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
          <Text style={styles.section}>Today’s direction</Text>
          <Card><Text style={styles.kicker}>CURRENT FOCUS</Text><Text style={styles.cardTitle}>{state.target}</Text><Text style={styles.body}>Practicing: {state.value}</Text></Card>
          <Card><Text style={styles.kicker}>LATEST PROOF</Text><Text style={styles.cardTitle}>{state.sessions[0]?.proof || 'Complete a session to define one small proof action.'}</Text></Card>
        </>}

        {screen === 'scenarios' && <>
          <Text style={styles.pageTitle}>What is happening right now?</Text>
          <Text style={styles.body}>Choose the closest fit. The guide will help slow the situation down and identify one sane next action.</Text>
          {scenarios.map(([title, subtitle]) => (
            <Pressable key={title} style={styles.listCard} onPress={() => begin('scenario', title)}>
              <View style={{ flex: 1 }}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.body}>{subtitle}</Text></View><Text style={styles.arrow}>→</Text>
            </Pressable>
          ))}
        </>}

        {screen === 'sessions' && <>
          <Text style={styles.pageTitle}>Prior sessions</Text>
          <Text style={styles.body}>Evidence, not perfection. Every return counts.</Text>
          {!state.sessions.length && <Card><Text style={styles.cardTitle}>No sessions yet</Text><Text style={styles.body}>Your completed sessions will appear here.</Text></Card>}
          {state.sessions.map(item => <Card key={item.id}><Text style={styles.kicker}>{item.type === 'scenario' ? 'SCENARIO' : 'DAILY PROOF'}</Text><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.meta}>{new Date(item.createdAt).toLocaleDateString()}</Text><Text style={styles.label}>FACTS</Text><Text style={styles.body}>{item.facts || 'Not recorded'}</Text><Text style={styles.label}>PROOF</Text><Text style={styles.body}>{item.proof || 'Not recorded'}</Text></Card>)}
        </>}

        {screen === 'progress' && <>
          <Text style={styles.pageTitle}>Practice evidence</Text>
          <Text style={styles.body}>Daypath tracks behavior and recovery. It does not claim to measure brain rewiring or dendritic change.</Text>
          <View style={styles.metricRow}><Card style={styles.metric}><Text style={styles.metricValue}>{completed}</Text><Text style={styles.meta}>Sessions</Text></Card><Card style={styles.metric}><Text style={styles.metricValue}>{proofs}</Text><Text style={styles.meta}>Proofs</Text></Card><Card style={styles.metric}><Text style={styles.metricValue}>{avgActivation}</Text><Text style={styles.meta}>Avg. activation</Text></Card></View>
          <Card><Text style={styles.kicker}>PRACTICE HORIZON</Text><Text style={styles.cardTitle}>{completed < 7 ? 'Building the ritual' : completed < 21 ? 'Gathering repeated evidence' : 'Consolidating a steadier response'}</Text><Text style={styles.body}>Progress means noticing earlier, reducing damage, completing more proof actions, and returning faster after a miss.</Text></Card>
        </>}

        {screen === 'settings' && <>
          <Text style={styles.pageTitle}>Options</Text>
          <Card><View style={styles.setting}><View><Text style={styles.cardTitle}>Ambient sound</Text><Text style={styles.body}>Interface control for the future audio engine.</Text></View><Switch value={state.settings.sound} onValueChange={sound => setState(s => ({ ...s, settings: { ...s.settings, sound } }))} /></View></Card>
          <Card><View style={styles.setting}><View><Text style={styles.cardTitle}>Optional AI assistance</Text><Text style={styles.body}>Disabled by default. No provider is connected in this prototype.</Text></View><Switch value={state.settings.ai} onValueChange={ai => setState(s => ({ ...s, settings: { ...s.settings, ai } }))} /></View></Card>
          <Card><Text style={styles.kicker}>SCOPE</Text><Text style={styles.body}>Daypath is an educational self-reflection and behavior-change tool. It is not psychotherapy, diagnosis, medical treatment, or emergency support.</Text></Card>
          <Button secondary onPress={clearData}>Delete local progress</Button>
        </>}
      </ScrollView>
      <View style={styles.nav}>
        {[['home','Home'],['sessions','Sessions'],['progress','Progress'],['settings','Settings']].map(([id,label]) => <Pressable key={id} onPress={() => setScreen(id)} style={styles.navItem}><Text style={[styles.navText, screen === id && styles.navTextActive]}>{label}</Text></Pressable>)}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#081716' },
  content: { padding: 20, paddingBottom: 120, gap: 14 },
  hero: { minHeight: 420, borderRadius: 30, padding: 26, backgroundColor: '#173B38', overflow: 'hidden', justifyContent: 'flex-end' },
  sun: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: '#F0B86B', opacity: 0.22, top: -60, right: -40 },
  logo: { color: '#F1CC91', letterSpacing: 4, fontWeight: '800', marginBottom: 18 },
  heroTitle: { color: '#FFF8EB', fontSize: 38, lineHeight: 43, fontWeight: '800', maxWidth: 320 },
  heroCopy: { color: '#C6D8D4', fontSize: 16, lineHeight: 24, marginVertical: 18 },
  button: { backgroundColor: '#F0B86B', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 18, alignItems: 'center', marginTop: 12 },
  buttonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#466460' },
  buttonText: { color: '#10201E', fontWeight: '800', fontSize: 16 },
  buttonSecondaryText: { color: '#D9E8E4' },
  card: { backgroundColor: '#102321', padding: 18, borderRadius: 22, borderWidth: 1, borderColor: '#1B3834' },
  scenarioHero: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E7C993', padding: 20, borderRadius: 24 },
  kicker: { color: '#D9A85F', fontSize: 11, letterSpacing: 2, fontWeight: '800', marginBottom: 8 },
  cardTitle: { color: '#FFF8EB', fontSize: 20, fontWeight: '750', lineHeight: 26 },
  body: { color: '#AFC2BE', fontSize: 15, lineHeight: 22, marginTop: 8 },
  arrow: { color: '#173B38', fontSize: 30, marginLeft: 12 },
  section: { color: '#FFF8EB', fontSize: 22, fontWeight: '800', marginTop: 12 },
  pageTitle: { color: '#FFF8EB', fontSize: 34, lineHeight: 40, fontWeight: '800', marginTop: 8 },
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#102321', padding: 18, borderRadius: 22, borderWidth: 1, borderColor: '#1B3834' },
  meta: { color: '#7E9392', marginTop: 6 },
  label: { color: '#D9A85F', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: 16 },
  metricRow: { flexDirection: 'row', gap: 8 },
  metric: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  metricValue: { color: '#F0B86B', fontSize: 30, fontWeight: '800' },
  setting: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  nav: { position: 'absolute', left: 12, right: 12, bottom: 10, flexDirection: 'row', backgroundColor: '#102321', borderRadius: 20, borderWidth: 1, borderColor: '#24413E', padding: 8 },
  navItem: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  navText: { color: '#718986', fontSize: 12, fontWeight: '700' },
  navTextActive: { color: '#F0B86B' },
  sessionWrap: { flex: 1, padding: 24 },
  progress: { height: 4, borderRadius: 4, backgroundColor: '#1A3431', overflow: 'hidden', marginBottom: 24 },
  progressFill: { height: 4, backgroundColor: '#F0B86B' },
  sessionTitle: { color: '#FFF8EB', fontSize: 36, lineHeight: 42, fontWeight: '800' },
  rating: { color: '#F0B86B', fontSize: 70, fontWeight: '800', textAlign: 'center', marginVertical: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  pill: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#102321', alignItems: 'center' },
  pillActive: { backgroundColor: '#F0B86B' },
  pillText: { color: '#B7C7C4', fontWeight: '800' },
  pillTextActive: { color: '#10201E' },
  input: { minHeight: 180, marginTop: 22, padding: 18, borderRadius: 22, backgroundColor: '#102321', color: '#FFF8EB', fontSize: 17, lineHeight: 25, textAlignVertical: 'top', borderWidth: 1, borderColor: '#24413E' },
  ambient: { marginTop: 18, backgroundColor: '#0D1F1D' },
  warning: { marginVertical: 22, borderColor: '#A77945', backgroundColor: '#2C2117' },
  warningTitle: { color: '#F0B86B', fontSize: 20, fontWeight: '800' },
});
