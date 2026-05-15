import { StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Sparkles, BrainCircuit, RotateCcw, Clock, ArrowUpRight } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { getPreferences, setPreferenceWeight } from '@/ml/engine';
import { getHistory, HistoryItem } from '@/data/history';
import { useFocusEffect } from 'expo-router';

const DATABASE_NAME = 'aura.db';

const COMMON_TAGS = [
  'Outdoors', 'Art', 'Biking', 'Cooking', 'Jazz', 'Music', 'Science', 
  'Academic', 'Reading', 'Humor', 'Tech', 'Hiking', 'Gaming', 'Yoga',
  'Travel', 'Fitness', 'Vegan', 'Coffee', 'Pets', 'Movies'
];

export default function ResonanceScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const [preferences, setPreferences] = useState<{ tag: string; weight: number }[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadData = useCallback(async () => {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    const prefs = await getPreferences(db);
    const hist = await getHistory();
    setPreferences(prefs);
    setHistory(hist);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function toggleSeedTag(tag: string) {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    const existing = preferences.find(p => p.tag === tag);
    const newWeight = existing && existing.weight > 0 ? 0 : 0.5;
    await setPreferenceWeight(db, tag, newWeight);
    loadData();
  }

  async function resetPreferences() {
    Alert.alert(
      "Reset Resonance",
      "Clear all learned weights and encounter history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset Everything", 
          style: "destructive",
          onPress: async () => {
            const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
            await db.runAsync('DELETE FROM preferences');
            await db.runAsync('DELETE FROM history');
            loadData();
          }
        }
      ]
    );
  }

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Resonance</Text>
          <Text style={styles.subtitle}>Your AI Preference Engine</Text>
        </View>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: theme.surface }]}
          onPress={resetPreferences}
        >
          <RotateCcw size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Vibe Seed Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={20} color="#6366F1" />
            <Text style={styles.sectionTitle}>Vibe Seed</Text>
          </View>
          <View style={styles.tagGrid}>
            {COMMON_TAGS.map(tag => {
              const isSelected = preferences.some(p => p.tag === tag && p.weight > 0);
              return (
                <TouchableOpacity 
                  key={tag}
                  style={[styles.tag, { backgroundColor: isSelected ? '#6366F1' : theme.surface }]}
                  onPress={() => toggleSeedTag(tag)}
                >
                  <Text style={[styles.tagText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recent History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#6366F1" />
            <Text style={styles.sectionTitle}>Recent Encounters</Text>
          </View>
          <View style={styles.historyList}>
            {history.length > 0 ? (
              history.map(item => (
                <View key={item.historyId} style={[styles.historyItem, { backgroundColor: theme.surface }]}>
                  <Image source={{ uri: JSON.parse(item.images)[0] }} style={styles.historyImage} />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyName}>{item.name}</Text>
                    <Text style={styles.historyTime}>{formatTime(item.timestamp)} • {Math.round(item.score * 100)}% match</Text>
                  </View>
                  <View style={[styles.interactionBadge, { backgroundColor: item.interaction === 'liked' ? '#6366F1' : '#64748B' }]}>
                    <Text style={styles.interactionText}>{item.interaction.toUpperCase()}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No recent encounters detected yet.</Text>
            )}
          </View>
        </View>

        {/* Learned Weights Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BrainCircuit size={20} color="#6366F1" />
            <Text style={styles.sectionTitle}>Learned Weights</Text>
          </View>
          <View style={styles.weightsList}>
            {preferences.filter(p => p.weight !== 0).length > 0 ? (
              preferences.filter(p => p.weight !== 0).map(pref => (
                <View key={pref.tag} style={styles.weightItem}>
                  <Text style={styles.weightTag}>{pref.tag}</Text>
                  <View style={styles.weightBarContainer}>
                    <View 
                      style={[
                        styles.weightBar, 
                        { 
                          width: `${Math.min(Math.max(pref.weight * 50 + 50, 5), 100)}%`,
                          backgroundColor: pref.weight >= 0 ? '#10B981' : '#F87171'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.weightValue}>{pref.weight.toFixed(1)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Learning resonance patterns...</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#64748B' },
  iconButton: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
  },
  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  tagText: { fontSize: 13, fontWeight: '600' },
  historyList: { gap: 12 },
  historyItem: {
    flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 16, gap: 12,
  },
  historyImage: { width: 50, height: 50, borderRadius: 25 },
  historyInfo: { flex: 1 },
  historyName: { fontSize: 16, fontWeight: '700' },
  historyTime: { fontSize: 12, color: '#64748B' },
  interactionBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  interactionText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  weightsList: { gap: 10 },
  weightItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  weightTag: { width: 70, fontSize: 12, fontWeight: '600' },
  weightBarContainer: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  weightBar: { height: '100%', borderRadius: 3 },
  weightValue: { width: 25, fontSize: 10, fontWeight: '700', textAlign: 'right', color: '#64748B' },
  emptyText: { fontSize: 14, color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
});
