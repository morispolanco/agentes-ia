
import React, { useState } from 'react';
import { AgentStepLog, AgentStatus } from '../types';
import { AgentIcon, LoadingSpinner } from './icons';
import MarkdownRenderer from './MarkdownRenderer';

interface AgentStepProps {
  log: AgentStepLog;
}

const statusStyles: { [key in AgentStatus]: { border: string, bg: string, text: string } } = {
  pendiente: { border: 'border-slate-600', bg: 'bg-slate-800', text: 'text-slate-400' },
  pensando: { border: 'border-blue-500', bg: 'bg-blue-900/50', text: 'text-blue-300' },
  completado: { border: 'border-green-500', bg: 'bg-green-900/50', text: 'text-green-300' },
  error: { border: 'border-red-500', bg: 'bg-red-900/50', text: 'text-red-300' },
};

const AgentStep: React.FC<AgentStepProps> = ({ log }) => {
  const [isExpanded, setIsExpanded] = useState(log.status === 'completado');
  const style = statusStyles[log.status];

  return (
    <div className={`border-l-4 ${style.border} ${style.bg} rounded-r-lg mb-3 transition-all duration-300`}>
      <div className="p-4 flex items-center gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.bg} border ${style.border}`}>
            {log.status === 'pensando' ? <LoadingSpinner /> : <AgentIcon agent={log.agent} />}
        </div>
        <div className="flex-grow">
          <div className="font-bold text-slate-100">{log.agent}</div>
          <p className="text-sm text-slate-400 italic">"{log.task}"</p>
        </div>
        {log.result && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-full hover:bg-slate-700 transition">
             <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      {(isExpanded && log.result) && (
        <div className="border-t border-slate-700 p-4 bg-slate-900/50 rounded-b-lg">
          <h4 className="text-sm font-semibold text-slate-400 mb-2">Resultado:</h4>
          <MarkdownRenderer content={log.result} />
        </div>
      )}
       {log.status === 'error' && log.error && (
        <div className="border-t border-red-700 p-4 bg-red-900/50">
          <h4 className="text-sm font-semibold text-red-300 mb-2">Error:</h4>
          <p className="text-red-300">{log.error}</p>
        </div>
      )}
    </div>
  );
};

export default AgentStep;
