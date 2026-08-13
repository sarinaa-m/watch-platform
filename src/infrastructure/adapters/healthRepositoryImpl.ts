import { httpClient } from '@infra/api/httpClient';
import type { HealthResponse } from '@domain/health';

export const createHealthRepository = () => ({
  async getHealth(): Promise<HealthResponse> {
    return httpClient.get<HealthResponse>('/health');
  },
});

export const healthRepository = createHealthRepository();
