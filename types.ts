export enum TaskStatus {
  Pending = 'pending',
  InProgress = 'in-progress',
  Completed = 'completed',
  Failed = 'failed',
}

export interface SubTask {
  id: number;
  description: string;
  status: TaskStatus;
  result?: string;
}
