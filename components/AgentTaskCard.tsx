import React from 'react';
import { SubTask, TaskStatus } from '../types.ts';
import { CheckCircleIcon, CogIcon, HourglassIcon, XCircleIcon } from './Icons.tsx';

interface AgentTaskCardProps {
  task: SubTask;
}

const statusConfig = {
  [TaskStatus.Pending]: {
    Icon: HourglassIcon,
    color: 'text-gray-400',
    bgColor: 'bg-gray-700/20',
    label: 'Pendiente',
  },
  [TaskStatus.InProgress]: {
    Icon: CogIcon,
    color: 'text-brand-primary',
    bgColor: 'bg-blue-900/30',
    label: 'En Progreso',
  },
  [TaskStatus.Completed]: {
    Icon: CheckCircleIcon,
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
    label: 'Completado',
  },
  [TaskStatus.Failed]: {
    Icon: XCircleIcon,
    color: 'text-red-400',
    bgColor: 'bg-red-900/30',
    label: 'Fallido',
  },
};

const AgentTaskCard: React.FC<AgentTaskCardProps> = ({ task }) => {
  const { Icon, color, bgColor, label } = statusConfig[task.status];
  const isProcessing = task.status === TaskStatus.InProgress;

  return (
    <div className={`animate-fade-in p-4 rounded-lg border border-gray-700 transition-all duration-300 ${bgColor}`}>
      <div className="flex items-start gap-4">
        <div className={`mt-1 flex-shrink-0 ${color}`}>
            <Icon className={`w-6 h-6 ${isProcessing ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-200">{`Tarea ${task.id}: ${label}`}</h4>
          </div>
          <p className="text-gray-400 mt-1">{task.description}</p>
          {task.result && (
            <div className="mt-3 p-3 bg-gray-900/50 rounded-md border border-gray-600">
              <p className="text-sm font-semibold text-brand-secondary">Resultado del Agente:</p>
              <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap font-mono">{task.result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentTaskCard;