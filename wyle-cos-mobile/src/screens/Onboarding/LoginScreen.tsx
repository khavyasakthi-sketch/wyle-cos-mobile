// src/screens/Onboarding/LoginScreen.tsx
// Handles both Login and Register (toggle between them)
// Mock mode: any email + password works for demo
// Real mode: hits /api/auth/login or /api/auth/register

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Animated, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavProp } from '../../../app/index';

const C = {
  bg:         '#002F3A',
  surface:    '#0A3D4A',
  surfaceEl:  '#0F4A5A',
  verdigris:  '#1B998B',
  chartreuse: '#D5FF3F',
  salmon:     '#FF9F8A',
  crimson:    '#D7263D',
  white:      '#FEFFFE',
  textSec:    '#8FB8BF',
  textTer:    '#4A7A85',
  border:     '#1A5060',
};

// ── Set to true to use real backend ──────────────────────────────────────────
const USE_REAL_API = false;
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function LoginScreen({ navigation }: { navigation: NavProp }) {
  const [mode, setMode]         = useState<'login' | 'register'>('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); shake(); return; }
    if (mode === 'register' && !name) { setError('Please enter your name.'); shake(); return; }

    setLoading(true);
    try {
      if (USE_REAL_API) {
        // ── Real API ────────────────────────────────────────────────────────
        const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
        const body = mode === 'login'
          ? { email, password }
          : { name, email, password };

        const res  = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Something went wrong');
        await AsyncStorage.setItem('wyle_token', data.token);
        await AsyncStorage.setItem('wyle_user',  JSON.stringify(data.user));
      } else {
        // ── Mock login (demo mode) ──────────────────────────────────────────
        await AsyncStorage.setItem('wyle_token', 'mock_token_demo');
        await AsyncStorage.setItem('wyle_user', JSON.stringify({
          _id: '1',
          name: name || email.split('@')[0] || 'Amrutha',
          email,
          onboardingComplete: true,
        }));
        await new Promise(r => setTimeout(r, 600)); // brief pause feels real
      }
      navigation.navigate('home');
    } catch (e: any) {
      setError(e.message || 'Login failed. Try again.');
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SafeAreaView>

            {/* ── Logo ──────────────────────────────────────────────────── */}
            <TouchableOpacity style={styles.back} onPress={() => navigation.navigate('splash' as any)}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.logoRow}>
              <Text style={styles.logo}>wyle</Text>
            </View>

            {/* ── Headline ──────────────────────────────────────────────── */}
            <Text style={styles.headline}>
              {mode === 'login' ? 'Welcome back.' : 'Join Wyle.'}
            </Text>
            <Text style={styles.subline}>
              {mode === 'login'
                ? 'Your life stack is waiting.'
                : 'Set up your personal chief of staff.'}
            </Text>

            {/* ── Mode toggle ───────────────────────────────────────────── */}
            <View style={styles.modeToggle}>
              {(['login', 'register'] as const).map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
                  onPress={() => { setMode(m); setError(''); }}
                >
                  <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                    {m === 'login' ? 'Sign in' : 'Create account'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Form ──────────────────────────────────────────────────── */}
            <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>

              {mode === 'register' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Amrutha Veluthakal"
                    placeholderTextColor={C.textTer}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={C.textTer}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={C.textTer}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>

              {/* Error message */}
              {!!error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              )}

              {/* Demo badge */}
              {!USE_REAL_API && (
                <View style={styles.demoBadge}>
                  <Text style={styles.demoText}>
                    🎭 Demo mode — any email + password works
                  </Text>
                </View>
              )}

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#002F3A" />
                  : <Text style={styles.submitText}>
                      {mode === 'login' ? 'Sign in' : 'Create account'}
                    </Text>
                }
              </TouchableOpacity>

            </Animated.View>

            {/* ── Promise ───────────────────────────────────────────────── */}
            <Text style={styles.promise}>
              From 'I need to' → <Text style={{ color: C.chartreuse, fontWeight: '700' }}>done.</Text>
            </Text>

          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: 24, paddingBottom: 48 },

  back:     { marginBottom: 8 },
  backText: { color: C.textSec, fontSize: 14 },

  logoRow: { marginBottom: 32 },
  logo:    { fontSize: 34, fontWeight: '800', color: C.white, letterSpacing: -1 },

  headline: { fontSize: 36, fontWeight: '800', color: C.white, letterSpacing: -1, marginBottom: 8 },
  subline:  { fontSize: 15, color: C.textSec, marginBottom: 28, lineHeight: 21 },

  modeToggle: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: C.border,
  },
  modeBtn:          { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  modeBtnActive:    { backgroundColor: C.verdigris },
  modeBtnText:      { color: C.textSec, fontSize: 14, fontWeight: '600' },
  modeBtnTextActive:{ color: C.white },

  form: { gap: 16 },

  inputGroup: { gap: 6 },
  label:      { color: C.textSec, fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  input: {
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: C.white,
    fontSize: 15,
  },

  errorBox: {
    backgroundColor: `${C.crimson}18`,
    borderWidth: 1,
    borderColor: `${C.crimson}40`,
    borderRadius: 10,
    padding: 12,
  },
  errorText: { color: C.crimson, fontSize: 13 },

  demoBadge: {
    backgroundColor: `${C.salmon}15`,
    borderWidth: 1,
    borderColor: `${C.salmon}30`,
    borderRadius: 10,
    padding: 10,
  },
  demoText: { color: C.salmon, fontSize: 12, textAlign: 'center' },

  submitBtn: {
    backgroundColor: C.chartreuse,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#002F3A', fontSize: 17, fontWeight: '700' },

  promise: { color: C.textSec, fontSize: 14, textAlign: 'center', marginTop: 32 },
});
