import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import TaskDetailModal from './TaskDetailModal';

const KanbanBoard = ({ projectId, projectMembers }) => {
  const [tasks, setTasks] = useState({
    TODO: [],
    IN_PROGRESS: [],
    COMPLETED: []
  });
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectId}/tasks`);
      
      const grouped = {
        TODO: [],
        IN_PROGRESS: [],
        COMPLETED: []
      };
      
      res.data.forEach(task => {
        if (grouped[task.status]) {
          grouped[task.status].push(task);
        }
      });
      
      setTasks(grouped);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    
    // Optimistic UI update
    const sourceCol = [...tasks[sourceStatus]];
    const destCol = sourceStatus === destStatus ? sourceCol : [...tasks[destStatus]];
    
    const [movedTask] = sourceCol.splice(source.index, 1);
    movedTask.status = destStatus;
    destCol.splice(destination.index, 0, movedTask);
    
    setTasks({
      ...tasks,
      [sourceStatus]: sourceCol,
      [destStatus]: destCol
    });

    try {
      // Only hit API if status actually changed
      if (sourceStatus !== destStatus) {
        await api.patch(`/tasks/${draggableId}/status`, { status: destStatus });
      }
    } catch (error) {
      toast.error('Failed to update task status');
      fetchTasks(); // Revert on failure
    }
  };

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenTaskDetail = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleEditTask = (task) => {
    setIsDetailModalOpen(false);
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'bg-gray-100' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-50' },
    { id: 'COMPLETED', title: 'Completed', color: 'bg-green-50' }
  ];

  if (loading) {
    return <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Task Board</h2>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {columns.map(column => (
            <div key={column.id} className={`flex-1 min-w-[300px] w-full rounded-lg ${column.color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">{column.title}</h3>
                <span className="bg-white text-gray-600 text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                  {tasks[column.id].length}
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] transition-colors rounded-md ${snapshot.isDraggingOver ? 'bg-blue-100/50' : ''}`}
                  >
                    {tasks[column.id].map((task, index) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        index={index} 
                        onClick={() => handleOpenTaskDetail(task)}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {isTaskModalOpen && (
        <TaskModal
          projectId={projectId}
          projectMembers={projectMembers}
          taskToEdit={taskToEdit}
          onClose={() => setIsTaskModalOpen(false)}
          onSuccess={fetchTasks}
        />
      )}

      {isDetailModalOpen && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={() => handleEditTask(selectedTask)}
          onDeleteSuccess={() => {
            setIsDetailModalOpen(false);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
