// src/screens/SplashScreen.jsx

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {

  const barAnim    = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(24)).current;
  const dot1Anim   = useRef(new Animated.Value(0.2)).current;
  const dot2Anim   = useRef(new Animated.Value(0.2)).current;
  const dot3Anim   = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {

    // Logo fade + slide up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Loading bar fill
    Animated.timing(barAnim, {
      toValue: 1,
      duration: 2800,
      useNativeDriver: false,
    }).start();

    // Dots blinking loop
    const blinkDot = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.2, duration: 280, useNativeDriver: true }),
          Animated.delay(560),
        ])
      ).start();
    };

    blinkDot(dot1Anim, 0);
    blinkDot(dot2Anim, 200);
    blinkDot(dot3Anim, 400);

    // Navigate to Home after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const barWidth = barAnim.interpolate({
    inputRange : [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0818" />

      {/* Background circles — decorative */}
      <View style={[s.circle, s.circleTopLeft]} />
      <View style={[s.circle, s.circleBottomRight]} />
      <View style={[s.circle, s.circleMidLeft]} />

      {/* Logo icon + name */}
      <Animated.View style={[
        s.logoArea,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>

        {/* Icon box */}
        <View style={s.iconBox}>
          {/* Brain shape — 3 circles connected */}
          <View style={s.iconInner}>
            <View style={s.brainCenter} />
            <View style={s.brainLeft} />
            <View style={s.brainRight} />
            <View style={s.legMain} />
            <View style={s.legLeft} />
            <View style={s.legRight} />
          </View>
        </View>

        {/* App name */}
        <View style={s.nameRow}>
          <Text style={s.nameWhite}>Brain</Text>
          <Text style={s.namePurple}>Quest</Text>
        </View>

        {/* Tagline */}
        <Text style={s.tagline}>LEARN  ·  BATTLE  ·  LEVEL UP</Text>

      </Animated.View>

      {/* Loading bar */}
      <Animated.View style={[
        s.barArea,
        { opacity: fadeAnim }
      ]}>
        <View style={s.barTrack}>
          <Animated.View style={[s.barFill, { width: barWidth }]} />
        </View>

        {/* Loading dots */}
        <View style={s.dotsRow}>
          <Text style={s.loadingTxt}>Loading</Text>
          <Animated.Text style={[s.dot, { opacity: dot1Anim }]}>.</Animated.Text>
          <Animated.Text style={[s.dot, { opacity: dot2Anim }]}>.</Animated.Text>
          <Animated.Text style={[s.dot, { opacity: dot3Anim }]}>.</Animated.Text>
        </View>
      </Animated.View>

      {/* Version */}
      <Text style={s.version}>v1.0  ·  Powered by Groq AI</Text>

    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0818',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Background decorative circles
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circleTopLeft: {
    width: 280,
    height: 280,
    backgroundColor: '#7F77DD',
    opacity: 0.07,
    top: -80,
    left: -80,
  },
  circleBottomRight: {
    width: 240,
    height: 240,
    backgroundColor: '#1D9E75',
    opacity: 0.08,
    bottom: -60,
    right: -60,
  },
  circleMidLeft: {
    width: 130,
    height: 130,
    backgroundColor: '#534AB7',
    opacity: 0.06,
    top: '40%',
    left: -40,
  },

  // Logo area
  logoArea: {
    alignItems: 'center',
    marginBottom: 56,
  },

  // Icon box
  iconBox: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#16133A',
    borderWidth: 2,
    borderColor: '#534AB7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconInner: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Brain icon shapes
  brainCenter: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'transparent',
    borderWidth: 2.5,
    borderColor: '#7F77DD',
    top: 4,
    alignSelf: 'center',
  },
  brainLeft: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#5DCAA5',
    top: 9,
    left: 4,
  },
  brainRight: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#5DCAA5',
    top: 9,
    right: 4,
  },
  legMain: {
    position: 'absolute',
    width: 2.5,
    height: 14,
    backgroundColor: '#1D9E75',
    borderRadius: 2,
    bottom: 2,
    alignSelf: 'center',
  },
  legLeft: {
    position: 'absolute',
    width: 2.5,
    height: 10,
    backgroundColor: '#1D9E75',
    borderRadius: 2,
    bottom: 2,
    left: 14,
    transform: [{ rotate: '-20deg' }],
  },
  legRight: {
    position: 'absolute',
    width: 2.5,
    height: 10,
    backgroundColor: '#1D9E75',
    borderRadius: 2,
    bottom: 2,
    right: 14,
    transform: [{ rotate: '20deg' }],
  },

  // App name
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  nameWhite: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  namePurple: {
    fontSize: 38,
    fontWeight: '900',
    color: '#7F77DD',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 11,
    color: '#5DCAA5',
    letterSpacing: 3,
    fontWeight: '700',
  },

  // Loading bar
  barArea: {
    width: width * 0.6,
    alignItems: 'center',
  },
  barTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#16133A',
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 14,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#7F77DD',
    borderRadius: 100,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  loadingTxt: {
    fontSize: 12,
    color: '#3A3668',
    marginRight: 2,
  },
  dot: {
    fontSize: 16,
    color: '#7F77DD',
    lineHeight: 18,
  },

  // Version
  version: {
    position: 'absolute',
    bottom: 28,
    fontSize: 11,
    color: '#2A2650',
    letterSpacing: 1,
  },
});