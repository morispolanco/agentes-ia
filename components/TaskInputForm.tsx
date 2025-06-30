import React, { useState } from 'react';
import { BrainCircuitIcon } from './Icons.tsx';

interface TaskInputFormProps {
  onSubmit: (task: string) => void;
  isLoading: boolean;
}

const TaskInputForm: React.FC<TaskInputFormProps> = ({ onSubmit, isLoading }) => {
  const [task, setTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim() && !isLoading) {
      onSubmit(task);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-brand-surface rounded-xl p-8 border border-gray-700 shadow-2xl shadow-brand-primary/10">
        <div className="flex items-center gap-4 mb-4">
            <BrainCircuitIcon className="w-10 h-10 text-brand-primary"/>
            <h2 className="text-2xl font-bold text-gray-100">Describe tu Objetivo</h2>
        </div>
        
        <p className="text-gray-400 mb-6">
          Escribe la tarea compleja que quieres que los agentes inteligentes realicen. La desglosarán en sub-tareas y las ejecutarán secuencialmente.
        </p>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Ej: 'Investigar el mercado de patinetes eléctricos en Sudamérica y crear un informe resumido.'"
          className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition text-gray-200 placeholder-gray-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !task.trim()}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-sky-400 disabled:bg-gray-600 text-gray-900 font-bold py-3 px-4 rounded-md transition-all duration-300 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20 hover:shadow-sky-400/30"
        >
          {isLoading ? 'Analizando...' : 'Iniciar Tarea'}
          {isLoading && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default TaskInputForm;