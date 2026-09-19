import { getUser } from './get-user'
import type { UserSummary } from "@/types/dashboard";

export type ActionResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export function withAuth<TArgs extends any[], TReturn = any>(
  action: (user: UserSummary, ...args: TArgs) => Promise<ActionResponse<TReturn>>
) {
  return async (...args: TArgs): Promise<ActionResponse<TReturn>> => {
    try {
      const user = await getUser();
      if (!user) {
        return { success: false, message: 'Not authenticated', error: 'Not authenticated' };
      }
      return await action(user, ...args);
    } catch (error: unknown) {
      console.error('Server action error:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }
}
