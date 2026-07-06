export interface Subtask {
  id: string;
  task_id: string;
  subtask_name: string;
  is_done: boolean;
  created_at: string;
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
  subtasks?: Subtask[];
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