// src/screens/BattleScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator,
  Alert, ScrollView, Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../constants/ThemeContext';
import { generateQuiz } from '../services/aiService';
import {
  generateRoomCode, createRoom, joinRoom,
  listenToRoom, submitAnswer, markDone, deleteRoom,
} from '../services/firebaseService';

const PHASE = {
  LOBBY: 'LOBBY',
  WAITING: 'WAITING',
  BATTLE: 'BATTLE',
  RESULT: 'RESULT',
};

export default function BattleScreen({ navigation }) {
  const { theme, isDark } = useTheme();

  const [phase, setPhase] = useState(PHASE.LOBBY);
  const [playerName, setPlayerName] = useState('');
  const [topic, setTopic] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [role, setRole] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [myScore, setMyScore] = useState(0);

  const unsubRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => {
    unsubRef.current?.();
    clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!roomData || phase !== PHASE.BATTLE) return;
    if (roomData.playerA?.done && roomData.playerB?.done) {
      setPhase(PHASE.RESULT);
      unsubRef.current?.();
    }
  }, [roomData]);

  useEffect(() => {
    if (phase !== PHASE.BATTLE || answered) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIdx, phase, answered]);

  const handleCreate = async () => {
    if (!playerName.trim() || !topic.trim()) {
      Alert.alert('Oops!', 'Enter both your name and the topic.');
      return;
    }
    setLoading(true);
    try {
      const questions = await generateQuiz(topic, 'medium', 5);
      const code = generateRoomCode();
      await createRoom(code, topic, questions, playerName.trim());
      setRoomCode(code);
      setRole('playerA');
      unsubRef.current = listenToRoom(code, (data) => {
        setRoomData(data);
        if (data?.status === 'active') setPhase(PHASE.BATTLE);
      });
      setPhase(PHASE.WAITING);
    } catch (e) {
      Alert.alert('Error', 'Room was not created. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !joinCode.trim()) {
      Alert.alert('Oops!', 'Both name and room code are required.');
      return;
    }
    setLoading(true);
    try {
      await joinRoom(joinCode.toUpperCase(), playerName.trim());
      setRoomCode(joinCode.toUpperCase());
      setRole('playerB');
      unsubRef.current = listenToRoom(joinCode.toUpperCase(), (data) => {
        setRoomData(data);
        if (data?.playerA?.done && data?.playerB?.done) setPhase(PHASE.RESULT);
      });
      setPhase(PHASE.BATTLE);
    } catch (e) {
      Alert.alert('Error', e.message || 'Room not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (option) => {
    if (answered || !roomData) return;
    clearInterval(timerRef.current);
    setAnswered(true);
    setSelected(option);

    const questions = roomData.questions;
    const q = questions[qIdx];
    const isCorrect = option === q.correctAnswer;
    const pts = isCorrect ? Math.max(5, timeLeft * 2) : 0;
    const newScore = myScore + pts;
    setMyScore(newScore);

    await submitAnswer(roomCode, role, qIdx, option, pts);

    setTimeout(async () => {
      if (qIdx + 1 >= questions.length) {
        await markDone(roomCode, role);
      } else {
        setQIdx(i => i + 1);
        setSelected(null);
        setAnswered(false);
        setTimeLeft(15);
      }
    }, 1400);
  };

  const s = makeStyles(theme);

  // ── LOBBY ──
  if (phase === PHASE.LOBBY) return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
  <Ionicons
    name="arrow-back"
    size={24}
    color={theme.primary}
  />
</TouchableOpacity>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.bigTitle}>⚔️ Battle Mode</Text>
        <Text style={[s.lobbyDesc, { color: theme.textMuted }]}>
          Real-time quiz with a friend!{'\n'}Same topic, same time — highest score wins.
        </Text>

        <Text style={s.label}>Name</Text>
        <TextInput style={s.input} placeholder="Enter Your Name" placeholderTextColor={theme.textMuted} value={playerName} onChangeText={setPlayerName} />

        <View style={[s.section, { borderColor: theme.border }]}>
          <Text style={s.sectionTitle}>Create Room</Text>
          <TextInput style={s.input} placeholder="Topic (e.g. Physics, History)" placeholderTextColor={theme.textMuted} value={topic} onChangeText={setTopic} />
          <TouchableOpacity style={[s.btn, { backgroundColor: theme.primary }]} onPress={handleCreate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Create Room →</Text>}
          </TouchableOpacity>
        </View>

        <Text style={[s.orTxt, { color: theme.textMuted }]}>— ya —</Text>

        <View style={[s.section, { borderColor: theme.border }]}>
          <Text style={s.sectionTitle}>Join Room</Text>
          <TextInput style={[s.input, { letterSpacing: 4, textTransform: 'uppercase' }]} placeholder="Room code" placeholderTextColor={theme.textMuted} value={joinCode} onChangeText={t => setJoinCode(t.toUpperCase())} maxLength={6} autoCapitalize="characters" />
          <TouchableOpacity style={[s.btn, { backgroundColor: theme.secondary }]} onPress={handleJoin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Join Battle →</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // ── WAITING ──
  if (phase === PHASE.WAITING) return (
    <SafeAreaView style={[s.root, s.center]}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>⏳</Text>
      <Text style={s.waitTitle}>Room ready!</Text>
      <Text style={[s.waitSub, { color: theme.textMuted }]}>Send this code to your friend:</Text>
      <TouchableOpacity
        style={[s.codeBox, { backgroundColor: theme.card, borderColor: theme.primary }]}
        onPress={() => { Clipboard.setString(roomCode); Alert.alert('Copied!', 'Room code copied!'); }}
      >
        <Text style={[s.codeTxt, { color: theme.primary }]}>{roomCode}</Text>
        <Text style={[{ fontSize: 12, marginTop: 6 }, { color: theme.textMuted }]}>Tap to copy</Text>
      </TouchableOpacity>
      <ActivityIndicator color={theme.primary} style={{ marginTop: 24 }} />
      <Text style={[{ fontSize: 13, marginTop: 12 }, { color: theme.textMuted }]}>
        Waiting for my friend to join...
      </Text>
      <Text style={[{ fontSize: 14, fontWeight: '600', marginTop: 8 }, { color: theme.accent }]}>
        Topic: {topic}
      </Text>
    </SafeAreaView>
  );

  // ── BATTLE ──
  if (phase === PHASE.BATTLE && roomData) {
    const questions = roomData.questions || [];
    if (!questions.length) return null;
    const q = questions[qIdx];
    const opp = role === 'playerA' ? 'playerB' : 'playerA';
    const me = roomData[role];
    const oppData = roomData[opp];

    const getOptC = (opt) => {
      if (!answered) return { bg: theme.card, border: theme.border, txt: theme.text };
      if (opt === q.correctAnswer) return { bg: theme.successBg, border: theme.success, txt: theme.success };
      if (opt === selected) return { bg: theme.dangerBg, border: theme.danger, txt: theme.danger };
      return { bg: theme.card, border: theme.border, txt: theme.textMuted };
    };

    return (
      <SafeAreaView style={s.root}>
        <View style={[s.scoreboard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={s.scoreCol}>
            <Text style={[s.scoreName, { color: theme.text }]} numberOfLines={1}>{me?.name || 'You'}</Text>
            <Text style={[s.scoreNum, { color: theme.primary }]}>{me?.score || 0}</Text>
            <Text style={{ fontSize: 10, color: theme.secondary, fontWeight: '800' }}>YOU</Text>
          </View>
          <View style={s.vsCol}>
            <Text style={[s.vsTxt, { color: theme.danger }]}>VS</Text>
            <Text style={[{ fontSize: 11, marginTop: 4 }, { color: theme.textMuted }]}>{qIdx + 1}/{questions.length}</Text>
          </View>
          <View style={s.scoreCol}>
            <Text style={[s.scoreName, { color: theme.text }]} numberOfLines={1}>{oppData?.name || 'Opponent'}</Text>
            <Text style={[s.scoreNum, { color: theme.secondary }]}>{oppData?.score || 0}</Text>
            <Text style={{ fontSize: 10, color: theme.primary, fontWeight: '800' }}>OPP</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={[s.timerRing, { borderColor: timeLeft <= 5 ? theme.danger : theme.accent }]}>
            <Text style={[s.timerNum, { color: timeLeft <= 5 ? theme.danger : theme.text }]}>{timeLeft}</Text>
          </View>
          <Text style={s.question}>{q.question}</Text>

          {q.options.map((opt, i) => {
            const { bg, border, txt } = getOptC(opt);
            return (
              <TouchableOpacity key={i} style={[s.option, { backgroundColor: bg, borderColor: border }]} onPress={() => handleAnswer(opt)} disabled={answered} activeOpacity={0.8}>
                <View style={[s.optLetter, { backgroundColor: theme.secondary + '22' }]}>
                  <Text style={[s.optLetterTxt, { color: theme.secondary }]}>{String.fromCharCode(65 + i)}</Text>
                </View>
                <Text style={[s.optTxt, { color: txt }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}

          {answered && (
            <View style={[s.explBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[s.explTxt, { color: theme.textMuted }]}>{q.explanation}</Text>
            </View>
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── RESULT ──
  if (phase === PHASE.RESULT && roomData) {
    const aScore = roomData.playerA?.score || 0;
    const bScore = roomData.playerB?.score || 0;
    const myFinal = role === 'playerA' ? aScore : bScore;
    const oppFinal = role === 'playerA' ? bScore : aScore;
    const oppName = role === 'playerA' ? roomData.playerB?.name : roomData.playerA?.name;
    const iWon = myFinal > oppFinal;
    const isDraw = myFinal === oppFinal;

    useEffect(() => { deleteRoom(roomCode).catch(() => { }); }, []);

    return (
      <SafeAreaView style={[s.root, s.center]}>
        <Text style={{ fontSize: 64, marginBottom: 8 }}>{isDraw ? '🤝' : iWon ? '🏆' : '😢'}</Text>
        <Text style={[s.resultTitle, { color: isDraw ? theme.accent : iWon ? theme.success : theme.danger }]}>
          {isDraw ? 'Draw!' : iWon ? 'Tum jeet gaye! 🎉' : 'Agli baar! 💪'}
        </Text>
        <View style={[s.resultBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {[['You', myFinal, theme.primary], [oppName || 'Opponent', oppFinal, theme.secondary]].map(([name, sc, color]) => (
            <View key={name} style={s.resultRow}>
              <Text style={[s.rName, { color: theme.text }]}>{name}</Text>
              <Text style={[s.rScore, { color }]}>{sc} pts</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[s.btn, { backgroundColor: theme.primary, marginTop: 24, width: '100%' }]} onPress={() => { setPhase(PHASE.LOBBY); setMyScore(0); setQIdx(0); }}>
          <Text style={s.btnTxt}>Play Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btnOut, { borderColor: theme.border, width: '100%', marginTop: 10 }]} onPress={() => navigation.navigate('Home')}>
          <Text style={[s.btnOutTxt, { color: theme.textMuted }]}>Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return <SafeAreaView style={[s.root, s.center]}><ActivityIndicator color={theme.primary} size="large" /></SafeAreaView>;
}

const makeStyles = (theme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  bigTitle: { fontSize: 32, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 10 },
  lobbyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  label: { fontSize: 13, fontWeight: '700', color: theme.textMuted, marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: theme.text, marginBottom: 10 },
  section: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 12 },
  btn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  backBtn: {
    
  paddingHorizontal: 20,

  paddingTop: 16,
  
  paddingBottom: 4,
  alignSelf: 'flex-start',
  
},
  btnOut: { borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1.5 },
  btnOutTxt: { fontSize: 14, fontWeight: '600' },
  orTxt: { textAlign: 'center', fontSize: 14, marginVertical: 8 },
  waitTitle: { fontSize: 24, fontWeight: '800', color: theme.text, marginBottom: 6 },
  waitSub: { fontSize: 14, marginBottom: 20 },
  codeBox: { borderRadius: 16, borderWidth: 2, paddingVertical: 20, paddingHorizontal: 40, alignItems: 'center' },
  codeTxt: { fontSize: 38, fontWeight: '900', letterSpacing: 8 },
  scoreboard: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, alignItems: 'center' },
  scoreCol: { flex: 2, alignItems: 'center' },
  vsCol: { flex: 1, alignItems: 'center' },
  scoreName: { fontSize: 13, fontWeight: '600', marginBottom: 2, maxWidth: 90 },
  scoreNum: { fontSize: 28, fontWeight: '800' },
  
  vsTxt: { fontSize: 20, fontWeight: '900' },
  timerRing: { alignSelf: 'center', width: 68, height: 68, borderRadius: 34, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginTop: 16, marginBottom: 16 },
  timerNum: { fontSize: 26, fontWeight: '800' },
  question: { fontSize: 18, fontWeight: '700', color: theme.text, lineHeight: 28, textAlign: 'center', marginBottom: 20 },
  option: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 10 },
  optLetter: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  optLetterTxt: { fontSize: 13, fontWeight: '800' },
  optTxt: { flex: 1, fontSize: 15, lineHeight: 22 },
  explBox: { borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 4 },
  explTxt: { fontSize: 13, lineHeight: 20 },
  resultTitle: { fontSize: 28, fontWeight: '800', marginBottom: 20 },
  resultBox: { borderRadius: 16, borderWidth: 1, padding: 20, width: '100%' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rName: { fontSize: 16, fontWeight: '600' },
  rScore: { fontSize: 22, fontWeight: '800' },
});