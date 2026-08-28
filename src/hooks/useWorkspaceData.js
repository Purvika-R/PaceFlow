import { useCallback, useEffect, useState } from 'react';
import { workspaceApi } from '../services/api';

const displayStatus = { todo: 'Todo', 'in-progress': 'In Progress', done: 'Done', active: 'In Progress', completed: 'Completed', archived: 'Archived' };
const titleCase = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);
const initials = (person) => person?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'PR';
const formatDate = (date) => date ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(date)) : 'No due date';

export function useWorkspaceData() {
  const [state, setState] = useState({ loading: true, error: '', users: [], projects: [], tasks: [] });
  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const [users, rawProjects, rawTasks] = await Promise.all([workspaceApi.getUsers(), workspaceApi.getProjects(), workspaceApi.getTasks()]);
      const tasks = rawTasks.map((task) => ({ ...task, id: task._id, project: task.project?.name || 'Unassigned project', assignee: task.assignee?.name || 'Unassigned', status: displayStatus[task.status] || task.status, priority: titleCase(task.priority), dueDate: formatDate(task.dueDate), rawProjectId: task.project?._id || task.project }));
      const projects = rawProjects.map((project) => {
        const projectTasks = tasks.filter((task) => task.rawProjectId === project._id);
        const completedTasks = projectTasks.filter((task) => task.status === 'Done').length;
        const dueDates = projectTasks.map((task) => task.dueDate).filter((date) => date !== 'No due date');
        return { ...project, id: project._id, status: displayStatus[project.status] || project.status, totalTasks: projectTasks.length, completedTasks, progress: projectTasks.length ? Math.round((completedTasks / projectTasks.length) * 100) : 0, priority: projectTasks.some((task) => task.priority === 'High') ? 'High' : projectTasks.some((task) => task.priority === 'Medium') ? 'Medium' : 'Low', dueDate: dueDates[0] || 'No due date', members: [initials(project.owner)] };
      });
      setState({ loading: false, error: '', users, projects, tasks });
    } catch (error) {
      setState({ loading: false, error: error.message, users: [], projects: [], tasks: [] });
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  const mutate = async (action) => {
    try { const result = await action(); await load(); return result; } catch (error) { setState((current) => ({ ...current, error: error.message })); throw error; }
  };
  return {
    ...state, reload: load,
    createProject: (data) => mutate(() => workspaceApi.createProject(data)),
    updateProject: (id, data) => mutate(() => workspaceApi.updateProject(id, data)),
    deleteProject: (id) => mutate(() => workspaceApi.deleteProject(id)),
    createTask: (data) => mutate(() => workspaceApi.createTask(data)),
    updateTask: (id, data) => mutate(() => workspaceApi.updateTask(id, data)),
    deleteTask: (id) => mutate(() => workspaceApi.deleteTask(id)),
    updateTaskStatus: (id, status) => mutate(() => workspaceApi.updateTaskStatus(id, status)),
  };
}
