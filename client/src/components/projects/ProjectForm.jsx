import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { createProject } from '../../api';
import toast from 'react-hot-toast';
import Modal from '../shared/Modal';
import { Calendar, Tag, Info, Flag, Palette } from 'lucide-react';

const ProjectForm = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    priority: 'medium',
    color: '#6366f1',
    tags: ''
  });

  const mutation = useMutation(createProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('projects');
      queryClient.invalidateQueries('dashboardStats');
      toast.success('Project created successfully');
      setFormData({ name: '', description: '', deadline: '', priority: 'medium', color: '#6366f1', tags: '' });
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Project name is required');
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    mutation.mutate(payload);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Project Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="e.g. Website Redesign" autoFocus />
        </div>
        
        <div>
          <label className="label">Description</label>
          <div className="relative">
            <Info className="absolute left-3 top-3 text-dark-500" size={18} />
            <textarea name="description" value={formData.description} onChange={handleChange} className="input-field pl-10 min-h-[100px] py-2.5" placeholder="What is this project about?" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Deadline</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-dark-500" size={18} />
              <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="input-field pl-10" />
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
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
            <label className="label">Tags (comma separated)</label>
            <div className="relative">
              <Tag className="absolute left-3 top-2.5 text-dark-500" size={18} />
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="input-field pl-10" placeholder="frontend, design" />
            </div>
          </div>
          <div>
            <label className="label">Theme Color</label>
            <div className="relative flex items-center gap-3">
               <Palette className="absolute left-3 top-2.5 text-dark-500" size={18} />
               <input type="color" name="color" value={formData.color} onChange={handleChange} className="input-field pl-10 h-11 p-1 cursor-pointer" />
               <div className="w-8 h-8 rounded-full border border-dark-600 flex-shrink-0" style={{ backgroundColor: formData.color }} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-800 mt-6">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={mutation.isLoading} className="btn-primary">
            {mutation.isLoading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectForm;
