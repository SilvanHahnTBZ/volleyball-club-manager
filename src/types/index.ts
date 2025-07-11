
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
  teamId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'player' | 'parent';
  teams: string[];
  assignedTeams?: string[]; // Teams that trainers are assigned to manage
  parentOf?: string[]; // User IDs of children (for parents)
  phone?: string;
  dateOfBirth?: Date;
  helperTasks?: HelperTask[];
  profileImage?: string;
  isActive: boolean;
  registrationDate: Date;
}

export interface Team {
  id: string;
  name: string;
  category: 'U14' | 'U16' | 'U20' | 'U23' | '4. Liga' | 'Seniors';
  gender: 'M' | 'F' | 'Mixed';
  season: string;
  trainers: string[]; // User IDs of trainers
  players: string[]; // User IDs of players
  captain?: string; // User ID of team captain
  description?: string;
  trainingTimes?: TrainingTime[];
  isActive: boolean;
}

export interface TrainingTime {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  location: string;
}

export interface HelperTask {
  id: string;
  eventId: string;
  task: string;
  completed: boolean;
  assignedDate: Date;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  type: 'indoor' | 'beach' | 'club';
  coordinates?: { lat: number; lng: number };
  amenities: string[];
}
