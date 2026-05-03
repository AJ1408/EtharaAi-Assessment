import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { createTask, getProjects, getProject, getUsers } from '../../api';
import toast from 'react-hot-toast';
import Modal from '../shared/Modal';
import { Calendar, Flag, Info, FolderKanban, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TaskForm = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignee: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  });

  const { data: projectsData, isLoading: loadingProjects } = useQuery('projectsList', async () => {
    const res = await getProjects();
    return res.data.data;
  }, { enabled: isOpen });

  const { data: selectedProject } = useQuery(['projectMembers', formData.project], async () => {
    if (!formData.project) return null;
    const res = await getProject(formData.project);
    return res.data.data;
  }, { enabled: !!formData.project && !isAdmin });

  // For admins: fetch all users
  const { data: allUsers } = useQuery('adminUsersList', async () => {
    const res = await getUsers();
    return res.data.data;
  }, { enabled: isOpen && isAdmin });

  useEffect(() => {
    // Select first project automatically if not set and projects are loaded
    if (projectsData?.length > 0 && !formData.project) {
      setFormData(prev => ({ ...prev, project: projectsData[0]._id }));
    }
  }, [projectsData, formData.project]);

  const mutation = useMutation(createTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
      queryClient.invalidateQueries('dashboardStats');
      queryClient.invalidateQueries('projects');
      toast.success('Task created successfully');
      setFormData({
        title: '', description: '', project: projectsData?.[0]?._id || '', 
        assignee: '', status: 'todo', priority: 'medium', dueDate: ''
      });
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Task title is required');
    if (!formData.project) return toast.error('Please select a project');
    mutation.mutate(formData);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Task Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className="input-field" placeholder="e.g. Implement Login API" autoFocus />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Project *</label>
            <div className="relative">
              <FolderKanban className="absolute left-3 top-2.5 text-dark-500" size={18} />
              <select name="project" value={formData.project} onChange={handleChange} className="input-field pl-10 appearance-none bg-dark-800" disabled={loadingProjects}>
                <option value="">Select a project...</option>
                {projectsData?.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Assignee</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-dark-500" size={18} />
              <select name="assignee" value={formData.assignee} onChange={handleChange} className="input-field pl-10 appearance-none bg-dark-800" disabled={(!selectedProject && !isAdmin)}>
                <option value="">Unassigned</option>
                {isAdmin ? (
                  allUsers?.map(u => (
                    <option key={u._id} value={u._id}>{u.name} {u.role === 'admin' ? '(Admin)' : ''}</option>
                  ))
                ) : (
                  selectedProject?.members?.map(m => (
                    <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <div className="relative">
            <Info className="absolute left-3 top-3 text-dark-500" size={18} />
            <textarea name="description" value={formData.description} onChange={handleChange} className="input-field pl-10 min-h-[80px] py-2.5" placeholder="Detailed description..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div>
            <label className="label">Status</label>
            <div className="relative">
              <CheckCircle2 className="absolute left-3 top-2.5 text-dark-500" size={18} />
              <select name="status" value={formData.status} onChange={handleChange} className="input-field pl-10 appearance-none bg-dark-800">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Priority</label>
            <div className="relative">
              <Flag className="absolute left-3 top-2.5 text-dark-500" size={18} />
              <select name="priority" value={formData.priority} onChange={handleChange} className="input-field pl-10 appearance-none bg-dark-800">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Due Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-dark-500" size={18} />
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="input-field pl-10" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-800 mt-6">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={mutation.isLoading} className="btn-primary">
            {mutation.isLoading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
