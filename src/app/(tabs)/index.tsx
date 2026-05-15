import { StyleSheet, SafeAreaView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import SwipeCard from '@/components/SwipeCard';
import { MOCK_PROFILES } from '@/data/mock';
import { Settings, Heart, X, Radio, Radar, Shield, Zap } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useState, useEffect } from 'react';
import { getAuraSettings, updateSetting, VisibilityMode } from '@/data/settings';
import { simulateProximityMatch, requestNotificationPermissions } from '@/ml/proximity';

export default function DiscoverScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const [activeAura, setActiveAura] = useState(true);
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>('resonant');

  useEffect(() => {
    loadSettings();
    requestNotificationPermissions();
  }, []);

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
    // Pick a random mock profile and simulate proximity
    const randomProfile = MOCK_PROFILES[Math.floor(Math.random() * MOCK_PROFILES.length)];
    await simulateProximityMatch(randomProfile);
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

      <View style={styles.scanningContainer}>
        {activeAura ? (
          <View style={styles.auraVisual}>
            <Radar size={80} color={theme.text} strokeWidth={1} opacity={0.2} />
            <Text style={styles.scanningText}>Scanning for nearby resonance...</Text>
            <TouchableOpacity 
              style={[styles.simulateButton, { borderColor: theme.text }]} 
              onPress={runSimulation}
            >
              <Text style={styles.simulateButtonText}>Simulate Encounter</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.auraVisual}>
            <Shield size={80} color={theme.text} strokeWidth={1} opacity={0.2} />
            <Text style={styles.scanningText}>Your Aura is currently cloaked.</Text>
          </View>
        )}
      </View>

      {/* The card would appear here after tapping a notification or finding a match */}
      {/* <View style={styles.cardContainer}>
        <SwipeCard profile={MOCK_PROFILES[0]} />
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scanningContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
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
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
});
