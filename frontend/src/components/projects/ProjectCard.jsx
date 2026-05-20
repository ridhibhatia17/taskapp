import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ListTodo } from 'lucide-react';
import { format } from 'date-fns';

const ProjectCard = ({ project }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1" title={project.title}>
            {project.title}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {project._count?.tasks || 0} Tasks
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2" title={project.description || 'No description'}>
          {project.description || <span className="italic text-gray-400 dark:text-gray-500">No description provided</span>}
        </p>

        <div className="space-y-2 mt-auto">
          {project.deadline && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>Deadline: {format(new Date(project.deadline), 'MMM d, yyyy')}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            <span>{project._count?.members || 0} Members</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="text-xs text-gray-400">Created by {project.creator?.name || 'Unknown'}</span>
          </div>
        </div>
      </div>
      
      <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 mt-auto rounded-b-lg">
        <Link 
          to={`/projects/${project.id}`}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <ListTodo className="w-4 h-4 mr-2" />
          View Project
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
