import { useQuery } from 'react-query';
import { getTasks } from '../api';
import { Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { StatusBadge, PriorityBadge } from '../components/shared/Badges';
import { useState } from 'react';
import TaskForm from '../components/tasks/TaskForm';

const Tasks = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all'); // all, mine
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading } = useQuery(['tasks', filter], async () => {
    const params = {};
    if (filter === 'mine') params.assignee = user._id;
    const res = await getTasks(params);
    return res.data.data;
  });

  if (isLoading) return <div className="text-white">Loading tasks...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header flex-col md:flex-row items-start md:items-center gap-4">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="text-dark-400 text-sm mt-1">View and manage tasks across all your projects.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-dark-900 border border-dark-800 rounded-lg p-1 hidden sm:flex">
            <button 
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-dark-800 text-white' : 'text-dark-400 hover:text-dark-200'}`}
              onClick={() => setFilter('all')}
            >
              All Tasks
            </button>
            <button 
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'mine' ? 'bg-dark-800 text-white' : 'text-dark-400 hover:text-dark-200'}`}
              onClick={() => setFilter('mine')}
            >
              My Tasks
            </button>
          </div>
          <button className="btn-primary w-full md:w-auto" onClick={() => setIsFormOpen(true)}>
            <Plus size={20} />
            Add Task
          </button>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-dark-800 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-dark-500" size={18} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="input-field pl-10 h-10 py-0"
            />
          </div>
          <button className="btn-secondary h-10">
            <Filter size={18} />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-900/50 border-b border-dark-800 text-dark-400 text-sm">
                <th className="px-6 py-4 font-medium">Task</th>
                <th className="px-6 py-4 font-medium">Project</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Assignee</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {data.map(task => (
                <tr key={task._id} className="hover:bg-dark-800/30 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium group-hover:text-primary-400 transition-colors">{task.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.project?.color || '#6366f1' }} />
                      <span className="text-dark-200 text-sm">{task.project?.name || 'Unknown Project'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-6 py-4">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold text-white">
                          {task.assignee.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-dark-200 text-sm">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-dark-500 text-sm italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-300">
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-dark-400">
                    No tasks found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TaskForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
};

export default Tasks;
