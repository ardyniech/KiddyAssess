export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string; // e.g. "Flame", "Award", "Users", "Calendar", "Sparkles", "CheckSquare"
  isUnlocked: boolean;
  unlockedAt?: string;
  pointsRequired: number;
}

export interface RewardActivity {
  id: string;
  title: string;
  description: string;
  points: number;
  date: string;
  iconType: 'progress' | 'attendance' | 'narrative' | 'login';
}

export interface TeacherState {
  points: number;
  level: number;
  experienceToNextLevel: number;
  progressPercentage: number;
}
