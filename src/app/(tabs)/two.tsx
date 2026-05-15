import { StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Sparkles, BrainCircuit, RotateCcw, Plus } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import { getPreferences, setPreferenceWeight } from '@/ml/engine';

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

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    const prefs = await getPreferences(db);
    setPreferences(prefs);
  }

  async function toggleSeedTag(tag: string) {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    const existing = preferences.find(p => p.tag === tag);
    
    // If it exists, remove it (set to 0), if not, seed it with a base weight
    const newWeight = existing && existing.weight > 0 ? 0 : 0.5;
    await setPreferenceWeight(db, tag, newWeight);
    loadPreferences();
  }

  async function resetPreferences() {
    Alert.alert(
      "Reset Resonance",
      "This will clear all learned preferences. Your Aura will start fresh. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: async () => {
            const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
            await db.runAsync('DELETE FROM preferences');
            loadPreferences();
          }
        }
      ]
    );
  }

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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={20} color="#6366F1" />
            <Text style={styles.sectionTitle}>Vibe Seed</Text>
          </View>
          <Text style={styles.sectionDesc}>Select initial interests to seed your Aura's resonance.</Text>
          
          <View style={styles.tagGrid}>
            {COMMON_TAGS.map(tag => {
              const isSelected = preferences.some(p => p.tag === tag && p.weight > 0);
              return (
                <TouchableOpacity 
                  key={tag}
                  style={[
                    styles.tag, 
                    { backgroundColor: isSelected ? '#6366F1' : theme.surface }
                  ]}
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BrainCircuit size={20} color="#6366F1" />
            <Text style={styles.sectionTitle}>Learned Resonance</Text>
          </View>
          <Text style={styles.sectionDesc}>These are the weights your AI has learned from your behavior.</Text>
          
          <View style={styles.weightsList}>
            {preferences.length > 0 ? (
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
              <Text style={styles.emptyText}>No resonance learned yet. Start swiping!</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionDesc: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  weightsList: {
    gap: 12,
  },
  weightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weightTag: {
    width: 80,
    fontSize: 14,
    fontWeight: '600',
  },
  weightBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  weightBar: {
    height: '100%',
    borderRadius: 4,
  },
  weightValue: {
    width: 30,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    color: '#64748B',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});
