import { StyleSheet, SafeAreaView, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import SwipeCard from '@/components/SwipeCard';
import { MOCK_PROFILES } from '@/data/mock';
import { Settings, Heart, X, Radio, Radar, Shield, Zap, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useState, useEffect, useCallback } from 'react';
import { getAuraSettings, updateSetting, VisibilityMode } from '@/data/settings';
import { simulateProximityMatch, requestNotificationPermissions, getPendingDiscoveries, dismissDiscovery } from '@/ml/proximity';
import { updatePreferences } from '@/ml/engine';
import { addToHistory } from '@/data/history';
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'aura.db';

export default function DiscoverScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const [activeAura, setActiveAura] = useState(true);
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>('resonant');
  const [pendingDiscoveries, setPendingDiscoveries] = useState<any[]>([]);

  const loadInbox = useCallback(async () => {
    const discoveries = await getPendingDiscoveries();
    setPendingDiscoveries(discoveries);
  }, []);

  useEffect(() => {
    loadSettings();
    requestNotificationPermissions();
    loadInbox();
  }, [loadInbox]);

  async function loadSettings() {
    const settings = await getAuraSettings();
    setActiveAura(settings.activeAura);
    setVisibilityMode(settings.visibilityMode);
  }

  async function toggleAura(value: boolean) {
    setActiveAura(value);
    await updateSetting('active_aura', value.toString());
  }

  async function cycleVisibility() {
    const modes: VisibilityMode[] = ['cloaked', 'resonant', 'public'];
    const nextIndex = (modes.indexOf(visibilityMode) + 1) % modes.length;
    const nextMode = modes[nextIndex];
    setVisibilityMode(nextMode);
    await updateSetting('visibility_mode', nextMode);
  }

  async function runSimulation() {
    if (!activeAura) {
      Alert.alert("Aura Disabled", "Turn on your Aura to discover resonant signals.");
      return;
    }
    const randomProfile = MOCK_PROFILES[Math.floor(Math.random() * MOCK_PROFILES.length)];
    await simulateProximityMatch(randomProfile);
    loadInbox(); // Refresh inbox
  }

  async function handleInteraction(type: 'like' | 'pass', discovery: any) {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    const tags = JSON.parse(discovery.tags);
    
    // 1. Train the ML engine
    await updatePreferences(db, tags, type);
    
    // 2. Add/Update permanent history with the interaction
    await addToHistory(discovery.id, discovery.score, type === 'like' ? 'liked' : 'passed');
    
    // 3. Dismiss from temporary cache
    await dismissDiscovery(discovery.cacheId);
    
    // 4. Refresh UI
    loadInbox();

    if (type === 'like') {
      Alert.alert("Interest Sent", `Your resonance was sent to ${discovery.name}. If they feel it too, it's a match!`);
    }
  }

  const getVisibilityIcon = () => {
    switch (visibilityMode) {
      case 'cloaked': return <Shield size={20} color={theme.text} />;
      case 'resonant': return <Radar size={20} color={theme.text} />;
      case 'public': return <Zap size={20} color={theme.text} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Aura</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: activeAura ? '#10B981' : '#64748B' }]} />
            <Text style={styles.subtitle}>{activeAura ? 'Projecting Resonance' : 'Aura Idle'}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.surface }]}
            onPress={cycleVisibility}
          >
            {getVisibilityIcon()}
          </TouchableOpacity>
          <Switch 
            value={activeAura}
            onValueChange={toggleAura}
            trackColor={{ false: '#CBD5E1', true: '#6366F1' }}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {pendingDiscoveries.length > 0 && (
          <View style={styles.inboxContainer}>
            <View style={styles.inboxHeader}>
              <Sparkles size={20} color="#6366F1" />
              <Text style={styles.inboxTitle}>Nearby Resonance</Text>
            </View>
          </View>
        )}

        <View style={styles.mainContent}>
          {pendingDiscoveries.length > 0 ? (
            <View style={styles.stackWrapper}>
              <SwipeCard profile={pendingDiscoveries[0]} />
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.passButton]}
                  onPress={() => handleInteraction('pass', pendingDiscoveries[0])}
                >
                  <X size={32} color="#F87171" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.likeButton]}
                  onPress={() => handleInteraction('like', pendingDiscoveries[0])}
                >
                  <Heart size={32} color="#FFFFFF" fill="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.auraVisual}>
              {activeAura ? (
                <>
                  <Radar size={80} color={theme.text} strokeWidth={1} opacity={0.2} />
                  <Text style={styles.scanningText}>Scanning for nearby resonance...</Text>
                  <TouchableOpacity 
                    style={[styles.simulateButton, { borderColor: theme.text }]} 
                    onPress={runSimulation}
                  >
                    <Text style={styles.simulateButtonText}>Simulate Encounter</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Shield size={80} color={theme.text} strokeWidth={1} opacity={0.2} />
                  <Text style={styles.scanningText}>Your Aura is currently cloaked.</Text>
                </>
              )}
            </View>
          )}
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
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  inboxContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  inboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  inboxTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  stackWrapper: {
    alignItems: 'center',
    gap: 30,
  },
  auraVisual: {
    alignItems: 'center',
    gap: 20,
  },
  scanningText: {
    fontSize: 16,
    color: '#64748B',
    fontStyle: 'italic',
  },
  simulateButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  simulateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  passButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  likeButton: {
    backgroundColor: '#6366F1',
  },
});
