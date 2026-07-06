import { TaskWithSubtasks } from '@/types/dashboard'

const ENDINGS = [
  "Let's make today count.",
  "You've got this.",
  "One task at a time.",
  "Let's get to it.",
  "Small progress is still progress.",
  "Stay focused.",
  "Time to build momentum.",
]

const CATEGORY_TEXT: Record<string, string> = {
  work: "work tasks",
  routine: "routine tasks",
  health: "health & fitness tasks",
  meeting: "meetings",
  habit: "habits",
  finance: "finance reminders",
  shopping: "shopping trips",
  groceries: "grocery runs",
  errands: "errands",
  learning: "study",
  appointments: "appointments",
  family: "family activities",
  social: "social events",
  date: "dates",
  selfcare: "self-care activities"
}

interface DailyBrief {
  message: string
}

export function generateDailyBrief(tasks: TaskWithSubtasks[]): DailyBrief {
  if (!tasks || tasks.length === 0) {
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    if (isWeekend) {
      return { message: "No meetings, no deadlines today. Take some time to recharge." }
    }
    return { message: "Nothing is scheduled today. It might be the perfect opportunity to tackle that side project you've been putting off." }
  }

  // 1. Group tasks by category
  const categoryCounts = tasks.reduce((acc, task) => {
    // If task_category isn't provided yet or doesn't match our dict, default to 'task'
    const cat = task.task_category?.name?.toLowerCase() || 'task';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Format into text like "3 work tasks", "1 grocery run"
  const parts = Object.entries(categoryCounts).map(([cat, count]) => {
    const text = CATEGORY_TEXT[cat] || (count === 1 ? 'task' : 'tasks');
    // If it's a known mapping, we can use it. If count is 1 we should ideally singularize,
    // but the dictionary provided by user makes it a bit tricky. We'll do a simple fallback.
    const cleanText = count === 1 && text.endsWith('s') && !text.endsWith('ss')
      ? text.slice(0, -1)
      : text;

    // Instead of raw numbers, maybe "a" or "one" for 1?
    // Let's use bolded numbers for visual emphasis as requested: **3 work tasks**
    const numberStr = count === 1 ? (cat === 'meeting' ? 'a meeting' : `one`) : count.toString();

    // For 1 meeting: "a meeting". For 1 work task: "one work task".
    if (count === 1 && cat === 'meeting') {
        return `**a meeting**`;
    }
    return `**${numberStr} ${cleanText}**`;
  });

  const listFormatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
  let tasksSummary = `You have ${listFormatter.format(parts)} today.`;

  // Check if they are all completed
  const completedCount = tasks.filter(t => t.is_done).length;
  if (completedCount === tasks.length) {
    tasksSummary = `You've already completed **all ${tasks.length} tasks today**.`;
  } else if (completedCount > 0 && tasks.length - completedCount === 1) {
    tasksSummary = `You've already completed **${completedCount} tasks today**. Only **one thing** remains.`;
  }

  // 2. Find free time (latest task)
  let freeTimeMessage = "";
  const tasksWithTime = tasks.filter(t => t.time);

  if (tasksWithTime.length > 0) {
    // Basic time parsing (assuming "HH:MM" format like "15:30")
    const sortedTimes = tasksWithTime.map(t => {
      const [h, m] = t.time!.split(':').map(Number);
      return h * 60 + m; // minutes since midnight
    }).sort((a, b) => a - b);

    const lastTaskMinutes = sortedTimes[sortedTimes.length - 1];

    // Format back to 12-hour AM/PM
    const date = new Date();
    date.setHours(Math.floor(lastTaskMinutes / 60), lastTaskMinutes % 60);

    // Add 1 hour roughly for the task duration to find "free" time
    date.setHours(date.getHours() + 1);

    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    if (date.getHours() >= 20) {
      freeTimeMessage = " Looks like today's going to be a busy one.";
    } else {
      freeTimeMessage = ` **You're free after ${timeStr}.**`;
    }
  } else {
    freeTimeMessage = " Looks like your schedule is relatively open today.";
  }

  // 3. Pick random ending
  const randomEnding = ENDINGS[new Date().getDate() % ENDINGS.length];

  // 4. Determine Theme (Optional but cool)
  // If >50% of tasks are in a certain category
  let themeMessage = "";
  const maxCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  if (maxCategory && (maxCategory[1] / tasks.length) >= 0.5) {
      const cat = maxCategory[0];
      if (['work', 'meeting'].includes(cat)) themeMessage = " Looks like a work-focused day.";
      if (['shopping', 'groceries', 'errands'].includes(cat)) themeMessage = " Today's all about getting things done around town.";
      if (['social', 'family', 'date'].includes(cat)) themeMessage = " You've got a social day ahead.";
      if (['health', 'selfcare'].includes(cat)) themeMessage = " Today's a good day to focus on yourself.";
  }

  // Combine all parts
  if (completedCount > 0 && completedCount === tasks.length) {
    return { message: `${tasksSummary} Enjoy the rest of your day!` };
  }

  return {
    message: `${tasksSummary}${themeMessage}${freeTimeMessage} ${randomEnding}`
  }
}
