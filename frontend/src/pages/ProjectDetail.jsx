import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, Edit, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Skeleton from '../components/common/Skeleton';
import ProjectModal from '../components/projects/ProjectModal';
import MemberManagementModal from '../components/projects/MemberManagementModal';
import KanbanBoard from '../components/projects/KanbanBoard';
import ConfirmModal from '../components/common/ConfirmModal';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch project details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete project');
      setIsDeleting(false);
      setIsConfirmDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-8" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      <button 
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Created by {project.creator?.name} on {format(new Date(project.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
          
          {user?.role === 'ADMIN' && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Users className="-ml-1 mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                Manage Members
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Edit className="-ml-1 mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                Edit
              </button>
              <button
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="-ml-1 mr-2 h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
        
        <div className="px-6 py-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-300 uppercase tracking-wider mb-2">Description</h3>
          <p className="text-gray-700 dark:text-gray-400 whitespace-pre-wrap mb-8">
            {project.description || <span className="italic text-gray-400 dark:text-gray-500">No description provided</span>}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-700 flex items-start">
              <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Deadline</h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {project.deadline ? format(new Date(project.deadline), 'MMMM d, yyyy') : 'No deadline set'}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-700 flex items-start">
              <Users className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Team Members</h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {project.members?.length || 0} active members
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <KanbanBoard projectId={project.id} projectMembers={project.members} />

      {isEditModalOpen && (
        <ProjectModal
          projectToEdit={project}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchProject}
        />
      )}

      {isMemberModalOpen && (
        <MemberManagementModal
          projectId={project.id}
          members={project.members}
          onClose={() => setIsMemberModalOpen(false)}
          onSuccess={fetchProject}
        />
      )}
      
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.title}"? All associated tasks, members, and comments will be permanently removed. This action cannot be undone.`}
        confirmText="Delete Project"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProjectDetail;
