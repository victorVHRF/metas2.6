'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useHealthCheck } from '@/hooks/use-health-check'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HealthPage() {
  const { data: health, isLoading, error, refetch, isFetching } = useHealthCheck()

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando status do sistema...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao carregar status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!health) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Nenhum dado disponível</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Status do Sistema</h1>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          disabled={isFetching}
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Atualizar
        </Button>
      </div>
      
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Status Geral da API</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge 
            variant={health.status === 'healthy' ? 'default' : 'destructive'}
          >
            {health.status === 'healthy' ? 'Saudável' : 'Com Problemas'}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">
            Última verificação: {new Date(health.timestamp).toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Atualização automática a cada 30 segundos
          </p>
        </CardContent>
      </Card>

      {/* Status dos Bancos de Dados */}
      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(health.databases).map(([key, database]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {database.name}
                <Badge 
                  variant={database.status === 'connected' ? 'default' : 'destructive'}
                >
                  {database.status === 'connected' ? 'Conectado' : 'Desconectado'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {database.status === 'error' && database.error && (
                <div className="text-red-600 text-sm mb-4 p-2 bg-red-50 rounded">
                  <strong>Erro:</strong> {database.error}
                </div>
              )}
              
              {database.tables.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tabelas ({database.tables.length})</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome da Tabela</TableHead>
                        {database.tables[0].schema && <TableHead>Schema</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {database.tables.map((table, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">
                            {table.name}
                          </TableCell>
                          {table.schema && (
                            <TableCell className="text-sm text-muted-foreground">
                              {table.schema}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {database.tables.length === 0 && database.status === 'connected' && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma tabela encontrada
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}