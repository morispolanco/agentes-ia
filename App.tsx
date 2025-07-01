
import React, { useState, useCallback } from 'react';
import { AgentStepLog, SubTask } from './types';
import { runOrchestrator, runExecutor, runFinalizer } from './services/geminiService';
import AgentStep from './components/AgentStep';
import MarkdownRenderer from './components/MarkdownRenderer';

const App: React.FC = () => {
  const [task, setTask] = useState<string>('');
  const [agentLogs, setAgentLogs] = useState<AgentStepLog[]>([]);
  const [finalResult, setFinalResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartTask = useCallback(async () => {
    if (!task || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAgentLogs([]);
    setFinalResult('');

    // Step 1: Orchestrator plans the task
    const orchestratorLogId = Date.now();
    setAgentLogs(prev => [...prev, {
      id: orchestratorLogId, agent: 'Orquestador', task: 'Analizando la solicitud y creando un plan...', status: 'pensando'
    }]);

    try {
      const subTasks = await runOrchestrator(task);
      setAgentLogs(prev => prev.map(log => log.id === orchestratorLogId ? { ...log, status: 'completado', result: `Plan creado con ${subTasks.length} pasos.` } : log));

      // Step 2: Execute sub-tasks sequentially
      const completedTaskResults: string[] = [];
      for (const subTask of subTasks) {
        const executorLogId = Date.now();
        setAgentLogs(prev => [...prev, {
          id: executorLogId, agent: subTask.agent, task: subTask.task, status: 'pensando'
        }]);
        
        const result = await runExecutor(subTask, completedTaskResults);
        completedTaskResults.push(`Resultado del agente ${subTask.agent} para la tarea "${subTask.task}":\n${result}`);
        
        setAgentLogs(prev => prev.map(log => log.id === executorLogId ? { ...log, status: 'completado', result: result } : log));
      }

      // Step 3: Finalizer compiles the report
      const finalizerLogId = Date.now();
      setAgentLogs(prev => [...prev, {
        id: finalizerLogId, agent: 'Finalizador', task: 'Compilando el informe final...', status: 'pensando'
      }]);

      const finalReport = await runFinalizer(completedTaskResults);
      setFinalResult(finalReport);
      setAgentLogs(prev => prev.map(log => log.id === finalizerLogId ? { ...log, status: 'completado', result: 'Informe final generado.' } : log));

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
      setError(errorMessage);
      setAgentLogs(prev => prev.map(log => log.status === 'pensando' ? { ...log, status: 'error', error: errorMessage } : log));
    } finally {
      setIsLoading(false);
    }
  }, [task, isLoading]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            Plataforma de Agentes Inteligentes
          </h1>
          <p className="mt-2 text-slate-400">
            Define una tarea y observa cómo nuestros agentes de IA colaboran para completarla.
          </p>
        </header>

        <div className="bg-slate-800/50 rounded-xl shadow-2xl shadow-slate-950/50 p-6 border border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Ej: Investigar el mercado de scooters eléctricos en Europa y generar un informe detallado sobre los principales competidores, la cuota de mercado y las tendencias futuras."
              className="flex-grow bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
              rows={4}
              disabled={isLoading}
            />
            <button
              onClick={handleStartTask}
              disabled={isLoading || !task}
              className="px-6 py-3 font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                'Iniciar Tarea'
              )}
            </button>
          </div>
           {error && <div className="mt-4 text-center bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg">{error}</div>}
        </div>

        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-slate-100 border-b border-slate-600 pb-2">Registro de Actividad de Agentes</h2>
            <div className="h-[60vh] overflow-y-auto pr-2">
              {agentLogs.length === 0 && !isLoading && (
                 <div className="text-center text-slate-500 pt-16">
                    <p>El registro de actividad aparecerá aquí.</p>
                 </div>
              )}
              {agentLogs.map((log) => <AgentStep key={log.id} log={log} />)}
            </div>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
             <h2 className="text-2xl font-bold mb-4 text-slate-100 border-b border-slate-600 pb-2">Informe Final</h2>
              <div className="h-[60vh] overflow-y-auto pr-2">
              {isLoading && !finalResult && (
                  <div className="text-center text-slate-500 pt-16">
                     <p>Generando informe final...</p>
                  </div>
              )}
              {!isLoading && !finalResult && (
                  <div className="text-center text-slate-500 pt-16">
                     <p>El informe final aparecerá aquí cuando la tarea se complete.</p>
                  </div>
              )}
              {finalResult && <MarkdownRenderer content={finalResult} />}
              </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default App;
