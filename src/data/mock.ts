import { Profile } from './db';

export const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Elena',
    bio: 'Art historian and weekend mountain biker. Looking for someone to share a sunset with.',
    images: JSON.stringify(['https://images.unsplash.com/photo-1494790108377-be9c29b29330']),
    tags: JSON.stringify(['Outdoors', 'Art', 'Biking', 'Introvert']),
    distance: 4.2,
    lastSeen: Date.now() - 3600000,
  },
  {
    id: '2',
    name: 'Marcus',
    bio: 'Chef by day, jazz musician by night. I make the best lasagna you will ever taste.',
    images: JSON.stringify(['https://images.unsplash.com/photo-1500648767791-00dcc994a43e']),
    tags: JSON.stringify(['Cooking', 'Jazz', 'Music', 'Extrovert']),
    distance: 1.5,
    lastSeen: Date.now() - 100000,
  },
  {
    id: '3',
    name: 'Sophie',
    bio: 'Physics PhD student. I can explain the universe but I still cannot find my keys.',
    images: JSON.stringify(['https://images.unsplash.com/photo-1438761681033-6461ffad8d80']),
    tags: JSON.stringify(['Science', 'Academic', 'Reading', 'Humor']),
    distance: 12.0,
    lastSeen: Date.now() - 5000000,
  }
];
