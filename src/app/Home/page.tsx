'use client'

import React, {useState} from 'react'
import { CloudSun, CheckCircle2, Circle, Calendar, CheckSquare, Activity } from 'lucide-react'

const DashboardPage = () => {

  const [tasks, setTasks] = useState([
    { id: 1, text: "Wake up - 7:30 am", done: true, category: "Routine" },
    { id: 2, text: "Do Duolingo", done: true, category: "Routine" },
    { id: 3, text: "Workout: Chest + Back", done: true, category: "Health" },
    { id: 4, text: "Design Crit with Team", done: false, category: "Work", time: "10:00" },
    { id: 5, text: "Haircut with Vincent", done: false, category: "Personal", time: "13:00" },
    { id: 6, text: "Cleanup code & finish Auth", done: false, category: "Code: Re.Focus" }
  ]);

  return (
    <div className="max-w-6xl mx-auto animation-fade-in pb-20">
       <div className="mb-16 lg:mb-20">
          <div className="flex justify-between items-start mb-8 lg:mb-12">
            <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter leading-none flex items-end">
              Tue
              <div className="w-3 h-3 md:w-4 md:h-4 lg:w-6 lg:h-6 rounded-full ml-3 md:ml-5 mb-2 md:mb-4 lg:mb-6 transition-colors duration-500 bg-black" ></div>
            </h1>
          </div>

           <p className="text-2xl md:text-3xl lg:text-4xl leading-snug font-light max-w-4xl tracking-tight" >
                Good Morning, <span className="font-medium" >Gilbert</span>.
                You have <span className="inline-flex items-center gap-1 mx-1" ><Calendar size={24} /> 3 meetings</span>,
                <span className="inline-flex items-center gap-1 mx-1" ><CheckSquare size={24} />  tasks</span> and
                <span className="inline-flex items-center gap-1 mx-1" ><Activity size={24} /> 1 habit</span> today.
              </p>

         <div className="mt-16 p-6 lg:p-8 rounded-[2rem] border relative overflow-hidden flex flex-col md:flex-row gap-8 justify-between items-start md:items-center shadow-sm" >
            {/* <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full mix-blend-overlay opacity-10 blur-3xl transition-colors duration-500" ></div> */}
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500"><CloudSun size={32} /></div>
              <div>
                <h4 className="text-5xl font-light tracking-tighter mb-1" >33°C</h4>
                <p className="text-sm font-medium">Capas, Tarlac <span className="mx-2">•</span> Partly sunny</p>
              </div>
            </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          <div className="lg:col-span-7">
            <div className="flex justify-between items-end mb-6 lg:mb-8">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-500">Today's Agenda</h3>
            </div>
            <div className="flex flex-col">
              {tasks.map((task) => (
                <div key={task.id} className={`flex items-center justify-between py-5 lg:py-6 border-b border-dashed cursor-pointer group transition-all duration-300 ${task.done ? 'opacity-40' : 'hover:opacity-80'}`}>
                  <div className="flex items-center gap-4 lg:gap-6">
                    <button className={`focus:outline-none transition-colors`}>{task.done ? <CheckCircle2 size={22} /> : <Circle size={22}  />}</button>
                    <div className="flex flex-col gap-1">
                      <span className={`text-base lg:text-lg tracking-wide ${task.done ? 'line-through' : ''}`} >{task.text}</span>
                      <span className="text-[10px] lg:text-xs font-medium tracking-wider uppercase transition-colors duration-500">{task.category}</span>
                    </div>
                  </div>
                  {task.time && <span className="text-sm font-medium tabular-nums">{task.time}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-16 mt-8 lg:mt-0">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] mb-6 lg:mb-8 transition-colors duration-500">Finances</h3>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter tabular-nums mb-8" >$ 150,250<span className="text-3xl lg:text-4xl">.75</span></h3>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] mb-6 lg:mb-8 transition-colors duration-500" >Life Progress</h3>
              <div className="space-y-6 lg:space-y-8">
                {/* <ProgressBar label="Year" current={166} max={365} percentage={45} accentColor={accentColor} textColor={textColor} textColorMuted={textColorMuted} /> */}
                {/* <ProgressBar label="Month" current={15} max={30} percentage={50} accentColor={accentColor} textColor={textColor} textColorMuted={textColorMuted} /> */}
                {/* <ProgressBar label="Day" current={22} max={24} percentage={91} accentColor={accentColor} textColor={textColor} textColorMuted={textColorMuted} /> */}
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default DashboardPage