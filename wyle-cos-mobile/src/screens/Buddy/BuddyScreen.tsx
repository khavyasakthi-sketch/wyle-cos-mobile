// src/screens/Buddy/BuddyScreen.tsx
// Buddy = Wyle's AI assistant powered by Claude (Anthropic)
// Brand: Verdigris = Buddy color | Salmon = Buddy talking label

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, KeyboardAvoidingView, Platform, Animated,
  StatusBar, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NavProp } from '../../../app/index';

const { width } = Dimensions.get('window');

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

// ── Set your Anthropic API key in .env as EXPO_PUBLIC_ANTHROPIC_API_KEY ────────
// For production: route through your backend. Never ship key in app binary.
const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

// ── Buddy system prompt — full life context ───────────────────────────────────
const SYSTEM_PROMPT = `You are Buddy, the AI-powered personal chief of staff inside Wyle — a life management app for busy professionals in Dubai, UAE.

Your personality:
- Calm, confident, warm, direct. You speak like a trusted friend who is highly competent.
- Every reply saves the user time. Be short and actionable. Max 3-4 sentences unless asked for more.
- Never panic. Focus on solutions.
- Human and respectful. Never robotic.

The user's current life context:
- Life Optimization Score (LOS): 74/100
- Location: Dubai, UAE
- Urgent obligations:
  * UAE Residence Visa — expires in 8 days (HIGH RISK) — renew via GDRFA website
  * School Fee Q3 — AED 14,000 — due TODAY (HIGH RISK)
  * Emirates ID Renewal — 22 days — AED 370 (MEDIUM) — ICA smart app
  * Car Registration — 31 days — AED 450 (MEDIUM) — needs insurance first
  * Car Insurance — 45 days — AED 2,100 (LOW) — AXA UAE app
  * DEWA Bill — 12 days — AED 850 (LOW)
- Time saved this week: 4h 20m
- Decisions handled: 12

You can help with:
1. Obligation tracking — explain exactly how to resolve each one, step by step
2. Food ordering — give exactly 3 options with price and delivery time, then confirm
3. Life advice — use the user's full context to give personalized answers
4. Morning brief — summarize urgent items for today
5. General AI questions — Buddy knows this user's life, ChatGPT doesn't

Rules:
- Always show a certainty score (e.g. "95% confident") before suggesting an action
- Never execute anything without user confirmation
- When ordering food, give exactly 3 options as a numbered list
- Respond in English unless user writes in Arabic, then respond in Arabic`;

type Role = 'user' | 'buddy';

type Message = {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
};

const QUICK_PROMPTS = [
  { label: '📋 Urgent items',    text: 'What are my most urgent tasks right now?' },
  { label: '🍽️ Order food',      text: 'I want to order food. What do you suggest?' },
  { label: '🛂 Visa help',       text: 'Help me renew my UAE residence visa. Give me the exact steps.' },
  { label: '⏱️ Morning brief',   text: 'Give me my morning brief for today.' },
  { label: '💡 Pay DEWA',        text: 'Help me pay my DEWA bill.' },
  { label: '📊 My LOS score',    text: 'Explain my Life Optimization Score of 74 and how to improve it.' },
];

