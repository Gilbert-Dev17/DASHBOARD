export interface Subtask {
  id: number;
  text: string;
  done: boolean;
}

export interface Task {
  id: number;
  text: string;
  done: boolean;
  category: string;
  time?: string;
  subtasks?: Subtask[];
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  uvIndex: number;
  uvRisk: string;
}

export interface UserSummary {
  firstName: string;
  meetingsCount: number;
  tasksCount: number;
  habitsCount: number;
  balance: number;
}

export interface DashboardPageProps {
  initialTasks?: Task[];
  weather?: WeatherData;
  user?: UserSummary;
}