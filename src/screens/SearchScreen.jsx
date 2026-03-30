// src/screens/SearchScreen.jsx

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, StyleSheet,
  StatusBar, Image, Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../constants/ThemeContext';
import { searchBooks } from '../services/libraryService';
import { generateQuiz } from '../services/aiService';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUGGESTIONS = ['Physics', 'History', 'Python', 'Biology', 'Math', 'Chemistry'];

export default function SearchScreen({ route, navigation }) {
  const { theme, isDark } = useTheme();
  const mood = route.params?.mood || { emoji: '😎', label: 'Focused', difficulty: 'medium', count: 5 };

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genTopic, setGenTopic] = useState('');

  const s = makeStyles(theme);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    const books = await searchBooks(query);
    setResults(books);
    setSearching(false);
  };

  const handleSelect = async (item) => {
    setGenerating(true);
    setGenTopic(item.title);
    try {
      const questions = await generateQuiz(item.subject || item.title, mood.difficulty, mood.count);
      navigation.navigate('Quiz', { questions, topic: item.title, mood });
    } catch (e) {
      Alert.alert('Error', 'Quiz was not generated. Check your API key.');
    } finally {
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <SafeAreaView style={[s.root, s.center]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🤖</Text>
        <ActivityIndicator color={theme.primary} size="large" />
        <Text style={s.genTitle}>Gemini AI generating quiz...</Text>
        <Text style={s.genSub} numberOfLines={2}>{genTopic}</Text>
        <Text style={[s.genMood, { color: theme.accent }]}>
          {mood.emoji} {mood.label} • {mood.count} questions
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.primary}   // ← theme color automatically!
          />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.title}>Choose a topic</Text>
          <Text style={s.sub}>{mood.emoji} {mood.label} • {mood.count} questions</Text>
        </View>
      </View>

      <View style={s.searchBox}>
        <TextInput
          style={s.input}
          placeholder="Search books, subjects, topics..."
          placeholderTextColor={theme.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={[s.goBtn, { backgroundColor: theme.primary }]} onPress={handleSearch}>
          <Text style={s.goBtnTxt}>Go</Text>
        </TouchableOpacity>
      </View>

      {results.length === 0 && !searching && (
        <View style={s.suggestRow}>
          {SUGGESTIONS.map(sg => (
            <TouchableOpacity
              key={sg}
              style={[s.chip, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}
              onPress={() => { setQuery(sg); }}
            >
              <Text style={[s.chipTxt, { color: theme.secondary }]}>{sg}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {searching && (
        <View style={s.center}>
          <ActivityIndicator color={theme.primary} size="large" />
          <Text style={[s.loadTxt, { color: theme.textMuted }]}>Searching Open Library...</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={item => item.key}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => handleSelect(item)}
            activeOpacity={0.8}
          >
            {item.cover
              ? <Image source={{ uri: item.cover }} style={s.cover} resizeMode="cover" />
              : <View style={[s.coverPh, { backgroundColor: theme.secondary + '33' }]}><Text style={{ fontSize: 22 }}>📖</Text></View>
            }
            <View style={s.cardRight}>
              <Text style={[s.cardTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
              <Text style={[s.cardAuthor, { color: theme.textMuted }]}>{item.author}</Text>
              <View style={[s.subPill, { backgroundColor: theme.primary + '22' }]}>
                <Text style={[s.subPillTxt, { color: theme.primary }]} numberOfLines={1}>{item.subject}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  back: { fontSize: 24, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700', color: theme.text },
  sub: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  searchBox: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 14, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: theme.text },
  goBtn: { paddingHorizontal: 18, justifyContent: 'center' },
  goBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  suggestRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  chip: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  chipTxt: { fontSize: 13, fontWeight: '600' },
  loadTxt: { marginTop: 12, fontSize: 14 },
  card: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10 },
  cover: { width: 56, height: 76, borderRadius: 8, marginRight: 12 },
  coverPh: { width: 56, height: 76, borderRadius: 8, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  cardRight: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  cardAuthor: { fontSize: 12, marginBottom: 8 },
  subPill: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  subPillTxt: { fontSize: 11, fontWeight: '600' },
  genTitle: { fontSize: 20, fontWeight: '700', color: theme.text, textAlign: 'center', marginTop: 16, marginBottom: 8 },
  genSub: { fontSize: 14, color: theme.textMuted, textAlign: 'center', marginBottom: 12 },
  genMood: { fontSize: 13, fontWeight: '600' },
  backBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
});