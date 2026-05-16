import { Profile } from "../components/SwipeCard";

export const DEMO_PROFILES: Profile[] = [
  {
    id: "demo_alex",
    name: "Alex Rivera",
    bio: "Building the future of decentralized networks. Passionate about mesh technology and sustainable energy.",
    images: JSON.stringify(["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80"]),
    tags: JSON.stringify(["coding", "mesh", "solarpunk"]),
    distance: 1.2
  },
  {
    id: "demo_jamie",
    name: "Jamie Chen",
    bio: "Digital artist and coffee enthusiast. I love exploring the intersection of technology and human connection.",
    images: JSON.stringify(["https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80"]),
    tags: JSON.stringify(["art", "coffee", "ui/ux"]),
    distance: 0.8
  },
  {
    id: "demo_sam",
    name: "Sam Wilson",
    bio: "Adventure seeker and photographer. Usually found in the mountains or at a concert.",
    images: JSON.stringify(["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"]),
    tags: JSON.stringify(["hiking", "photo", "music"]),
    distance: 2.5
  }
];

export const DEMO_CHAT_MESSAGES = [
  { id: 1, text: "Hey! I saw your Aura and felt a great connection.", sender: "them", time: "12:05 PM" },
  { id: 2, text: "Your tags caught my eye, specifically the mesh networking part!", sender: "them", time: "12:06 PM" },
];
