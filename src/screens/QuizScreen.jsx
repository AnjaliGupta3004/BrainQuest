// src/screens/QuizScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, Animated, ScrollView,
} from 'react-native';
import { useTheme } from '../constants/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuizScreen({ route, navigation }) {
  const { theme, isDark } = useTheme();
  const { questions, topic, mood } = route.params;

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  const q = questions[idx];
  const total = questions.length;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (idx + 1) / total,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [idx]);

  useEffect(() => {
    if (answered) return;
    timerAnim.setValue(1);
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: 15000,
      useNativeDriver: false,
    }).start();

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
  }, [idx, answered]);

  const handleAnswer = (option) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setAnswered(true);
    setSelected(option);

    const isCorrect = option === q.correctAnswer;
    const pts = isCorrect ? Math.max(5, timeLeft * 2) : 0;
    const newScore = score + pts;
    if (isCorrect) setScore(newScore);

    setTimeout(() => {
      if (idx + 1 >= total) {
        navigation.replace('Result', {
          score: newScore,
          total,
          questions,
          topic,
          mood,
        });
      } else {
        setIdx(i => i + 1);
        setSelected(null);
        setAnswered(false);
        setTimeLeft(15);
      }
    }, 1600);
  };

  const getOptColors = (opt) => {
    if (!answered) return { bg: theme.card, border: theme.border, txt: theme.text };
    if (opt === q.correctAnswer) return { bg: theme.successBg, border: theme.success, txt: theme.success };
    if (opt === selected) return { bg: theme.dangerBg, border: theme.danger, txt: theme.danger };
    return { bg: theme.card, border: theme.border, txt: theme.textMuted };
  };

  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />


      {/* Progress bar */}
      <View style={s.progTrack}>
        <Animated.View style={[s.progFill, {
          width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }]} />
      </View>


      


      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.topRow}>
          <View style={[s.topicTag, { backgroundColor: theme.cardAlt }]}>
            <Text style={[s.topicTxt, { color: theme.secondary }]} numberOfLines={1}>{topic}</Text>
          </View>
          <Text style={[s.counter, { color: theme.textMuted }]}>{idx + 1}/{total}</Text>
          <Text style={{ fontSize: 22 }}>{mood.emoji}</Text>
        </View>

        <Text style={[s.scoreTxt, { color: theme.accent }]}>{score} pts</Text>

        {/* Timer ring */}
        <View style={[s.timerRing, { borderColor: timeLeft <= 5 ? theme.danger : theme.primary }]}>
          <Text style={[s.timerNum, { color: timeLeft <= 5 ? theme.danger : theme.text }]}>{timeLeft}</Text>
        </View>

        {/* Timer bar */}
        <View style={[s.timerBar, { backgroundColor: theme.border }]}>
          <Animated.View style={[s.timerBarFill, {
            width: timerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            backgroundColor: timeLeft <= 5 ? theme.danger : theme.accent,
          }]} />
        </View>

        {/* Question */}
        <Text style={s.question}>{q.question}</Text>

        {/* Options */}
        
        {q.options.map((opt, i) => {
          const { bg, border, txt } = getOptColors(opt);
          return (
            <TouchableOpacity
              key={i}
              style={[s.option, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleAnswer(opt)}
              disabled={answered}

              activeOpacity={0.8}
            >
              <View style={[s.optLetter, { backgroundColor: theme.secondary + '22' }]}>
                <Text style={[s.optLetterTxt, { color: theme.secondary }]}>
                  {String.fromCharCode(65 + i)}
                </Text>
              </View>
              <Text style={[s.optTxt, { color: txt }]}>{opt}</Text>
              {answered && opt === q.correctAnswer && <Text style={{ fontSize: 18 }}>✓</Text>}
              {answered && opt === selected && opt !== q.correctAnswer && <Text style={{ fontSize: 18 }}>✗</Text>}
            </TouchableOpacity>
          );
        })}

        {/* Explanation */}
        {answered && (
          <View style={[s.explBox, {
            backgroundColor: theme.card,
            borderColor: selected === q.correctAnswer ? theme.success : theme.danger,
          }]}>
            <Text style={[s.explLabel, { color: selected === q.correctAnswer ? theme.success : theme.danger }]}>
              {selected === q.correctAnswer ? `✓ Correct! +${Math.max(5, timeLeft * 2)} pts` : '✗ Wrong'}
            </Text>
            <Text style={[s.explTxt, { color: theme.textMuted }]}>{q.explanation}</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  progTrack: { height: 5, backgroundColor: theme.border },
  progFill: { height: 5, backgroundColor: theme.primary, borderRadius: 5 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 4 },
  topicTag: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, maxWidth: 180 },
  topicTxt: { fontSize: 12, fontWeight: '700' },
  counter: { fontSize: 13, fontWeight: '600' },
  scoreTxt: { textAlign: 'right', fontSize: 13, fontWeight: '700', marginBottom: 16 },
  timerRing: { alignSelf: 'center', width: 72, height: 72, borderRadius: 36, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  timerNum: { fontSize: 26, fontWeight: '800' },
  timerBar: { height: 4, borderRadius: 2, marginBottom: 22 },
  timerBarFill: { height: 4, borderRadius: 2 },
  question: { fontSize: 19, fontWeight: '700', color: theme.text, lineHeight: 30, textAlign: 'center', marginBottom: 24 },
  option: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 10 },
  optLetter: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  optLetterTxt: { fontSize: 14, fontWeight: '800' },
  optTxt: { flex: 1, fontSize: 15, lineHeight: 22 },
  explBox: { borderRadius: 14, borderWidth: 1.5, padding: 14, marginTop: 4 },
  explLabel: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  explTxt: { fontSize: 13, lineHeight: 20 },
});