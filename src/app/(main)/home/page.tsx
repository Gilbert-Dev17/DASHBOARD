import DashboardPage from '@/components/home/dashboard'



const page = () => {

 const initialTasks = [
    {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d439",
      user_id: "user-123",
      task_name: "Buy groceries",
      task_category_id: "groceries",
      time: "10:00",
      is_done: false,
      created_for_date: "2026-07-04",
      created_at: "2026-07-04T08:00:00Z"
    },
    {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      user_id: "user-123",
      task_name: "Buy groceries",
      task_category_id: "groceries",
      time: "10:00",
      is_done: false,
      created_for_date: "2026-07-04",
      created_at: "2026-07-04T08:00:00Z"
    },
    {
      id: "a92bd12c-49aa-4183-b921-1f93c3d4e580",
      user_id: "user-123",
      task_name: "Meeting with John",
      task_category_id: "meeting",
      time: "14:30",
      is_done: true,
      created_for_date: "2026-07-04",
      created_at: "2026-07-04T09:00:00Z"
    },
    {
      id: "c83ef23d-12bb-5294-c832-2a84d4e5f691",
      user_id: "user-123",
      task_name: "Finish design mockups",
      task_category_id: "work",
      time: "16:00",
      is_done: false,
      created_for_date: "2026-07-04",
      created_at: "2026-07-04T10:00:00Z",
      subtasks: [
        {
          id: "s1-1234",
          task_id: "c83ef23d-12bb-5294-c832-2a84d4e5f691",
          subtask_name: "Design weather card",
          is_done: true,
          created_at: "2026-07-04T10:05:00Z"
        },
        {
          id: "s2-1234",
          task_id: "c83ef23d-12bb-5294-c832-2a84d4e5f691",
          subtask_name: "Design subtasks UI",
          is_done: false,
          created_at: "2026-07-04T10:10:00Z"
        }
      ]
    }]

// * conversion of meeting,task, and habit counts would be done when fetching from the backend.
  const user = {
    firstName: 'Gilbert',
    meetingsCount: 3,
    tasksCount: 6,
    habitsCount: 1,
    balance: 150250.75
  }


  return (
    <DashboardPage initialTasks={initialTasks} user={user} />
  )
}

export default page