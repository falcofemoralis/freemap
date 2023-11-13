export class Processing {
  id: string;
  status: string;
}

export enum ProcessingStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}
