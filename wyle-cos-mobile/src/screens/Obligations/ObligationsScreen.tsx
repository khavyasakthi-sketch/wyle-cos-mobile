import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated, Modal, TextInput,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NavProp } from '../../../app/index';

const { width } = Dimensions.get('window');

const C = {
  bg: '#002F3A',
  surface: '#0A3D4A',
  surfaceEl: '#0F4A5A',
  verdigris: '#1B998B',
  chartreuse: '#D5FF3F',
  salmon: '#FF9F8A',
  crimson: '#D7263D',
  white: '#FEFFFE',
  textSec: '#8FB8BF',
  textTer: '#4A7A85',
  border: '#1A5060',
};

type Risk = 'high' | 'medium' | 'low';

const RISK_COLORS: Record<Risk, string> = {
  high: C.crimson,
  medium: C.chartreuse,
  low: C.verdigris,
};

const MOCK_OBLIGATIONS = [
  { id: '1', emoji: '🛂', title: 'UAE Residence Visa', type: 'visa', daysUntil: 8, risk: 'high' as Risk, amount: null, status: 'active', executionPath: 'GDRFA website — 45min process', notes: 'Requires passport + EID copy' },
  { id: '2', emoji: '🪪', title: 'Emirates ID Renewal', type: 'emirates_id', daysUntil: 22, risk: 'medium' as Risk, amount: 370, status: 'active', executionPath: 'ICA smart app — 20min', notes: null },
  { id: '3', emoji: '🚗', title: 'Car Registration', type: 'car_registration', daysUntil: 31, risk: 'medium' as Risk, amount: 450, status: 'active', executionPath: 'RTA online portal', notes: 'Needs insurance first' },
  { id: '4', emoji: '🛡️', title: 'Car Insurance', type: 'insurance', daysUntil: 45, risk: 'low' as Risk, amount: 2100, status: 'active', executionPath: 'AXA UAE app', notes: null },
  { id: '5', emoji: '💡', title: 'DEWA Bill', type: 'bill', daysUntil: 12, risk: 'low' as Risk, amount: 850, status: 'active', executionPath: 'DEWA app — auto pay', notes: null },
  { id: '6', emoji: '🎓', title: 'School Fee — Q3', type: 'school_fee', daysUntil: 0, risk: 'high' as Risk, amount: 14000, status: 'active', executionPath: 'School parent portal', notes: 'Due today' },
];

const TYPE_OPTIONS = [
  { emoji: '🛂', label: 'Visa' },
  { emoji: '🪪', label: 'Emirates ID' },
  { emoji: '🚗', label: 'Car Reg' },
  { emoji: '🛡️', label: 'Insurance' },
  { emoji: '💡', label: 'Bill' },
  { emoji: '🎓', label: 'School Fee' },
  { emoji: '🏥', label: 'Medical' },
  { emoji: '📄', label: 'Document' },
  { emoji: '💰', label: 'Payment' },
  { emoji: '📦', label: 'Other' },
];

function getDaysLabel(days: number): string {
  if (days < 0) return `Overdue ${Math.abs(days)}d`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Tomorrow';
  return `${days} days`;
}

// ── Bottom Tab Bar ─────────────────────────────────────────────────────────────
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

// ── Obligation Card (unchanged) ────────────────────────────────────────────────
function ObligationCard({ item, onPress, onResolve }: any) {
  const riskColor = RISK_COLORS[item.risk as Risk];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => onPress(item));
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity style={[styles.card, { borderLeftColor: riskColor }]} onPress={handlePress} activeOpacity={1}>
        <View style={[styles.cardIcon, { backgroundColor: `${riskColor}15` }]}>
          <Text style={styles.cardEmoji}>{item.emoji}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.notes && <Text style={styles.cardNotes}>{item.notes}</Text>}
          <View style={styles.cardMeta}>
            <View style={[styles.riskPill, { backgroundColor: `${riskColor}20`, borderColor: `${riskColor}40` }]}>
              <Text style={[styles.riskPillText, { color: riskColor }]}>{item.risk.toUpperCase()}</Text>
            </View>
            <Text style={[styles.daysText, { color: riskColor }]}>{getDaysLabel(item.daysUntil)}</Text>
            {item.amount && <Text style={styles.amount}>AED {item.amount.toLocaleString()}</Text>}
          </View>
        </View>
        <TouchableOpacity style={styles.resolveBtn} onPress={() => onResolve(item)}>
          <Text style={styles.resolveBtnText}>✓</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Detail Modal (unchanged) ───────────────────────────────────────────────────
