import React, { useState, useEffect, useCallback } from 'react';
import { SubTask, TaskStatus } from './types.ts';
import * as geminiService from './services/geminiService.ts';
import TaskInputForm from './components/TaskInputForm.tsx';
import AgentTaskCard from './components/AgentTaskCard.tsx';
import Spinner from './components/Spinner.tsx';

const App: React.FC = () => {
    const [mainTask, setMainTask] = useState<string>('');
    const [subTasks, setSubTasks] = useState<SubTask[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [finalReport, setFinalReport] = useState<string | null>(null);
    const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);

    const resetState = () => {
        setMainTask('');
        setSubTasks([]);
        setIsLoading(false);
        setIsProcessing(false);
        setError(null);
        setFinalReport(null);
        setCurrentTaskIndex(0);
    };

    const handleStartTask = async (task: string) => {
        resetState();
        setIsLoading(true);
        setError(null);
        setMainTask(task);
        try {
            const tasks = await geminiService.breakdownTask(task);
            setSubTasks(tasks.map((desc, i) => ({
                id: i + 1,
                description: desc,
                status: TaskStatus.Pending,
            })));
            setIsProcessing(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Ocurrió un error desconocido.');
        } finally {
            setIsLoading(false);
        }
    };

    const processSingleTask = useCallback(async (index: number) => {
        setSubTasks(prev => prev.map((task, i) => i === index ? { ...task, status: TaskStatus.InProgress } : task));

        try {
            const context = subTasks
                .slice(0, index)
                .map(t => `Resultado de '${t.description}': ${t.result}`)
                .join('\n');
            
            const result = await geminiService.executeTask(subTasks[index].description, context);

            setSubTasks(prev => prev.map((task, i) => i === index ? { ...task, status: TaskStatus.Completed, result } : task));
            setCurrentTaskIndex(index + 1);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Error desconocido al ejecutar la tarea.';
            setError(`Fallo en la Tarea ${index + 1}: ${errorMessage}`);
            setSubTasks(prev => prev.map((task, i) => i === index ? { ...task, status: TaskStatus.Failed, result: errorMessage } : task));
            setIsProcessing(false);
        }
    }, [subTasks]);

    useEffect(() => {
        if (isProcessing && currentTaskIndex < subTasks.length) {
            const timeoutId = setTimeout(() => {
                processSingleTask(currentTaskIndex);
            }, 1000); // Small delay for better UX
            return () => clearTimeout(timeoutId);
        }
        
        if (isProcessing && currentTaskIndex === subTasks.length && subTasks.length > 0) {
            const allCompleted = subTasks.every(t => t.status === TaskStatus.Completed);
            if(allCompleted) {
                generateFinalReport();
            } else {
                 setIsProcessing(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isProcessing, currentTaskIndex, subTasks.length]);
    
    const generateFinalReport = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const results = subTasks.map(t => `Tarea: ${t.description}\nResultado: ${t.result || 'N/A'}`);
            const report = await geminiService.summarizeResults(mainTask, results);
            setFinalReport(report);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo generar el informe final.');
        } finally {
            setIsLoading(false);
            setIsProcessing(false);
        }
    }, [mainTask, subTasks]);

    return (
        <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
                    Plataforma de Agentes Inteligentes
                </h1>
                <p className="mt-2 text-lg text-gray-400">IA autónoma para tareas complejas</p>
            </header>
            
            <main className="container mx-auto max-w-5xl">
                {!mainTask && !isProcessing && (
                    <TaskInputForm onSubmit={handleStartTask} isLoading={isLoading} />
                )}

                {isLoading && subTasks.length === 0 && (
                    <div className="flex justify-center mt-12">
                        <Spinner text="Desglosando la tarea principal..." className="w-16 h-16"/>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg my-4">
                        <h3 className="font-bold">Ha ocurrido un error</h3>
                        <p>{error}</p>
                    </div>
                )}

                {subTasks.length > 0 && (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-brand-surface border border-gray-700 p-6 rounded-xl">
                            <h2 className="text-xl font-bold text-gray-200">Objetivo Principal</h2>
                            <p className="text-gray-300 mt-2">{mainTask}</p>
                        </div>
                        
                        <div className="space-y-4">
                            {subTasks.map(task => <AgentTaskCard key={task.id} task={task} />)}
                        </div>

                        {isLoading && finalReport === null && (
                            <div className="flex justify-center pt-8">
                                <Spinner text="Generando informe final..." className="w-12 h-12" />
                            </div>
                        )}

                        {finalReport && (
                            <div className="animate-fade-in mt-8 bg-brand-surface border border-brand-secondary/50 p-6 rounded-xl shadow-2xl shadow-brand-secondary/10">
                                <h2 className="text-2xl font-bold text-brand-secondary mb-4">Informe Final</h2>
                                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">{finalReport}</div>
                            </div>
                        )}
                        
                        {(!isProcessing || finalReport) && (
                           <div className="text-center pt-6">
                               <button 
                                   onClick={resetState}
                                   className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                                   Iniciar Nueva Tarea
                               </button>
                           </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;