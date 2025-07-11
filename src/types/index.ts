
export interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'training' | 'game' | 'tournament' | 'helper';
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
  helperTask?: HelperTask;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: ('admin' | 'trainer' | 'player' | 'parent')[]; // Changed from single role to array
  teams: string[];
  assignedTeams?: string[]; // Teams that trainers are assigned to manage
  parentOf?: string[]; // User IDs of children (for parents)
  phone?: string;
  dateOfBirth?: Date;
  helperTasks?: HelperTask[];
  profileImage?: string;
  isActive: boolean;
  registrationDate: Date;
  eventParticipations?: EventParticipation[];
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
  eventId?: string;
  task: string;
  status: 'open' | 'completed' | 'no-show';
  assignedTo?: string;
  assignedDate: Date;
  completedDate?: Date;
  createdBy: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface EventParticipation {
  id: string;
  eventId: string;
  userId: string;
  status: 'attending' | 'not-attending' | 'maybe' | 'no-response';
  timestamp: Date;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  type: 'indoor' | 'beach' | 'club';
  coordinates?: { lat: number; lng: number };
  amenities: string[];
}