// ── Tab Bar ───────────────────────────────────────────────────────────────────
function TabBar({ active, onTab }: { active: string; onTab: (s: any) => void }) {
  const tabs = [
    { screen: 'home',        emoji: '⌂',  label: 'Home'     },
    { screen: 'obligations', emoji: '📋', label: 'Tasks'    },
    { screen: 'food',        emoji: '🍽️', label: 'Food'     },
    { screen: 'buddy',       emoji: '◎',  label: 'Buddy'    },
    { screen: 'insights',    emoji: '◈',  label: 'Insights' },
  ];
  return (
    <View style={tab.bar}>
      {tabs.map(t => (
        <TouchableOpacity key={t.screen} style={tab.item} onPress={() => onTab(t.screen)}>
          <Text style={[tab.emoji, active === t.screen && { opacity: 1 }]}>{t.emoji}</Text>
          <Text style={[tab.label, active === t.screen && { color: C.verdigris }]}>{t.label}</Text>
          {active === t.screen && <View style={tab.dot} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}
const tab = StyleSheet.create({
  bar:   { flexDirection: 'row', backgroundColor: '#061F28', borderTopWidth: 1, borderColor: C.border, paddingBottom: 20, paddingTop: 10 },
  item:  { flex: 1, alignItems: 'center', gap: 3 },
  emoji: { fontSize: 20, opacity: 0.5 },
  label: { fontSize: 10, color: C.textTer, fontWeight: '500' },
  dot:   { width: 4, height: 4, borderRadius: 2, backgroundColor: C.verdigris, marginTop: 2 },
});

// ── Typing indicator (3 bouncing salmon dots) ─────────────────────────────────
function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    dots.forEach((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: -6, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0,  duration: 280, useNativeDriver: true }),
          Animated.delay(500),
        ])
      ).start()
    );
  }, []);

  return (
    <View style={ti.row}>
      <View style={ti.avatar}><Text style={ti.avatarText}>◎</Text></View>
      <View style={ti.bubble}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={[ti.dot, { transform: [{ translateY: dot }] }]} />
        ))}
      </View>
    </View>
  );
}
const ti = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12, paddingHorizontal: 16 },
  avatar:     { width: 32, height: 32, borderRadius: 16, backgroundColor: `${C.verdigris}20`, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${C.verdigris}40` },
  avatarText: { color: C.verdigris, fontSize: 14 },
  bubble:     { backgroundColor: C.surface, borderRadius: 18, borderBottomLeftRadius: 4, padding: 14, flexDirection: 'row', gap: 5, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  dot:        { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.salmon },
});

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ message }: { message: Message }) {
  const isUser  = message.role === 'user';
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 120, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const time = message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (isUser) {
    return (
      <Animated.View style={[bub.userRow, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
        <View style={bub.userBubble}>
          <Text style={bub.userText}>{message.text}</Text>
        </View>
        <Text style={bub.time}>{time}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[bub.buddyRow, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
      <View style={bub.avatar}>
        <Text style={bub.avatarText}>◎</Text>
      </View>
      <View style={{ flex: 1 }}>
        {/* "BUDDY" label in Salmon — brand spec: Buddy talking = Salmon */}
        <Text style={bub.buddyLabel}>BUDDY</Text>
        {/* Response bubble — Verdigris border: brand spec: Buddy giving response = Verdigris */}
        <View style={bub.buddyBubble}>
          <Text style={bub.buddyText}>{message.text}</Text>
        </View>
        <Text style={[bub.time, { alignSelf: 'flex-start', marginLeft: 4 }]}>{time}</Text>
      </View>
    </Animated.View>
  );
}
const bub = StyleSheet.create({
  userRow:    { alignItems: 'flex-end', marginBottom: 14, paddingHorizontal: 16 },
  userBubble: { backgroundColor: C.verdigris, borderRadius: 18, borderBottomRightRadius: 4, padding: 14, maxWidth: width * 0.72 },
  userText:   { color: C.white, fontSize: 15, lineHeight: 21 },

  buddyRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 14, paddingHorizontal: 16 },
  avatar:     { width: 32, height: 32, borderRadius: 16, backgroundColor: `${C.verdigris}20`, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${C.verdigris}40`, marginTop: 20 },
  avatarText: { color: C.verdigris, fontSize: 14 },
  buddyLabel: { color: C.salmon, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  buddyBubble:{ backgroundColor: C.surface, borderRadius: 18, borderBottomLeftRadius: 4, padding: 14, maxWidth: width * 0.72, borderWidth: 1, borderColor: `${C.verdigris}30` },
  buddyText:  { color: C.white, fontSize: 15, lineHeight: 22 },
  time:       { color: C.textTer, fontSize: 10, marginTop: 3 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function BuddyScreen({ navigation }: { navigation: NavProp }) {
  const nav = navigation ?? { navigate: (_: any) => {}, goBack: () => {} };

  const [messages, setMessages]     = useState<Message[]>([{
    id: '0',
    role: 'buddy',
    text: "Hey! I'm Buddy — your personal chief of staff. 👋\n\nI can see you have 2 urgent items today: your UAE visa expires in 8 days and your school fee of AED 14,000 is due today.\n\nWhat do you want to tackle first?",
    timestamp: new Date(),
  }]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [showQuick, setShowQuick]   = useState(true);
  const listRef = useRef<FlatList>(null);

  const scrollToEnd = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setShowQuick(false);
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    scrollToEnd();

    try {
      // Build conversation history for Claude
      const history = [...messages, userMsg]
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant' as const, content: m.text }));

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'API error');

      const buddyMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'buddy',
        text: data.content?.[0]?.text ?? "Something went wrong. Try again?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, buddyMsg]);
    } catch {
      // Graceful fallback — demo never breaks
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'buddy',
        text: "I'm having a connection issue. Your most urgent item is still your UAE visa — it expires in 8 days. Want me to walk you through the GDRFA renewal process?",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <SafeAreaView edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => nav.navigate('home')} style={s.backBtn}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={s.headerMid}>
            <View style={s.onlineRing}>
              <Text style={s.buddyIcon}>◎</Text>
            </View>
            <View>
              <Text style={s.headerTitle}>Buddy</Text>
              <Text style={s.headerSub}>Personal Chief of Staff</Text>
            </View>
          </View>
          {/* Voice button — mic icon. See voice integration note at bottom */}
          <TouchableOpacity style={s.voiceBtn} onPress={() => sendMessage('Give me my morning brief for today.')}>
            <Text style={{ fontSize: 18 }}>🎙️</Text>
          </TouchableOpacity>
        </View>
        <View style={s.onlineBar}>
          <View style={s.onlineDot} />
          <Text style={s.onlineText}>Online · Knows your full life context</Text>
        </View>
      </SafeAreaView>

      {/* Chat + Input */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={s.msgList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToEnd}
          ListFooterComponent={loading ? <TypingIndicator /> : null}
        />

        {/* Quick prompt chips — shown before first user message */}
        {showQuick && (
          <View style={s.quickWrap}>
            <Text style={s.quickLabel}>TRY ASKING</Text>
            <View style={s.quickRow}>
              {QUICK_PROMPTS.map((p, i) => (
                <TouchableOpacity key={i} style={s.chip} onPress={() => sendMessage(p.text)}>
                  <Text style={s.chipText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Input bar */}
        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Buddy anything..."
            placeholderTextColor={C.textTer}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || loading) && { opacity: 0.35 }]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            {loading
              ? <ActivityIndicator color={C.bg} size="small" />
              : <Text style={s.sendIcon}>↑</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <TabBar active="buddy" onTab={(sc) => nav.navigate(sc)} />
    </View>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.bg },

  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10, gap: 10 },
  backBtn:    { width: 36, height: 36, borderRadius: 10, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backBtnText:{ color: C.verdigris, fontSize: 18, fontWeight: '600' },
  headerMid:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  onlineRing: { width: 38, height: 38, borderRadius: 19, backgroundColor: `${C.verdigris}20`, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.verdigris },
  buddyIcon:  { color: C.verdigris, fontSize: 18 },
  headerTitle:{ color: C.white, fontSize: 17, fontWeight: '700' },
  headerSub:  { color: C.textSec, fontSize: 10 },
  voiceBtn:   { width: 36, height: 36, borderRadius: 10, backgroundColor: `${C.salmon}18`, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${C.salmon}40` },

  onlineBar:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingBottom: 8 },
  onlineDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: C.verdigris },
  onlineText: { color: C.textTer, fontSize: 11 },

  msgList:    { paddingTop: 14, paddingBottom: 8 },

  quickWrap:  { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 2 },
  quickLabel: { color: C.textTer, fontSize: 9, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  quickRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:       { backgroundColor: C.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: C.border },
  chipText:   { color: C.textSec, fontSize: 12 },

  inputBar:   { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderColor: C.border, backgroundColor: C.bg },
  input:      { flex: 1, backgroundColor: C.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: C.white, fontSize: 15, maxHeight: 100, borderWidth: 1, borderColor: C.border },
  sendBtn:    { width: 42, height: 42, borderRadius: 21, backgroundColor: C.chartreuse, alignItems: 'center', justifyContent: 'center' },
  sendIcon:   { color: C.bg, fontSize: 22, fontWeight: '700', lineHeight: 26 },
});