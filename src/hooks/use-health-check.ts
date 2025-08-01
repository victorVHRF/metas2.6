import { useQuery } from '@tanstack/react-query'

export interface DatabaseStatus {
  name: string
  status: 'connected' | 'error'
  tables: Array<{
    name: string
    schema?: string
  }>
  error?: string
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  databases: {
    mysql: DatabaseStatus
    postgresql: DatabaseStatus
  }
}

const fetchHealthCheck = async (): Promise<HealthCheckResponse> => {
  const response = await fetch('/api/health')
  
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`)
  }
  
  return response.json()
}

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health-check'],
    queryFn: fetchHealthCheck,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}