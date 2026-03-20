// src/screens/HomeScreen.jsx

import React, { useState ,useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView,
} from 'react-native';
import { useTheme } from '../constants/ThemeContext';
import { testGemini } from '../services/geminiService';

const MOODS = [
  { emoji: '😴', label: 'Tired',   difficulty: 'easy',   count: 3  },
  { emoji: '😊', label: 'Chill',   difficulty: 'easy',   count: 5  },
  { emoji: '😎', label: 'Focused', difficulty: 'medium', count: 7  },
  { emoji: '🔥', label: 'Pumped',  difficulty: 'hard',   count: 10 },
  { emoji: '⚡', label: 'Beast',   difficulty: 'hard',   count: 15 },
];

export default function HomeScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const [moodIdx, setMoodIdx] = useState(2);
  const mood = MOODS[moodIdx];
  const s = makeStyles(theme);


  useEffect(() => {
  testGemini();
}, []);
  return (
    <SafeAreaView style={s.root}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Top bar */}
        <View style={s.topBar}>
          <View>
            <Text style={s.logo}>BrainQuest</Text>
            <Text style={s.tagline}>Learn anything. Beat everyone.</Text>
          </View>
          <TouchableOpacity style={s.themeBtn} onPress={toggleTheme}>
            <Text style={{ fontSize: 20 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>

        {/* Mood card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Aaj kaisa feel ho raha hai? 🤔</Text>
          <Text style={s.cardSub}>Mood ke hisaab se quiz adjust hoga</Text>

          <View style={s.moodRow}>
            {MOODS.map((m, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  s.moodBtn,
                  moodIdx === i && {
                    backgroundColor: theme.primary + '25',
                    borderColor: theme.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setMoodIdx(i)}
              >
                <Text style={s.moodEmoji}>{m.emoji}</Text>
                <Text style={s.moodLabel}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.pillRow}>
            <View style={[s.pill, { backgroundColor: theme.accent + '22' }]}>
              <Text style={[s.pillTxt, { color: theme.accent }]}>
                {mood.count} questions
              </Text>
            </View>
            <View style={[s.pill, { backgroundColor: theme.secondary + '22' }]}>
              <Text style={[s.pillTxt, { color: theme.secondary }]}>
                {mood.difficulty} mode
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {[['3', 'APIs'], ['5', 'Screens'], ['∞', 'Topics']].map(([val, lbl]) => (
            <View key={lbl} style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[s.statNum, { color: theme.primary }]}>{val}</Text>
              <Text style={[s.statLbl, { color: theme.textMuted }]}>{lbl}</Text>
            </View>
          ))}
        </View>

        {/* Start button */}
        <TouchableOpacity
          style={[s.startBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('Search', { mood })}
          activeOpacity={0.85}
        >
          <Text style={s.startTxt}>Start Quest  →</Text>
        </TouchableOpacity>

        {/* Battle button */}
        <TouchableOpacity
          style={[s.battleBtn, { borderColor: theme.secondary, backgroundColor: theme.secondary + '15' }]}
          onPress={() => navigation.navigate('Battle')}
          activeOpacity={0.85}
        >
          <Text style={[s.battleTxt, { color: theme.secondary }]}>
            ⚔️  Battle Mode — Challenge a Friend
          </Text>
        </TouchableOpacity>

        <Text style={[s.footer, { color: theme.textMuted }]}>
          Powered by Gemini AI + Open Library
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  root     : { flex: 1, backgroundColor: theme.background },
  scroll   : { paddingHorizontal: 20, paddingBottom: 40 },
  topBar   : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 20, marginBottom: 28 },
  logo     : { fontSize: 30, fontWeight: '800', color: theme.primary },
  tagline  : { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  themeBtn : { padding: 10, borderRadius: 22, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  card     : { backgroundColor: theme.card, borderRadius: 18, borderWidth: 1, borderColor: theme.border, padding: 20, marginBottom: 18 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 4 },
  cardSub  : { fontSize: 13, color: theme.textMuted, marginBottom: 18 },
  moodRow  : { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  moodBtn  : { alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: theme.border, paddingVertical: 10, paddingHorizontal: 8, width: 58 },
  moodEmoji: { fontSize: 26, marginBottom: 5 },
  moodLabel: { fontSize: 11, color: theme.textMuted, fontWeight: '500' },
  pillRow  : { flexDirection: 'row', gap: 8 },
  pill     : { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  pillTxt  : { fontSize: 12, fontWeight: '600' },
  statsRow : { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard : { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  statNum  : { fontSize: 24, fontWeight: '800' },
  statLbl  : { fontSize: 12, marginTop: 2 },
  startBtn : { borderRadius: 16, paddingVertical: 17, alignItems: 'center', marginBottom: 12 },
  startTxt : { color: '#fff', fontSize: 17, fontWeight: '700' },
  battleBtn: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', borderWidth: 1.5, marginBottom: 28 },
  battleTxt: { fontSize: 15, fontWeight: '700' },
  footer   : { textAlign: 'center', fontSize: 12 },
});