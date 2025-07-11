
export interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'training' | 'game' | 'tournament';
  time?: string;
  location?: string;
  venueType?: 'indoor' | 'beach' | 'club';
  opponent?: string;
  description?: string;
  maxParticipants?: number;
  participants: string[];
  createdBy: string;
  requiresApproval?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'player';
  team?: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  type: 'indoor' | 'beach' | 'club';
  coordinates?: { lat: number; lng: number };
  amenities: string[];
}
