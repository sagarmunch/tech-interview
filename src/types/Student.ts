export interface Student {
  id: number;
  name: string;
  grade: string;
  goals?: LearningGoal[];
}

export interface LearningGoal {
  id?: number;
  goal: string;
  baseline: string;
  selected?: boolean;
}

export interface ExtractedGoal {
  goal: string;
  baseline: string;
}