
export type AgentType = 'Orquestador' | 'Investigador' | 'Analista' | 'Escritor' | 'Finalizador';

export type AgentStatus = 'pendiente' | 'pensando' | 'completado' | 'error';

export interface SubTask {
  agent: AgentType;
  task: string;
}

export interface AgentStepLog {
  id: number;
  agent: AgentType;
  task: string;
  status: AgentStatus;
  result?: string;
  error?: string;
}
