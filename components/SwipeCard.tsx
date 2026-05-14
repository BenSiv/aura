import React from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Profile } from '@/data/db';
import { MapPin, Info } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.92;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface Props {
  profile: Profile;
}

export default function SwipeCard({ profile }: Props) {
  const images = JSON.parse(profile.images);
  const tags = JSON.parse(profile.tags || '[]');

  return (
    <View style={styles.container}>
      <Image source={{ uri: images[0] }} style={styles.image} />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name}</Text>
          <View style={styles.distanceContainer}>
            <MapPin size={14} color="#CBD5E1" />
            <Text style={styles.distance}>{profile.distance} km away</Text>
          </View>
        </View>

        <BlurView intensity={20} tint="dark" style={styles.bioContainer}>
          <Text style={styles.bio} numberOfLines={2}>
            {profile.bio}
          </Text>
        </BlurView>

        <View style={styles.tagContainer}>
          {tags.slice(0, 3).map((tag: string) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {tags.length > 3 && (
            <View style={styles.tagMore}>
              <Text style={styles.tagText}>+{tags.length - 3}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    top: '40%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  distance: {
    fontSize: 14,
    color: '#CBD5E1',
    marginLeft: 4,
    fontWeight: '500',
  },
  bioContainer: {
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bio: {
    fontSize: 15,
    color: '#F1F5F9',
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  tagMore: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#E0E7FF',
    fontSize: 12,
    fontWeight: '600',
  },
});
