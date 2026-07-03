export interface Subtask {
  id: number;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  task_category_id: string | null;
  task_name: string;
  time?: string;
  is_done: boolean;
  created_for_date: string;
  created_at: string;
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
  user?: UserSummary;
}