import { StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import SwipeCard from '@/components/SwipeCard';
import { MOCK_PROFILES } from '@/data/mock';
import { Settings, Heart, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function DiscoverScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Finding your perfect aura</Text>
        </View>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.surface }]}>
          <Settings size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        {/* For now, just show the first mock profile. In a real app, this would be a Swipeable stack */}
        <SwipeCard profile={MOCK_PROFILES[0]} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.passButton]}>
          <X size={32} color="#F87171" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.likeButton]}>
          <Heart size={32} color="#FFFFFF" fill="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
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
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
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
