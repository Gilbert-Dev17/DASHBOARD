import { Task, Subtask, User, Wallet, WalletSnapshot, DailyNote} from '@/types/database';

export interface TaskWithSubtasks extends Omit<Task, 'task_category_id'> {
  subtasks: Subtask[];
  task_category: { id: string | null; name: string } | null; // nullable — see issue #4
}

export type Notes = DailyNote;

export type UserSummary = Pick<User, 'id'> & Partial<Pick<User, 'email' | 'first_name' | 'name' | 'avatar_url' | 'activeCurrency'>>;

export type WalletSummary = Wallet;

export type WalletHistory = WalletSnapshot;
