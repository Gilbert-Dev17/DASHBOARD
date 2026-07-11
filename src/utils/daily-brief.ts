import { TaskWithSubtasks } from '@/types/dashboard'
import { CATEGORY_LABELS, TaskCategory } from '@/lib/constants/tasks'

const ENDINGS = [
  "Let's make today count.",
  "You've got this.",
  "One task at a time.",
  "Let's get to it.",
  "Small progress is still progress.",
  "Stay focused.",
  "Time to build momentum.",
  "Ready when you are.",
  "Let's cross some items off.",
  "Keep up the great work.",
  "Focus on the step in front of you.",
  "A productive day awaits.",
  "Let's make things happen.",
  "Take it easy, but take it.",
  "Pace yourself.",
  "Let's clear the board.",
  "Time to execute.",
  "Step by step.",
  "Let's dive in.",
  "Good luck today.",
  "Make it a good one.",
  "Here is to a productive day.",
  "Let's get things done.",
  "Focus on what matters.",
  "Keep the momentum going.",
  "Consistency is key.",
  "Let's tackle this list.",
  "Trust the process.",
  "Forward motion, always.",
  "Let's conquer the day.",
  "Have a fantastic day ahead."
]

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

  const completedCount = tasks.filter(t => t.is_done).length;
  const incompleteTasks = tasks.filter(t => !t.is_done);

  // 1. Group ONLY incomplete tasks by category
  const categoryCounts = incompleteTasks.reduce((acc, task) => {
    // If task_category isn't provided yet or doesn't match our dict, default to 'task'
    const cat = task.task_category?.name?.toLowerCase() || 'task';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Format into text dynamically using the global constants
  const parts = Object.entries(categoryCounts).map(([cat, count]) => {
    // Special grammatical cases for events
    if (cat === 'meeting') return count === 1 ? '**a meeting**' : `**${count} meetings**`;
    if (cat === 'appointments' || cat === 'appointment') return count === 1 ? '**an appointment**' : `**${count} appointments**`;

    // Default fallback: "3 health tasks", "one work task"
    const label = CATEGORY_LABELS[cat as TaskCategory] || cat;
    const taskWord = count === 1 ? 'task' : 'tasks';
    const numberStr = count === 1 ? 'one' : count.toString();

    return `**${numberStr} ${label.toLowerCase()} ${taskWord}**`;
  });

  const listFormatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
  const remainingListStr = listFormatter.format(parts);

  let tasksSummary = "";

  if (completedCount === tasks.length) {
    tasksSummary = `You've already completed **all ${tasks.length} tasks today**.`;
  } else if (completedCount > 0 && incompleteTasks.length === 1) {
    tasksSummary = `You've already completed **${completedCount} ${completedCount === 1 ? 'task' : 'tasks'} today**. Only **one thing** remains.`;
  } else if (completedCount > 0) {
    tasksSummary = `You've completed **${completedCount} ${completedCount === 1 ? 'task' : 'tasks'}** so far, leaving ${remainingListStr} remaining today.`;
  } else {
    tasksSummary = `You have ${remainingListStr} today.`;
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
      freeTimeMessage = " It's going to be a busy one.";
    } else {
      freeTimeMessage = ` **You're free after ${timeStr}.**`;
    }
  } else {
    freeTimeMessage = " Your schedule is relatively open.";
  }

  // 3. Pick random ending
  const randomEnding = ENDINGS[new Date().getDate() % ENDINGS.length];

  // 4. Determine Theme (Aggregate categories into broader themes)
  let themeMessage = "";

  const THEMES: Record<string, { categories: string[], message: string }> = {
    deep_work: {
      categories: ['work', 'education'],
      message: " Looks like a day for deep focus."
    },
    errands: {
      categories: ['shopping', 'groceries', 'errands', 'home', 'maintenance'],
      message: " Today is all about running errands."
    },
    wellness: {
      categories: ['health', 'selfcare', 'personal', 'hobbies'],
      message: " Great to see you prioritizing yourself today."
    },
    structured: {
      categories: ['routine', 'appointments'],
      message: " Your day is highly structured."
    },
    social: {
      categories: ['social', 'family', 'date'],
      message: " You've got a social day ahead!"
    },
    admin: {
      categories: ['finance', 'bills'],
      message: " Looks like an admin day."
    },
    travel: {
      categories: ['travel'],
      message: " Safe travels today!"
    },
    pets: {
      categories: ['pets'],
      message: " Give the furry friends some love today."
    }
  };

  const themeCounts: Record<string, number> = {};

  // Map tasks to their umbrella theme
  tasks.forEach(task => {
    const cat = task.task_category?.name?.toLowerCase() || 'task';
    for (const [themeKey, themeData] of Object.entries(THEMES)) {
      if (themeData.categories.includes(cat)) {
        themeCounts[themeKey] = (themeCounts[themeKey] || 0) + 1;
        break; // A category only belongs to one theme
      }
    }
  });

  // If a single umbrella theme makes up >= 50% of the day, append its message
  const maxTheme = Object.entries(themeCounts).sort((a, b) => b[1] - a[1])[0];
  if (maxTheme && (maxTheme[1] / tasks.length) >= 0.5) {
      themeMessage = THEMES[maxTheme[0]].message;
  }

  // Combine all parts
  if (completedCount > 0 && completedCount === tasks.length) {
    return { message: `${tasksSummary} Enjoy the rest of your day!` };
  }

  return {
    message: `${tasksSummary} ${themeMessage} \n ${freeTimeMessage} ${randomEnding}`
  }
}
