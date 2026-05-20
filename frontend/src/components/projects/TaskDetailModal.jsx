import React, { useState, useEffect } from 'react';
import { X, Edit, Trash2, Calendar, MessageSquare, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import ConfirmModal from '../common/ConfirmModal';

const priorityColors = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  HIGH: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const TaskDetailModal = ({ task, onClose, onEdit, onDeleteSuccess }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [task.id]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/tasks/${task.id}/comments`);
      setComments(res.data);
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/tasks/${task.id}`);
      toast.success('Task deleted');
      onDeleteSuccess();
    } catch (error) {
      toast.error('Failed to delete task');
      setIsDeleting(false);
      setIsConfirmDeleteOpen(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsPosting(true);
      await api.post(`/tasks/${task.id}/comments`, { message: newComment });
      setNewComment('');
      fetchComments(); // Refresh comments
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900/80 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200 dark:border-gray-700">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex flex-col md:flex-row gap-6">
            
            {/* Left Column: Task Details */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white" id="modal-title">
                  {task.title}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 md:hidden">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className={clsx('px-2.5 py-0.5 rounded text-xs font-medium', priorityColors[task.priority])}>
                  Priority: {task.priority}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  Status: {task.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-100 dark:border-gray-700 min-h-[80px]">
                  {task.description || <span className="italic text-gray-400 dark:text-gray-600">No description provided</span>}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Due Date</h4>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Assignees</h4>
                  {task.members?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {task.members.map(member => (
                        <span key={member.userId} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {member.user.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-500 italic">Unassigned</span>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" />
                  Comments
                </h4>
                
                <form onSubmit={handleAddComment} className="mb-6 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isPosting || !newComment.trim()}
                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>

                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {loadingComments ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" /></div>
                  ) : comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{comment.user.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column: Actions */}
            <div className="w-full md:w-48 flex flex-col gap-3 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
              <button onClick={onClose} className="hidden md:flex self-end text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 mb-2">
                <X className="h-5 w-5" />
              </button>
              
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Actions</h4>
              
              <button
                onClick={onEdit}
                className="w-full inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Edit className="-ml-0.5 mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                Edit Task
              </button>
              
              {(user?.role === 'ADMIN' || user?.id === task.createdBy) && (
                <button
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="w-full inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                >
                  <Trash2 className="-ml-0.5 mr-2 h-4 w-4" />
                  Delete Task
                </button>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
    <ConfirmModal
      isOpen={isConfirmDeleteOpen}
      onClose={() => setIsConfirmDeleteOpen(false)}
      onConfirm={handleDelete}
      title="Delete Task"
      message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
      confirmText="Delete Task"
      isLoading={isDeleting}
    />
    </>
  );
};

export default TaskDetailModal;
