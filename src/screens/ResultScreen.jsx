// src/screens/ResultScreen.jsx

import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../constants/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResultScreen({ route, navigation }) {
  const { theme, isDark } = useTheme();
  const { score, total, questions, topic, mood } = route.params;

  const maxScore = total * 30;
  const percent  = Math.min(100, Math.round((score / maxScore) * 100));
  const xp       = Math.floor(score * 1.5);
  const medal    = percent >= 80 ? '🥇' : percent >= 50 ? '🥈' : '🥉';
  const msg      = percent >= 80 ? 'Excellent! 🔥' : percent >= 50 ? 'Good Job! 👍' : 'Keep Going! 💪';

  useEffect(() => {
    const save = async () => {
      try {
        const existing = await AsyncStorage.getItem('bq_scores');
        const arr = existing ? JSON.parse(existing) : [];
        arr.unshift({ topic, score, xp, percent, date: Date.now() });
        await AsyncStorage.setItem('bq_scores', JSON.stringify(arr.slice(0, 20)));
      } catch (e) {}
    };
    save();
  }, []);

  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <Text style={s.medal}>{medal}</Text>
        <Text style={s.msg}>{msg}</Text>
        <Text style={s.scoreNum}>{score} pts</Text>

        <View style={[s.xpBadge, { backgroundColor: theme.accent + '22' }]}>
          <Text style={[s.xpTxt, { color: theme.accent }]}>+{xp} XP earned!</Text>
        </View>

        <View style={s.statsRow}>
          {[
            [percent + '%', 'Accuracy', theme.primary],
            [total.toString(), 'Questions', theme.secondary],
            [xp.toString(), 'XP', theme.accent],
          ].map(([val, lbl, color]) => (
            <View key={lbl} style={[s.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[s.statVal, { color }]}>{val}</Text>
              <Text style={[s.statLbl, { color: theme.textMuted }]}>{lbl}</Text>
            </View>
          ))}
        </View>

        <Text style={[s.topicTag, { color: theme.textMuted }]}>
          {mood.emoji} {topic} • {mood.difficulty}
        </Text>

        <Text style={s.reviewTitle}>Question Review</Text>

        {questions.map((q, i) => (
          <View key={i} style={[s.reviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={s.reviewTop}>
              <View style={[s.qBadge, { backgroundColor: theme.secondary + '22' }]}>
                <Text style={[s.qNum, { color: theme.secondary }]}>Q{i + 1}</Text>
              </View>
              <Text style={[s.reviewQ, { color: theme.text }]} numberOfLines={3}>{q.question}</Text>
            </View>
            <View style={[s.correctRow, { backgroundColor: theme.successBg }]}>
              <Text style={[s.correctTxt, { color: theme.success }]}>✓ {q.correctAnswer}</Text>
            </View>
            <Text style={[s.expTxt, { color: theme.textMuted }]}>{q.explanation}</Text>
          </View>
        ))}

        <TouchableOpacity style={[s.btn, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('Search', { mood })}>
          <Text style={s.btnTxt}>New Topic →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.btn, { backgroundColor: theme.secondary }]} onPress={() => navigation.navigate('Battle')}>
          <Text style={s.btnTxt}>⚔️  Battle Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.btnOut, { borderColor: theme.border }]} onPress={() => navigation.navigate('Home')}>
          <Text style={[s.btnOutTxt, { color: theme.textMuted }]}>Back to Home</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  root       : { flex: 1, backgroundColor: theme.background },
  scroll     : { paddingHorizontal: 20, paddingBottom: 20, alignItems: 'center' },
  medal      : { fontSize: 72, marginTop: 32, marginBottom: 4 },
  msg        : { fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 4 },
  scoreNum   : { fontSize: 52, fontWeight: '900', color: theme.primary, marginBottom: 12 },
  xpBadge    : { borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 22 },
  xpTxt      : { fontSize: 16, fontWeight: '700' },
  statsRow   : { flexDirection: 'row', gap: 10, marginBottom: 14, width: '100%' },
  statBox    : { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center' },
  statVal    : { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  statLbl    : { fontSize: 12 },
  topicTag   : { fontSize: 13, marginBottom: 24 },
  reviewTitle: { fontSize: 18, fontWeight: '700', color: theme.text, alignSelf: 'flex-start', marginBottom: 12 },
  reviewCard : { width: '100%', borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  reviewTop  : { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  qBadge     : { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  qNum       : { fontSize: 12, fontWeight: '700' },
  reviewQ    : { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  correctRow : { borderRadius: 8, padding: 8, marginBottom: 8 },
  correctTxt : { fontSize: 13, fontWeight: '700' },
  expTxt     : { fontSize: 12, lineHeight: 18 },
  btn        : { width: '100%', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 10 },
  btnTxt     : { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnOut     : { width: '100%', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, marginBottom: 8 },
  btnOutTxt  : { fontSize: 15, fontWeight: '600' },
});