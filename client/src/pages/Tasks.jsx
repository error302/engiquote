import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { tasksApi, projectsApi } from '../services/api';

const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        tasksApi.getAll(filterProject ? { projectId: filterProject } : {}),
        projectsApi.getAll()
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterProject, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await tasksApi.update(editingTask.id, formData);
      } else {
        await tasksApi.create(formData);
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({ projectId: '', title: '', description: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '' });
      loadData();
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      projectId: task.projectId,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this task?')) {
      try {
        await tasksApi.delete(id);
        loadData();
      } catch (error) {
        alert('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await tasksApi.update(task.id, { status: newStatus });
      loadData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="text-green-500" size={16} />;
      case 'IN_PROGRESS': return <Clock className="text-blue-500" size={16} />;
      case 'CANCELLED': return <X className="text-gray-400" size={16} />;
      default: return <AlertCircle className="text-amber-500" size={16} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'CANCELLED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const filteredTasks = tasks.filter(task => 
    !filterStatus || task.status === filterStatus
  );

  const tasksByStatus = {
    PENDING: filteredTasks.filter(t => t.status === 'PENDING'),
    IN_PROGRESS: filteredTasks.filter(t => t.status === 'IN_PROGRESS'),
    COMPLETED: filteredTasks.filter(t => t.status === 'COMPLETED')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Task Management</h1>
        <button onClick={() => { setEditingTask(null); setFormData({ projectId: projects[0]?.id || '', title: '', description: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '' }); setShowModal(true); }} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light">
          <Plus size={20} /> New Task
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
          className="border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">All Statuses</option>
          {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map(status => (
          <div key={status} className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b dark:border-gray-700">
              <h3 className="font-semibold dark:text-white flex items-center gap-2">
                {getStatusIcon(status)}
                {status.replace('_', ' ')}
                <span className="text-sm text-gray-500">({tasksByStatus[status].length})</span>
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {tasksByStatus[status].map(task => (
                <div key={task.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(task)} className="text-gray-400 hover:text-primary"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(task.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <h4 className="font-medium dark:text-white">{task.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.project?.name}</p>
                  {task.dueDate && (
                    <p className="text-xs text-gray-400 mt-2">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  )}
                  {status !== 'COMPLETED' && status !== 'CANCELLED' && (
                    <select
                      value={task.status}
                      onChange={e => handleStatusChange(task, e.target.value)}
                      className="mt-2 text-xs border rounded px-2 py-1 w-full dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  )}
                </div>
              ))}
              {tasksByStatus[status].length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setShowModal(false)}><X size={24} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Project *</label>
                <select
                  required
                  value={formData.projectId}
                  onChange={e => setFormData({...formData, projectId: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-200">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-200">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg dark:text-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