function DetailModal({ item, visible, onClose, onResolve }: any) {
  if (!item) return null;
  const riskColor = RISK_COLORS[item.risk as Risk];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modal.overlay}>
        <TouchableOpacity style={modal.backdrop} onPress={onClose} />
        <View style={modal.sheet}>
          <View style={modal.handle} />
          <View style={modal.header}>
            <View style={[modal.icon, { backgroundColor: `${riskColor}20` }]}>
              <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={modal.title}>{item.title}</Text>
              <View style={[modal.riskBadge, { backgroundColor: `${riskColor}20` }]}>
                <Text style={[modal.riskText, { color: riskColor }]}>
                  {item.risk === 'high' ? '🔴' : item.risk === 'medium' ? '🟡' : '🟢'} {item.risk.toUpperCase()} RISK
                </Text>
              </View>
            </View>
          </View>
          <View style={modal.infoGrid}>
            <View style={modal.infoItem}>
              <Text style={modal.infoLabel}>Due in</Text>
              <Text style={[modal.infoValue, { color: riskColor }]}>{getDaysLabel(item.daysUntil)}</Text>
            </View>
            {item.amount && (
              <View style={modal.infoItem}>
                <Text style={modal.infoLabel}>Amount</Text>
                <Text style={modal.infoValue}>AED {item.amount.toLocaleString()}</Text>
              </View>
            )}
          </View>
          {item.executionPath && (
            <View style={modal.executionBlock}>
              <Text style={modal.executionLabel}>HOW TO RESOLVE</Text>
              <Text style={modal.executionText}>{item.executionPath}</Text>
            </View>
          )}
          <View style={modal.actions}>
            <TouchableOpacity style={modal.primaryBtn} onPress={() => { onResolve(item); onClose(); }}>
              <Text style={modal.primaryBtnText}>Mark as resolved</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modal.secondaryBtn} onPress={onClose}>
              <Text style={modal.secondaryBtnText}>Remind me later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── NEW: Add Obligation Modal ──────────────────────────────────────────────────
