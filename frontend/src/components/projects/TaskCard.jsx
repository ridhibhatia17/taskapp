import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { format, isPast, isToday } from 'date-fns';
import { Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const priorityColors = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  HIGH: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const TaskCard = ({ task, index, onClick }) => {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'COMPLETED';

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={clsx(
            'bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border mb-3 cursor-pointer hover:shadow-md transition-shadow',
            snapshot.isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200 dark:border-gray-700',
            isOverdue ? 'border-l-4 border-l-red-500' : ''
          )}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className={clsx('font-medium text-sm line-clamp-2', task.status === 'COMPLETED' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100')}>
              {task.title}
            </h4>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', priorityColors[task.priority])}>
              {task.priority}
            </span>
            {isOverdue && (
              <span className="flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                Overdue
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              {task.dueDate && (
                <div className={clsx('flex items-center', isOverdue ? 'text-red-500 dark:text-red-400 font-medium' : '')}>
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {format(new Date(task.dueDate), 'MMM d')}
                </div>
              )}
              {task._count?.comments > 0 && (
                <div className="flex items-center">
                  <MessageSquare className="w-3.5 h-3.5 mr-1" />
                  {task._count.comments}
                </div>
              )}
            </div>
            
            {task.members?.length > 0 && (
              <div className="flex -space-x-1 overflow-hidden">
                {task.members.slice(0, 3).map((member, i) => (
                  <div 
                    key={member.userId} 
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-800 dark:text-blue-200"
                    title={member.user.name}
                  >
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {task.members.length > 3 && (
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                    +{task.members.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