function AddModal({ visible, onClose, onAdd }: any) {
  const [title, setTitle]     = useState('');
  const [days, setDays]       = useState('');
  const [amount, setAmount]   = useState('');
  const [notes, setNotes]     = useState('');
  const [risk, setRisk]       = useState<Risk>('medium');
  const [selType, setSelType] = useState(TYPE_OPTIONS[0]);

  const reset = () => {
    setTitle(''); setDays(''); setAmount(''); setNotes('');
    setRisk('medium'); setSelType(TYPE_OPTIONS[0]);
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd({
      id:            Date.now().toString(),
      emoji:         selType.emoji,
      title:         title.trim(),
      daysUntil:     parseInt(days) || 30,
      risk,
      amount:        amount ? parseInt(amount) : null,
      status:        'active',
      executionPath: '',
      notes:         notes.trim() || null,
    });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={add.overlay}>
          <TouchableOpacity style={add.backdrop} onPress={onClose} />
          <View style={add.sheet}>
            <View style={add.handle} />
            <View style={add.titleRow}>
              <Text style={add.sheetTitle}>Add obligation</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={add.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={add.label}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {TYPE_OPTIONS.map(t => (
                    <TouchableOpacity
                      key={t.label}
                      style={[add.typePill, selType.label === t.label && add.typePillActive]}
                      onPress={() => setSelType(t)}
                    >
                      <Text style={{ fontSize: 16 }}>{t.emoji}</Text>
                      <Text style={[add.typePillText, selType.label === t.label && { color: C.bg }]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={add.label}>Title</Text>
              <TextInput
                style={add.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Emirates ID Renewal"
                placeholderTextColor={C.textTer}
              />

              <Text style={add.label}>Due in (days)</Text>
              <TextInput
                style={add.input}
                value={days}
                onChangeText={setDays}
                placeholder="e.g. 30"
                placeholderTextColor={C.textTer}
                keyboardType="number-pad"
              />

              <Text style={add.label}>Amount (AED) — optional</Text>
              <TextInput
                style={add.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="e.g. 370"
                placeholderTextColor={C.textTer}
                keyboardType="number-pad"
              />

              <Text style={add.label}>Risk level</Text>
              <View style={add.riskRow}>
                {(['low', 'medium', 'high'] as Risk[]).map(r => {
                  const rc = RISK_COLORS[r];
                  const active = risk === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[add.riskBtn, active && { backgroundColor: rc, borderColor: rc }]}
                      onPress={() => setRisk(r)}
                    >
                      <Text style={[add.riskBtnText, active && { color: r === 'medium' ? C.bg : C.white }]}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={add.label}>Notes — optional</Text>
              <TextInput
                style={[add.input, { height: 80, textAlignVertical: 'top' }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any extra details..."
                placeholderTextColor={C.textTer}
                multiline
              />

              <TouchableOpacity
                style={[add.addBtn, !title.trim() && { opacity: 0.4 }]}
                onPress={handleAdd}
                disabled={!title.trim()}
              >
                <Text style={add.addBtnText}>Add obligation</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function ObligationsScreen({ navigation }: { navigation: NavProp }) {
  const nav = navigation ?? { navigate: (_: any) => {}, goBack: () => {} };

  const [filter, setFilter]           = useState<'all' | Risk>('all');
  const [selected, setSelected]       = useState<any>(null);
  const [detailVisible, setDetail]    = useState(false);
  const [addVisible, setAdd]          = useState(false);
  const [obligations, setObligations] = useState(MOCK_OBLIGATIONS);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const filtered  = filter === 'all' ? obligations : obligations.filter(o => o.risk === filter);
  const highCount = obligations.filter(o => o.risk === 'high' && o.status === 'active').length;

  const handleResolve = (item: any) =>
    setObligations(prev => prev.map(o => o.id === item.id ? { ...o, status: 'completed' } : o));

  const handleAdd = (item: any) =>
    setObligations(prev => [item, ...prev]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView edges={['top']}>
        {/* Header — back button added */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => nav.navigate('home')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.screenLabel}>LIFE STACK</Text>
              <Text style={styles.screenTitle}>Obligations</Text>
            </View>
          </View>
          {highCount > 0 && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>{highCount} urgent</Text>
            </View>
          )}
        </Animated.View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {['all', 'high', 'medium', 'low'].map((f) => {
            const active = filter === f;
            const fColor = f === 'high' ? C.crimson : f === 'medium' ? C.chartreuse : f === 'low' ? C.verdigris : C.white;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterPill, active && { backgroundColor: fColor }]}
                onPress={() => setFilter(f as any)}
              >
                <Text style={[styles.filterText, active && { color: f === 'medium' ? C.bg : C.white }]}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.filter(o => o.status === 'active').map((item) => (
          <Animated.View key={item.id} style={{ opacity: fadeAnim }}>
            <ObligationCard
              item={item}
              onPress={(it: any) => { setSelected(it); setDetail(true); }}
              onResolve={handleResolve}
            />
          </Animated.View>
        ))}

        {obligations.filter(o => o.status === 'completed').length > 0 && (
          <View style={styles.completedSection}>
            <Text style={styles.completedLabel}>COMPLETED</Text>
            {obligations.filter(o => o.status === 'completed').map(item => (
              <View key={item.id} style={styles.completedCard}>
                <Text style={styles.completedEmoji}>{item.emoji}</Text>
                <Text style={styles.completedTitle}>{item.title}</Text>
                <Text style={[styles.completedCheck, { color: C.verdigris }]}>✓</Text>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB — now opens Add modal */}
      <TouchableOpacity style={styles.fab} onPress={() => setAdd(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Tab Bar */}
      <TabBar active="obligations" onTab={(s) => nav.navigate(s)} />

      <DetailModal item={selected} visible={detailVisible} onClose={() => setDetail(false)} onResolve={handleResolve} />
      <AddModal visible={addVisible} onClose={() => setAdd(false)} onAdd={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: C.bg },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backBtnText: { color: C.verdigris, fontSize: 18, fontWeight: '600' },
  screenLabel: { color: C.textTer, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
  screenTitle: { color: C.white, fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  urgentBadge: { backgroundColor: `${C.crimson}20`, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: `${C.crimson}40` },
  urgentText:  { color: C.crimson, fontSize: 13, fontWeight: '700' },
  filterRow:   { marginBottom: 8 },
  filterPill:  { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  filterText:  { color: C.textSec, fontSize: 13, fontWeight: '600' },
  list:        { paddingHorizontal: 16, paddingTop: 8 },
  card:        { backgroundColor: C.surface, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, gap: 12 },
  cardIcon:    { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardEmoji:   { fontSize: 24 },
  cardBody:    { flex: 1, gap: 4 },
  cardTitle:   { color: C.white, fontSize: 15, fontWeight: '600' },
  cardNotes:   { color: C.textTer, fontSize: 12 },
  cardMeta:    { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  riskPill:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  riskPillText:{ fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  daysText:    { fontSize: 12, fontWeight: '700' },
  amount:      { color: C.textSec, fontSize: 12 },
  resolveBtn:  { width: 32, height: 32, borderRadius: 16, backgroundColor: `${C.verdigris}20`, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${C.verdigris}40` },
  resolveBtnText: { color: C.verdigris, fontSize: 16, fontWeight: '700' },
  completedSection: { marginTop: 16 },
  completedLabel:   { color: C.textTer, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  completedCard:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: `${C.surface}80`, borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: `${C.border}50`, opacity: 0.6 },
  completedEmoji:   { fontSize: 18 },
  completedTitle:   { flex: 1, color: C.textSec, fontSize: 14, textDecorationLine: 'line-through' },
  completedCheck:   { fontSize: 16, fontWeight: '700' },
  fab:     { position: 'absolute', bottom: 90, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: C.chartreuse, alignItems: 'center', justifyContent: 'center', shadowColor: C.chartreuse, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
  fabText: { color: C.bg, fontSize: 28, fontWeight: '300', lineHeight: 32 },
});

const modal = StyleSheet.create({
  overlay:        { flex: 1, justifyContent: 'flex-end' },
  backdrop:       { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,47,58,0.85)' },
  sheet:          { backgroundColor: '#0A3D4A', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: '#1A5060' },
  handle:         { width: 40, height: 4, borderRadius: 2, backgroundColor: '#1A5060', alignSelf: 'center', marginBottom: 24 },
  header:         { flexDirection: 'row', gap: 16, marginBottom: 20, alignItems: 'center' },
  icon:           { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title:          { color: '#FEFFFE', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  riskBadge:      { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  riskText:       { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  infoGrid:       { flexDirection: 'row', gap: 12, marginBottom: 20 },
  infoItem:       { flex: 1, backgroundColor: '#0F4A5A', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#1A5060' },
  infoLabel:      { color: '#4A7A85', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
  infoValue:      { color: '#FEFFFE', fontSize: 20, fontWeight: '700' },
  executionBlock: { backgroundColor: '#0F4A5A', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#1A5060' },
  executionLabel: { color: '#4A7A85', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  executionText:  { color: '#8FB8BF', fontSize: 14, lineHeight: 20 },
  actions:        { gap: 10 },
  primaryBtn:     { backgroundColor: '#D5FF3F', borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: '#002F3A', fontSize: 16, fontWeight: '700' },
  secondaryBtn:   { backgroundColor: 'transparent', borderRadius: 999, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1A5060' },
  secondaryBtnText: { color: '#8FB8BF', fontSize: 15, fontWeight: '500' },
});

const add = StyleSheet.create({
  overlay:        { flex: 1, justifyContent: 'flex-end' },
  backdrop:       { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,47,58,0.85)' },
  sheet:          { backgroundColor: '#0A3D4A', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 20, maxHeight: '90%', borderTopWidth: 1, borderColor: C.border },
  handle:         { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 20 },
  titleRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle:     { color: C.white, fontSize: 20, fontWeight: '700' },
  closeBtn:       { color: C.textSec, fontSize: 20, padding: 4 },
  label:          { color: C.textSec, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  input:          { backgroundColor: C.surfaceEl, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingVertical: 13, paddingHorizontal: 16, color: C.white, fontSize: 15, marginBottom: 16 },
  typePill:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: C.surfaceEl, borderWidth: 1, borderColor: C.border },
  typePillActive: { backgroundColor: C.verdigris, borderColor: C.verdigris },
  typePillText:   { color: C.textSec, fontSize: 13, fontWeight: '600' },
  riskRow:        { flexDirection: 'row', gap: 10, marginBottom: 16 },
  riskBtn:        { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: C.surfaceEl, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  riskBtnText:    { color: C.textSec, fontSize: 13, fontWeight: '600' },
  addBtn:         { backgroundColor: C.chartreuse, borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  addBtnText:     { color: C.bg, fontSize: 16, fontWeight: '700' },
});